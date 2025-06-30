import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token is required", valid: false }, { status: 400 })
    }

    if (!isDatabaseConfigured()) {
      // For demo purposes, accept any token that looks like a UUID
      const isValidFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)
      return NextResponse.json({ valid: isValidFormat })
    }

    const tokens = await sql!`
      SELECT prt.*, u.email 
      FROM password_reset_tokens prt
      JOIN users u ON prt.user_id = u.id
      WHERE prt.token = ${token} 
        AND prt.expires_at > CURRENT_TIMESTAMP 
        AND prt.used = FALSE
    `

    if (tokens.length === 0) {
      return NextResponse.json({ error: "Invalid or expired token", valid: false }, { status: 400 })
    }

    return NextResponse.json({ valid: true, email: tokens[0].email })
  } catch (error) {
    console.error("Verify reset token error:", error)
    return NextResponse.json({ error: "Internal server error", valid: false }, { status: 500 })
  }
}
