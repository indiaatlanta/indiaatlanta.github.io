import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
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
      console.log(`[DEMO MODE] Password reset requested for: ${email}`)
      console.log(
        `[DEMO MODE] Reset link: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=demo-token-${Date.now()}`,
      )

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

    // In a real application, you would send an email here
    // For now, we'll log the reset link to the console
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`

    console.log(`Password reset requested for: ${email}`)
    console.log(`Reset link: ${resetUrl}`)
    console.log(`This link expires at: ${expiresAt.toISOString()}`)

    // TODO: Implement actual email sending
    // await sendPasswordResetEmail(user.email, user.name, resetUrl)

    return NextResponse.json({ message: successMessage })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
