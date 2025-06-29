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
        // Create a demo session
        const sessionId = "demo-admin-session"
        const response = NextResponse.json({
          user: {
            id: 1,
            email: "admin@henryscheinone.com",
            name: "Demo Admin",
            role: "admin",
          },
        })

        // Set session cookie
        response.cookies.set("session", sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60, // 7 days
        })

        return response
      } else if (email === "manager@henryscheinone.com" && password === "manager123") {
        const sessionId = "demo-manager-session"
        const response = NextResponse.json({
          user: {
            id: 2,
            email: "manager@henryscheinone.com",
            name: "Demo Manager",
            role: "manager",
          },
        })

        response.cookies.set("session", sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60,
        })

        return response
      } else if (email === "user@henryscheinone.com" && password === "user123") {
        const sessionId = "demo-user-session"
        const response = NextResponse.json({
          user: {
            id: 3,
            email: "user@henryscheinone.com",
            name: "Demo User",
            role: "user",
          },
        })

        response.cookies.set("session", sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60,
        })

        return response
      } else {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }
    }

    // Find user by email
    const users = await sql`
      SELECT id, email, password_hash, name, role, manager_id, department_id, job_title, hire_date, is_active
      FROM users
      WHERE email = ${email} AND is_active = true
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
        manager_id: user.manager_id,
        department_id: user.department_id,
        job_title: user.job_title,
        hire_date: user.hire_date,
        is_active: user.is_active,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
