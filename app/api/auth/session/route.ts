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

    // Verify JWT token
    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError)
      return NextResponse.json({ user: null })
    }

    let user = null

    // Check if database is configured
    if (isDatabaseConfigured() && sql) {
      try {
        // Try to get user from database
        const users = await sql`
          SELECT id, email, name, role, department
          FROM users 
          WHERE id = ${decoded.userId} AND active = true
        `

        if (users.length > 0) {
          user = users[0]
        }
      } catch (error) {
        console.error("Database session error:", error)
        // Fall back to demo mode
      }
    }

    // If no database user found, try demo users
    if (!user) {
      user = DEMO_USERS.find((u) => u.id === decoded.userId)
    }

    return NextResponse.json({ user: user || null })
  } catch (error) {
    console.error("Session error:", error)
    return NextResponse.json({ user: null })
  }
}
