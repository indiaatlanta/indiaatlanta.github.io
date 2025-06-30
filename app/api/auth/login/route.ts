import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { verifyPassword, createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Check if database is configured
    if (!isDatabaseConfigured() || !sql) {
      // Demo mode - check against hardcoded credentials
      const demoUsers = {
        "admin@henryscheinone.com": { id: 1, name: "Demo Admin", role: "admin", password: "admin123" },
        "user@henryscheinone.com": { id: 2, name: "Demo User", role: "user", password: "user123" },
      }

      const demoUser = demoUsers[email as keyof typeof demoUsers]
      if (!demoUser || demoUser.password !== password) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      // Create demo session
      await createSession(demoUser.id)

      return NextResponse.json({
        user: {
          id: demoUser.id,
          email,
          name: demoUser.name,
          role: demoUser.role,
        },
      })
    }

    // Database mode - query actual users table
    try {
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

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      })
    } catch (dbError) {
      console.error("Database login error:", dbError)
      return NextResponse.json({ error: "Login failed" }, { status: 500 })
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
