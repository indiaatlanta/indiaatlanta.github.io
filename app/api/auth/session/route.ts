import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { sql, isDatabaseConfigured } from "@/lib/db"

const JWT_SECRET = process.env.JWT_SECRET || "hs1-careers-matrix-secret-key-2024-change-in-production"

// Demo users for when database is not configured
const DEMO_USERS = [
  {
    id: 1,
    email: "admin@henryscheinone.com",
    name: "Demo Admin",
    role: "admin",
    department: "IT",
  },
  {
    id: 2,
    email: "manager@henryscheinone.com",
    name: "Demo Manager",
    role: "manager",
    department: "Engineering",
  },
  {
    id: 3,
    email: "user@henryscheinone.com",
    name: "Demo User",
    role: "user",
    department: "Engineering",
  },
]

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    let user = null

    if (!isDatabaseConfigured() || !sql) {
      // Demo mode - use hardcoded users
      user = DEMO_USERS.find((u) => u.id === decoded.userId)
    } else {
      // Database mode
      try {
        const users = await sql`
          SELECT id, email, name, role, department
          FROM users 
          WHERE id = ${decoded.userId} AND active = true
        `

        if (users.length > 0) {
          user = users[0]
        }
      } catch (dbError) {
        console.error("Database error during session check:", dbError)
        // Fall back to demo user
        user = DEMO_USERS.find((u) => u.id === decoded.userId)
      }
    }

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
      },
    })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
