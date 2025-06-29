import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { sql, isDatabaseConfigured } from "@/lib/db"

const JWT_SECRET = process.env.JWT_SECRET || "hs1-careers-matrix-secret-key-2024-change-in-production"

// Demo users with hashed passwords
const DEMO_USERS = [
  {
    id: 1,
    email: "admin@henryscheinone.com",
    name: "Admin User",
    role: "admin",
    department: "IT",
    password: "admin123", // In production, this would be hashed
  },
  {
    id: 2,
    email: "manager@henryscheinone.com",
    name: "Manager User",
    role: "manager",
    department: "Engineering",
    password: "manager123",
  },
  {
    id: 3,
    email: "user@henryscheinone.com",
    name: "Regular User",
    role: "user",
    department: "Engineering",
    password: "user123",
  },
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    let user = null

    // Check if database is configured
    if (isDatabaseConfigured() && sql) {
      try {
        // Try to find user in database
        const users = await sql`
          SELECT id, email, name, role, department, password_hash
          FROM users 
          WHERE email = ${email} AND active = true
        `

        if (users.length > 0) {
          const dbUser = users[0]
          const isValidPassword = await bcrypt.compare(password, dbUser.password_hash)

          if (isValidPassword) {
            user = {
              id: dbUser.id,
              email: dbUser.email,
              name: dbUser.name,
              role: dbUser.role,
              department: dbUser.department,
            }
          }
        }
      } catch (error) {
        console.error("Database login error:", error)
        // Fall back to demo users
      }
    }

    // If no database user found, check demo users
    if (!user) {
      const demoUser = DEMO_USERS.find((u) => u.email === email && u.password === password)

      if (demoUser) {
        user = {
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role,
          department: demoUser.department,
        }
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
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

    // Create response with user data
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

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
