import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit"
import { z } from "zod"

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = resetPasswordSchema.parse(body)

    // Check if database is configured
    if (!isDatabaseConfigured() || !sql) {
      // In demo mode, simulate password reset
      if (token.startsWith("demo-token-")) {
        console.log(`[DEMO MODE] Password reset completed for demo token: ${token}`)
        return NextResponse.json({ message: "Password reset successful" })
      }
      return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }

    // Find valid reset token
    const tokens = await sql`
      SELECT 
        prt.id,
        prt.user_id,
        prt.expires_at,
        prt.used_at,
        u.email,
        u.name
      FROM password_reset_tokens prt
      JOIN users u ON prt.user_id = u.id
      WHERE prt.token = ${token}
        AND prt.expires_at > NOW()
        AND prt.used_at IS NULL
    `

    if (tokens.length === 0) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    const tokenData = tokens[0]

    // Hash the new password
    const hashedPassword = await hashPassword(password)

    // Update user's password
    await sql`
      UPDATE users
      SET password_hash = ${hashedPassword}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${tokenData.user_id}
    `

    // Mark token as used
    await sql`
      UPDATE password_reset_tokens
      SET used_at = CURRENT_TIMESTAMP
      WHERE id = ${tokenData.id}
    `

    // Create audit log
    try {
      await createAuditLog({
        userId: tokenData.user_id,
        tableName: "users",
        recordId: tokenData.user_id,
        action: "UPDATE",
        oldValues: { action: "password_reset_requested" },
        newValues: { action: "password_reset_completed" },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
      // Don't fail the password reset if audit logging fails
    }

    console.log(`Password reset completed for user: ${tokenData.email}`)

    return NextResponse.json({ message: "Password reset successful" })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
