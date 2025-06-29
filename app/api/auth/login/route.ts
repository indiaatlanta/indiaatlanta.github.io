import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { sql, isDatabaseConfigured } from "@/lib/db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// Demo users for when database is not configured
const DEMO_USERS = [
  {
    id: 1,
    email: "admin@henryscheinone.com",
    password: "admin123",
    role: "admin",
    name: "Admin User",
    department: "IT",
  },
  {
    id: 2,
    email: "manager@henryscheinone.com",
    password: "manager123",
    role: "manager",
    name: "Manager User",
    department: "Engineering",
  },
  {
    id: 3,
    email: "user@henryscheinone.com",
    password: "user123",
    role: "user",
    name: "Regular User",
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
      // Use demo users
      const demoUser = DEMO_USERS.find((u) => u.email === email && u.password === password)
      if (!demoUser) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }
      user = demoUser
    } else {
      // Use database
      try {
        const users = await sql`
          SELECT id, email, password_hash, role, name, department
          FROM users 
          WHERE email = ${email} AND active = true
        `

        if (users.length === 0) {
          return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
        }

        const dbUser = users[0]
        const isValidPassword = await bcrypt.compare(password, dbUser.password_hash)

        if (!isValidPassword) {
          return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
        }

        user = {
          id: dbUser.id,
          email: dbUser.email,
          role: dbUser.role,
          name: dbUser.name,
          department: dbUser.department,
        }
      } catch (error) {
        console.error("Database error during login:", error)
        return NextResponse.json({ error: "Authentication service unavailable" }, { status: 500 })
      }
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        department: user.department,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        department: user.department,
      },
    })

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400, // 24 hours
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
