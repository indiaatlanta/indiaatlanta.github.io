import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { sql, isDatabaseConfigured } from "@/lib/db"

const JWT_SECRET = process.env.JWT_SECRET || "hs1-careers-matrix-secret-key-2024-change-in-production"

// Demo users for when database is not configured
const DEMO_USERS = [
  {
    id: 1,
    email: "admin@henryscheinone.com",
    password: "admin123",
    name: "Admin User",
    role: "admin",
    department: "IT",
    job_title: "System Administrator",
  },
  {
    id: 2,
    email: "manager@henryscheinone.com",
    password: "manager123",
    name: "Manager User",
    role: "manager",
    department: "Engineering",
    job_title: "Engineering Manager",
  },
  {
    id: 3,
    email: "user@henryscheinone.com",
    password: "user123",
    name: "Regular User",
    role: "user",
    department: "Engineering",
    job_title: "Software Developer",
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
      // Demo mode - check against demo users
      const demoUser = DEMO_USERS.find((u) => u.email === email)
      if (demoUser && demoUser.password === password) {
        user = demoUser
      }
    } else {
      // Database mode - check against database
      try {
        const users = await sql`
          SELECT id, email, password_hash, name, role, department, job_title
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
              job_title: dbUser.job_title,
            }
          }
        }
      } catch (dbError) {
        console.error("Database error during login:", dbError)
        return NextResponse.json({ error: "Authentication service temporarily unavailable" }, { status: 503 })
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
        name: user.name,
        role: user.role,
        department: user.department,
        job_title: user.job_title,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    )

    // Create response with redirect based on role
    const redirectUrl = user.role === "admin" ? "/admin" : "/profile"

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        job_title: user.job_title,
      },
      redirectUrl,
    })

    // Set HTTP-only cookie
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
