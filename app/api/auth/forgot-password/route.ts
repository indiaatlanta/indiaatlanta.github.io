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

    // Always return success to prevent email enumeration
    const successResponse = NextResponse.json({
      success: true,
      message: "If an account with that email exists, we've sent you a password reset link.",
    })

    // Check if database is configured
    if (!isDatabaseConfigured() || !sql) {
      console.log("[FORGOT PASSWORD] Database not configured, using demo mode")

      console.log(`Demo mode: Password reset requested for ${email}`)
      return successResponse
    }

    console.log("[FORGOT PASSWORD] Database is configured, checking tables...")

    try {
      // Check if password_reset_tokens table exists
      await sql`SELECT 1 FROM password_reset_tokens LIMIT 1`
      console.log("[FORGOT PASSWORD] password_reset_tokens table exists")
    } catch (tableError) {
      console.log("[FORGOT PASSWORD] password_reset_tokens table doesn't exist, treating as demo mode")
      console.error("[FORGOT PASSWORD] Table error:", tableError)

      console.log(`Demo mode: Password reset requested for ${email}`)
      return successResponse
    }

    console.log("[FORGOT PASSWORD] Looking up user by email...")

    // Find user by email
    const users = await sql`
      SELECT id, email
      FROM users
      WHERE email = ${email.toLowerCase()}
    `

    console.log(`[FORGOT PASSWORD] Found ${users.length} users with email ${email}`)

    if (users.length === 0) {
      console.log("[FORGOT PASSWORD] No user found with that email")

      // Return success even if user doesn't exist to prevent email enumeration
      return successResponse
    }

    const user = users[0]
    console.log(`[FORGOT PASSWORD] User found: ${user.email} (ID: ${user.id})`)

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
    const emailResult = await sendPasswordResetEmail(user.email, resetToken)

    if (!emailResult.success) {
      console.error("Failed to send password reset email:", emailResult.error)
      // Still return success to prevent email enumeration
    }

    console.log(`[FORGOT PASSWORD] Password reset email sent to: ${user.email}`)
    return successResponse
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

    return NextResponse.json(
      {
        error: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 },
    )
  }
}
