import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // Check if database is configured
    if (!isDatabaseConfigured() || !sql) {
      // In demo mode, accept demo tokens
      if (token.startsWith("demo-token-")) {
        return NextResponse.json({ valid: true })
      }
      return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }

    // Check if token exists and is not expired
    const tokens = await sql`
      SELECT 
        prt.id,
        prt.user_id,
        prt.expires_at,
        prt.used_at,
        u.email
      FROM password_reset_tokens prt
      JOIN users u ON prt.user_id = u.id
      WHERE prt.token = ${token}
        AND prt.expires_at > NOW()
        AND prt.used_at IS NULL
    `

    if (tokens.length === 0) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error("Verify reset token error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
