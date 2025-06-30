import { type NextRequest, NextResponse } from "next/server"
import { verifyPassword, createSession } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // If database is not configured, use demo credentials
    if (!isDatabaseConfigured() || !sql) {
      // Demo mode - accept any credentials and create a demo session
      const sessionId = await createSession(1) // Demo user ID
      return NextResponse.json({ success: true })
    }

    // Find user by email
    const users = await sql`
      SELECT id, email, name, role, password_hash
      FROM users
      WHERE email = ${email}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const user = users[0]

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create session
    await createSession(user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
