import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { sql, isDatabaseConfigured } from "@/lib/db"
import bcrypt from "bcryptjs"

const JWT_SECRET = process.env.JWT_SECRET || "hs1-careers-matrix-secret-key-2024-change-in-production"

export interface User {
  id: number
  email: string
  name: string
  role: "admin" | "manager" | "user"
  department?: string
  manager_id?: number
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
    manager_id: 2,
  },
]

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any

    // If database is not configured, return demo user
    if (!isDatabaseConfigured() || !sql) {
      const demoUser = DEMO_USERS.find((u) => u.email === decoded.email)
      return demoUser || null
    }

    // Get user from database
    const users = await sql`
      SELECT id, email, name, role, department, manager_id
      FROM users 
      WHERE id = ${decoded.userId} AND active = true
    `

    if (users.length === 0) {
      return null
    }

    return users[0] as User
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
