import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { sql, isDatabaseConfigured } from "@/lib/db"

const JWT_SECRET = process.env.JWT_SECRET || "hs1-careers-matrix-secret-key-2024-change-in-production"

// Demo users for when database is not configured
const DEMO_USERS = [
  {
    id: 1,
    email: "admin@henryscheinone.com",
    name: "Admin User",
    role: "admin",
    department: "IT",
  },
  {
    id: 2,
    email: "manager@henryscheinone.com",
    name: "Manager User",
    role: "manager",
    department: "Engineering",
  },
  {
    id: 3,
    email: "user@henryscheinone.com",
    name: "Regular User",
    role: "user",
    department: "Engineering",
  },
]

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ user: null })
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any

      // If database is not configured, return demo user
      if (!isDatabaseConfigured() || !sql) {
        const demoUser = DEMO_USERS.find((u) => u.email === decoded.email)
        return NextResponse.json({ user: demoUser || null })
      }

      // Get user from database
      const users = await sql`
        SELECT id, email, name, role, department, manager_id
        FROM users 
        WHERE id = ${decoded.userId} AND active = true
      `

      if (users.length === 0) {
        return NextResponse.json({ user: null })
      }

      return NextResponse.json({ user: users[0] })
    } catch (jwtError) {
      // Invalid token
      return NextResponse.json({ user: null })
    }
  } catch (error) {
    console.error("Session error:", error)
    return NextResponse.json({ user: null })
  }
}
