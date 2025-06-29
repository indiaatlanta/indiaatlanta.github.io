import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { verifyPassword } from "@/lib/auth"

const JWT_SECRET = process.env.JWT_SECRET || "hs1-careers-matrix-secret-key-2024-change-in-production"

// Demo users for authentication
const DEMO_USERS = [
  {
    id: 1,
    email: "admin@henryscheinone.com",
    password: "admin123",
    name: "Admin User",
    role: "admin",
    department: "IT",
  },
  {
    id: 2,
    email: "manager@henryscheinone.com",
    password: "manager123",
    name: "Manager User",
    role: "manager",
    department: "Engineering",
  },
  {
    id: 3,
    email: "user@henryscheinone.com",
    password: "user123",
    name: "Regular User",
    role: "user",
    department: "Engineering",
  },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    let user = null

    // Check if database is configured
    if (!isDatabaseConfigured() || !sql) {
      // Demo mode - check against demo users
      const demoUser = DEMO_USERS.find((u) => u.email === email)
      if (demoUser && demoUser.password === password) {
        user = {
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role,
          department: demoUser.department,
        }
      }
    } else {
      // Database mode - check against database
      const users = await sql`
        SELECT id, email, name, role, password_hash, department, manager_id
        FROM users 
        WHERE email = ${email} AND active = true
      `

      if (users.length > 0) {
        const dbUser = users[0]
        const isValidPassword = await verifyPassword(password, dbUser.password_hash)

        if (isValidPassword) {
          user = {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role,
            department: dbUser.department,
            manager_id: dbUser.manager_id,
          }
        }
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    )

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
      },
    })

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
