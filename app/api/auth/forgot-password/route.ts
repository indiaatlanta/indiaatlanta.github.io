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
    console.log("[FORGOT PASSWORD] Starting password reset process...")

    const body = await request.json()
    console.log("[FORGOT PASSWORD] Request body received")

    const { email } = forgotPasswordSchema.parse(body)
    console.log(`[FORGOT PASSWORD] Email validated: ${email}`)

    // Check if database is configured
    if (!isDatabaseConfigured() || !sql) {
      console.log("[FORGOT PASSWORD] Database not configured, using demo mode")

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=demo-token-${Date.now()}`

      console.log(`[DEMO MODE] Password reset requested for: ${email}`)
      console.log(`[DEMO MODE] Reset link: ${resetUrl}`)

      // Try to send email even in demo mode
      try {
        const emailSent = await sendPasswordResetEmail(email, "Demo User", resetUrl)
        console.log(`[DEMO MODE] Email send result: ${emailSent}`)
      } catch (emailError) {
        console.error("[DEMO MODE] Email error:", emailError)
        // Don't fail the request if email fails
      }

      return NextResponse.json({
        message: "If an account with that email exists, we've sent you a password reset link.",
      })
    }

    console.log("[FORGOT PASSWORD] Database is configured, checking tables...")

    try {
      // Check if password_reset_tokens table exists
      await sql`SELECT 1 FROM password_reset_tokens LIMIT 1`
      console.log("[FORGOT PASSWORD] password_reset_tokens table exists")
    } catch (tableError) {
      console.log("[FORGOT PASSWORD] password_reset_tokens table doesn't exist, treating as demo mode")
      console.error("[FORGOT PASSWORD] Table error:", tableError)

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=demo-token-${Date.now()}`

      console.log(`[DEMO MODE - No Table] Password reset requested for: ${email}`)
      console.log(`[DEMO MODE - No Table] Reset link: ${resetUrl}`)

      // Try to send email even without table
      try {
        const emailSent = await sendPasswordResetEmail(email, "Demo User", resetUrl)
        console.log(`[DEMO MODE - No Table] Email send result: ${emailSent}`)
      } catch (emailError) {
        console.error("[DEMO MODE - No Table] Email error:", emailError)
      }

      return NextResponse.json({
        message: "If an account with that email exists, we've sent you a password reset link.",
      })
    }

    console.log("[FORGOT PASSWORD] Looking up user by email...")

    // Find user by email
    const users = await sql`
      SELECT id, email, name
      FROM users
      WHERE email = ${email}
    `

    console.log(`[FORGOT PASSWORD] Found ${users.length} users with email ${email}`)

    // Always return success message for security (don't reveal if email exists)
    const successMessage = "If an account with that email exists, we've sent you a password reset link."

    if (users.length === 0) {
      console.log("[FORGOT PASSWORD] No user found with that email")

      // Still try to send email for security (won't reveal if email exists)
      // But use a dummy token that won't work
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=invalid-${Date.now()}`

      try {
        await sendPasswordResetEmail(email, "User", resetUrl)
        console.log("[FORGOT PASSWORD] Dummy email sent for non-existent user")
      } catch (emailError) {
        console.error("[FORGOT PASSWORD] Dummy email error:", emailError)
      }

      return NextResponse.json({ message: successMessage })
    }

    const user = users[0]
    console.log(`[FORGOT PASSWORD] User found: ${user.name} (ID: ${user.id})`)

    // Generate reset token
    const resetToken = uuidv4()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    console.log(`[FORGOT PASSWORD] Generated reset token: ${resetToken}`)
    console.log(`[FORGOT PASSWORD] Token expires at: ${expiresAt.toISOString()}`)

    // Store reset token in database
    try {
      await sql`
        INSERT INTO password_reset_tokens (user_id, token, expires_at)
        VALUES (${user.id}, ${resetToken}, ${expiresAt})
      `
      console.log("[FORGOT PASSWORD] Reset token stored in database")
    } catch (dbError) {
      console.error("[FORGOT PASSWORD] Database insert error:", dbError)
      throw new Error(`Failed to store reset token: ${dbError.message}`)
    }

    // Send password reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`
    console.log(`[FORGOT PASSWORD] Reset URL: ${resetUrl}`)

    try {
      const emailSent = await sendPasswordResetEmail(user.email, user.name, resetUrl)
      console.log(`[FORGOT PASSWORD] Email send result: ${emailSent}`)

      if (emailSent) {
        console.log(`[FORGOT PASSWORD] Password reset email sent successfully to: ${email}`)
      } else {
        console.log(
          `[FORGOT PASSWORD] Password reset email failed to send to: ${email}, but reset link logged to console`,
        )
        console.log(`[FORGOT PASSWORD] Reset link: ${resetUrl}`)
        console.log(`[FORGOT PASSWORD] This link expires at: ${expiresAt.toISOString()}`)
      }
    } catch (emailError) {
      console.error("[FORGOT PASSWORD] Email sending error:", emailError)
      // Don't fail the request if email fails, just log the link
      console.log(`[FORGOT PASSWORD] Fallback - Reset link: ${resetUrl}`)
    }

    console.log("[FORGOT PASSWORD] Process completed successfully")
    return NextResponse.json({ message: successMessage })
  } catch (error) {
    console.error("[FORGOT PASSWORD] Unexpected error:", error)
    console.error("[FORGOT PASSWORD] Error stack:", error.stack)

    // If it's a validation error, return specific message
    if (error instanceof z.ZodError) {
      console.error("[FORGOT PASSWORD] Validation error:", error.errors)
      return NextResponse.json(
        {
          error: "Invalid email format",
        },
        { status: 400 },
      )
    }

    // If it's a database-related error, fall back to demo mode
    if (
      error instanceof Error &&
      ((error.message.includes("relation") && error.message.includes("does not exist")) ||
        error.message.includes("database") ||
        error.message.includes("connection"))
    ) {
      console.log("[FORGOT PASSWORD] Database error detected, falling back to demo mode")

      try {
        const body = await request.json()
        const { email } = body

        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=demo-token-${Date.now()}`

        console.log(`[DEMO MODE - DB Error] Password reset requested for: ${email}`)
        console.log(`[DEMO MODE - DB Error] Reset link: ${resetUrl}`)

        // Try to send email even on error
        try {
          await sendPasswordResetEmail(email, "Demo User", resetUrl)
        } catch (emailError) {
          console.error("[DEMO MODE - DB Error] Email error:", emailError)
        }

        return NextResponse.json({
          message: "If an account with that email exists, we've sent you a password reset link.",
        })
      } catch (fallbackError) {
        console.error("[FORGOT PASSWORD] Fallback error:", fallbackError)
      }
    }

    return NextResponse.json(
      {
        error: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 },
    )
  }
}
