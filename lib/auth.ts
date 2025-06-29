import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
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

export interface User {
  id: number
  email: string
  name: string
  role: "admin" | "manager" | "user"
  department?: string
}

export async function getSession(): Promise<User | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return null
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any

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

    return user || null
  } catch (error) {
    console.error("Session error:", error)
    return null
  }
}

export function requireAuth(allowedRoles?: string[]) {
  return async (request: Request) => {
    const user = await getSession()

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return new Response("Forbidden", { status: 403 })
    }

    return user
  }
}
