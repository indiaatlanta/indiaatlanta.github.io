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
      return NextResponse.json({ user: null }, { status: 200 })
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any

    let user = null

    // Check if database is configured
    if (isDatabaseConfigured() && sql) {
      try {
        // Try to find user in database
        const users = await sql`
          SELECT id, email, name, role, department, job_title
          FROM users 
          WHERE id = ${decoded.userId} AND active = true
        `

        if (users.length > 0) {
          const dbUser = users[0]
          user = {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role,
            department: dbUser.department,
            job_title: dbUser.job_title,
          }
        }
      } catch (error) {
        console.error("Database error during session check:", error)
        // Fall back to demo users
      }
    }

    // If no database user found, check demo users
    if (!user) {
      const demoUser = DEMO_USERS.find((u) => u.id === decoded.userId)
      if (demoUser) {
        user = demoUser
      }
    }

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
