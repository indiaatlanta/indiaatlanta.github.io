import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { sql, isDatabaseConfigured } from "@/lib/db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// Demo users for when database is not configured
const DEMO_USERS = [
  {
    id: 1,
    email: "admin@henryscheinone.com",
    role: "admin",
    name: "Admin User",
    department: "IT",
  },
  {
    id: 2,
    email: "manager@henryscheinone.com",
    role: "manager",
    name: "Manager User",
    department: "Engineering",
  },
  {
    id: 3,
    email: "user@henryscheinone.com",
    role: "user",
    name: "Regular User",
    department: "Engineering",
  },
]

export async function GET(request: NextRequest) {
  try {
    // Check for demo session cookie first
    const demoSession = request.cookies.get("demo-session")
    if (demoSession?.value === "true") {
      return NextResponse.json({
        user: {
          id: 1,
          email: "demo@henryscheinone.com",
          role: "admin",
          name: "Demo Admin",
          department: "Demo",
        },
      })
    }

    const token = request.cookies.get("auth-token")

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    try {
      const decoded = jwt.verify(token.value, JWT_SECRET) as any

      // If database is not configured, return demo user data
      if (!isDatabaseConfigured() || !sql) {
        const demoUser = DEMO_USERS.find((u) => u.email === decoded.email)
        if (demoUser) {
          return NextResponse.json({ user: demoUser })
        }
      } else {
        // Verify user still exists in database
        const users = await sql`
          SELECT id, email, role, name, department
          FROM users 
          WHERE id = ${decoded.userId} AND active = true
        `

        if (users.length === 0) {
          return NextResponse.json({ user: null }, { status: 401 })
        }

        return NextResponse.json({ user: users[0] })
      }

      return NextResponse.json({ user: null }, { status: 401 })
    } catch (jwtError) {
      return NextResponse.json({ user: null }, { status: 401 })
    }
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
