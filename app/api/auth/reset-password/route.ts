import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    if (!isDatabaseConfigured()) {
      // For demo purposes, just return success
      return NextResponse.json({ success: true, message: "Password reset successfully (demo mode)" })
    }

    // Verify token and get user
    const tokens = await sql!`
      SELECT prt.*, u.id as user_id, u.email 
      FROM password_reset_tokens prt
      JOIN users u ON prt.user_id = u.id
      WHERE prt.token = ${token} 
        AND prt.expires_at > CURRENT_TIMESTAMP 
        AND prt.used = FALSE
    `

    if (tokens.length === 0) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    const tokenData = tokens[0]

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update user password
    await sql!`
      UPDATE users 
      SET password_hash = ${hashedPassword}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${tokenData.user_id}
    `

    // Mark token as used
    await sql!`
      UPDATE password_reset_tokens 
      SET used = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${tokenData.id}
    `

    console.log(`Password reset successfully for user: ${tokenData.email}`)

    return NextResponse.json({ success: true, message: "Password reset successfully" })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
