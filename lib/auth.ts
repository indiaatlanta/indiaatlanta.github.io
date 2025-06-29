import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { sql, isDatabaseConfigured } from "./db"

export interface User {
  id: number
  email: string
  name: string
  role: "admin" | "manager" | "user"
  department?: string
  active: boolean
}

export interface AuthResult {
  success: boolean
  user?: User
  error?: string
}

// Demo users for when database is not configured
const DEMO_USERS = [
  {
    id: 1,
    email: "admin@henryscheinone.com",
    name: "Admin User",
    role: "admin" as const,
    department: "IT",
    active: true,
    password: "admin123",
  },
  {
    id: 2,
    email: "manager@henryscheinone.com",
    name: "Manager User",
    role: "manager" as const,
    department: "Engineering",
    active: true,
    password: "manager123",
  },
  {
    id: 3,
    email: "user@henryscheinone.com",
    name: "Regular User",
    role: "user" as const,
    department: "Engineering",
    active: true,
    password: "user123",
  },
]

export async function authenticateUser(email: string, password: string): Promise<AuthResult> {
  if (!isDatabaseConfigured() || !sql) {
    // Demo mode authentication
    const user = DEMO_USERS.find((u) => u.email === email)
    if (!user || user.password !== password) {
      return { success: false, error: "Invalid credentials" }
    }

    const { password: _, ...userWithoutPassword } = user
    return { success: true, user: userWithoutPassword }
  }

  try {
    const users = await sql`
      SELECT id, email, name, role, department, active, password_hash
      FROM users 
      WHERE email = ${email} AND active = true
    `

    if (users.length === 0) {
      return { success: false, error: "Invalid credentials" }
    }

    const user = users[0]
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      return { success: false, error: "Invalid credentials" }
    }

    const { password_hash, ...userWithoutPassword } = user
    return { success: true, user: userWithoutPassword }
  } catch (error) {
    console.error("Authentication error:", error)
    return { success: false, error: "Authentication failed" }
  }
}

export function generateToken(user: User): string {
  // Simple token generation without JWT to avoid the inheritance error
  const tokenData = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    department: user.department,
    timestamp: Date.now(),
  }

  return Buffer.from(JSON.stringify(tokenData)).toString("base64")
}

export function verifyToken(token: string): User | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString())

    // Check if token is expired (7 days)
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000
    if (Date.now() - decoded.timestamp > sevenDaysInMs) {
      return null
    }

    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      department: decoded.department,
      active: true,
    }
  } catch (error) {
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return null
    }

    return verifyToken(token)
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}
