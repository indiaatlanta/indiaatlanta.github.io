import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { verifyPassword, createSession } from "@/lib/auth"
import { loginSchema } from "@/lib/validation"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    // Check if database is configured
    if (!isDatabaseConfigured() || !sql) {
      // In demo mode, allow login with demo credentials
      if (email === "admin@henryscheinone.com" && password === "admin123") {
        // Return success for demo mode
        return NextResponse.json({
          user: {
            id: 1,
            email: "admin@henryscheinone.com",
            name: "Demo Admin",
            role: "admin",
          },
        })
      } else {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }
    }

    // Find user by email
    const users = await sql`
      SELECT id, email, password_hash, name, role
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
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
