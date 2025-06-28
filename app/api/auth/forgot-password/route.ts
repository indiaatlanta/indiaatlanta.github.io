import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { sendPasswordResetEmail } from "@/lib/email"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    // Check if database is configured
    if (!isDatabaseConfigured() || !sql) {
      // In demo mode, simulate sending email
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=demo-token-${Date.now()}`

      console.log(`[DEMO MODE] Password reset requested for: ${email}`)
      console.log(`[DEMO MODE] Reset link: ${resetUrl}`)

      // Try to send email even in demo mode
      await sendPasswordResetEmail(email, "Demo User", resetUrl)

      return NextResponse.json({
        message: "If an account with that email exists, we've sent you a password reset link.",
      })
    }

    try {
      // Check if password_reset_tokens table exists
      await sql`SELECT 1 FROM password_reset_tokens LIMIT 1`
    } catch (tableError) {
      // Table doesn't exist, treat as demo mode
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=demo-token-${Date.now()}`

      console.log(`[DEMO MODE - No Table] Password reset requested for: ${email}`)
      console.log(`[DEMO MODE - No Table] Reset link: ${resetUrl}`)

      // Try to send email even without table
      await sendPasswordResetEmail(email, "Demo User", resetUrl)

      return NextResponse.json({
        message: "If an account with that email exists, we've sent you a password reset link.",
      })
    }

    // Find user by email
    const users = await sql`
      SELECT id, email, name
      FROM users
      WHERE email = ${email}
    `

    // Always return success message for security (don't reveal if email exists)
    const successMessage = "If an account with that email exists, we've sent you a password reset link."

    if (users.length === 0) {
      // Still try to send email for security (won't reveal if email exists)
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=invalid-${Date.now()}`
      await sendPasswordResetEmail(email, "User", resetUrl)

      return NextResponse.json({ message: successMessage })
    }

    const user = users[0]

    // Generate reset token
    const resetToken = uuidv4()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Store reset token in database
    await sql`
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (${user.id}, ${resetToken}, ${expiresAt})
    `

    // Send password reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`

    const emailSent = await sendPasswordResetEmail(user.email, user.name, resetUrl)

    if (emailSent) {
      console.log(`Password reset email sent successfully to: ${email}`)
    } else {
      console.log(`Password reset email failed to send to: ${email}, but reset link logged to console`)
      console.log(`Reset link: ${resetUrl}`)
      console.log(`This link expires at: ${expiresAt.toISOString()}`)
    }

    return NextResponse.json({ message: successMessage })
  } catch (error) {
    console.error("Forgot password error:", error)

    // If it's a database-related error, fall back to demo mode
    if (error instanceof Error && error.message.includes("relation") && error.message.includes("does not exist")) {
      const body = await request.json()
      const { email } = body

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=demo-token-${Date.now()}`

      console.log(`[DEMO MODE - DB Error] Password reset requested for: ${email}`)
      console.log(`[DEMO MODE - DB Error] Reset link: ${resetUrl}`)

      // Try to send email even on error
      await sendPasswordResetEmail(email, "Demo User", resetUrl)

      return NextResponse.json({
        message: "If an account with that email exists, we've sent you a password reset link.",
      })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
