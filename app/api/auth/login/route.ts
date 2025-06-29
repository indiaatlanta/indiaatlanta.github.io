import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "hs1-careers-matrix-secret-key-2024-change-in-production"

// Demo users for when database is not configured
const DEMO_USERS = [
  {
    id: 1,
    email: "admin@henryscheinone.com",
    password: "admin123",
    name: "Demo Admin",
    role: "admin",
    department: "IT",
  },
  {
    id: 2,
    email: "manager@henryscheinone.com",
    password: "manager123",
    name: "Demo Manager",
    role: "manager",
    department: "Engineering",
  },
  {
    id: 3,
    email: "user@henryscheinone.com",
    password: "user123",
    name: "Demo User",
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

    if (!isDatabaseConfigured() || !sql) {
      // Demo mode - use hardcoded users
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
    } else {
      // Database mode
      try {
        const users = await sql`
          SELECT id, email, password_hash, name, role, department
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
      } catch (dbError) {
        console.error("Database error during login:", dbError)
        // Fall back to demo mode on database error
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
