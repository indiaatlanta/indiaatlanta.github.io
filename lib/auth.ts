import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { sql, isDatabaseConfigured } from "@/lib/db"

const JWT_SECRET = process.env.JWT_SECRET || "hs1-careers-matrix-secret-key-2024-change-in-production"

export interface User {
  id: number
  email: string
  name: string
  role: "admin" | "manager" | "user"
  department?: string
  job_title?: string
}

// Demo users for when database is not configured
const DEMO_USERS: User[] = [
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

export async function getSession(token: string): Promise<User | null> {
  try {
    if (!token) return null

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

    return user
  } catch (error) {
    console.error("Session verification error:", error)
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function createToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  )
}
