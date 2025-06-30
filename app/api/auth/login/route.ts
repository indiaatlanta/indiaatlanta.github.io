import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    console.log("Login attempt for:", email)

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Demo users for fallback
    const demoUsers = [
      { email: "admin@henryscheinone.com", password: "admin123", name: "Admin User", role: "admin", id: 1 },
      { email: "user@henryscheinone.com", password: "user123", name: "Regular User", role: "user", id: 2 },
      { email: "manager@henryscheinone.com", password: "manager123", name: "Manager User", role: "admin", id: 3 },
      { email: "john.smith@henryscheinone.com", password: "password123", name: "John Smith", role: "user", id: 4 },
      { email: "jane.doe@henryscheinone.com", password: "password123", name: "Jane Doe", role: "user", id: 5 },
    ]

    // Check if database is configured
    if (!isDatabaseConfigured() || !sql) {
      console.log("Database not configured, using demo mode")

      const demoUser = demoUsers.find((u) => u.email === email && u.password === password)

      if (!demoUser) {
        console.log("Demo login failed for:", email)
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      // Create demo session (cookie only)
      const sessionId = uuidv4()
      const cookieStore = await cookies()

      cookieStore.set("session", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      })

      console.log("Demo login successful for:", email)
      return NextResponse.json({
        success: true,
        user: {
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role,
        },
      })
    }

    try {
      // Database authentication
      console.log("Attempting database authentication for:", email)

      const users = await sql`
        SELECT id, email, name, role, password_hash 
        FROM users 
        WHERE email = ${email}
      `

      if (users.length === 0) {
        console.log("User not found in database:", email)
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      const user = users[0]
      console.log("User found in database:", { id: user.id, email: user.email, role: user.role })

      // Direct password comparison (since we're using plain text now)
      if (user.password_hash !== password) {
        console.log("Password verification failed for user:", email)
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      // Create session (cookie only for now, database session optional)
      const sessionId = uuidv4()
      const cookieStore = await cookies()

      cookieStore.set("session", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      })

      // Try to store session in database if user_sessions table exists
      try {
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        await sql`
          INSERT INTO user_sessions (id, user_id, expires_at)
          VALUES (${sessionId}, ${user.id}, ${expiresAt})
          ON CONFLICT (id) DO UPDATE SET
            user_id = EXCLUDED.user_id,
            expires_at = EXCLUDED.expires_at
        `
        console.log("Session stored in database for user:", email)
      } catch (sessionError) {
        console.log("Could not store session in database (table may not exist):", sessionError.message)
        // Continue without database session storage
      }

      console.log("Database login successful for:", email, "Session ID:", sessionId)

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name || "User",
          role: user.role,
        },
      })
    } catch (dbError) {
      console.error("Database login error:", dbError)

      // Fallback to demo authentication if database fails
      console.log("Falling back to demo authentication")

      const demoUser = demoUsers.find((u) => u.email === email && u.password === password)

      if (!demoUser) {
        console.log("Demo fallback login failed for:", email)
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      // Create demo session
      const sessionId = uuidv4()
      const cookieStore = await cookies()

      cookieStore.set("session", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      })

      console.log("Demo fallback login successful for:", email)
      return NextResponse.json({
        success: true,
        user: {
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role,
        },
      })
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
