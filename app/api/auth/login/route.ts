import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Check if database is available
    let isDemoMode = false
    let user = null

    try {
      // Try to query the database
      const users = await sql`
        SELECT id, name, email, password_hash, role, created_at 
        FROM users 
        WHERE email = ${email} AND active = true
      `

      if (users.length > 0) {
        const dbUser = users[0]
        const isValidPassword = await bcrypt.compare(password, dbUser.password_hash)

        if (isValidPassword) {
          user = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
          }
        }
      }
    } catch (dbError) {
      console.log("Database unavailable, checking demo credentials")
      isDemoMode = true

      // Demo credentials
      const demoUsers = [
        { id: "demo-admin", name: "Admin User", email: "admin@demo.com", password: "admin123", role: "admin" },
        { id: "demo-user", name: "Demo User", email: "user@demo.com", password: "user123", role: "user" },
      ]

      const demoUser = demoUsers.find((u) => u.email === email && u.password === password)
      if (demoUser) {
        user = {
          id: demoUser.id,
          name: demoUser.name,
          email: demoUser.email,
          role: demoUser.role,
        }
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create session
    const sessionToken = uuidv4()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    if (!isDemoMode) {
      try {
        // Store session in database
        await sql`
          INSERT INTO user_sessions (id, user_id, expires_at, created_at)
          VALUES (${sessionToken}, ${user.id}, ${expiresAt}, NOW())
        `
      } catch (sessionError) {
        console.error("Failed to create database session:", sessionError)
        // Continue with demo mode session
        isDemoMode = true
      }
    }

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      user,
      isDemoMode,
    })

    response.cookies.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
