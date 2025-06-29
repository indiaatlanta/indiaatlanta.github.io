import { cookies } from "next/headers"
import { sql, isDatabaseConfigured } from "./db"
import bcrypt from "bcryptjs"

export interface User {
  id: number
  email: string
  name: string
  role: "admin" | "manager" | "user"
  department?: string
  active: boolean
}

// Simple token encoding/decoding (replace with proper JWT in production)
function encodeToken(payload: any): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64")
}

function decodeToken(token: string): any {
  try {
    return JSON.parse(Buffer.from(token, "base64").toString())
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) {
    return null
  }

  const payload = decodeToken(token)
  if (!payload || !payload.userId || payload.expires < Date.now()) {
    return null
  }

  if (!isDatabaseConfigured() || !sql) {
    // Return demo user for preview
    const demoUsers = [
      { id: 1, email: "admin@henryscheinone.com", name: "Admin User", role: "admin" as const, active: true },
      { id: 2, email: "manager@henryscheinone.com", name: "Manager User", role: "manager" as const, active: true },
      { id: 3, email: "user@henryscheinone.com", name: "Regular User", role: "user" as const, active: true },
    ]
    return demoUsers.find((u) => u.id === payload.userId) || null
  }

  try {
    const users = await sql`
      SELECT id, email, name, role, department, active
      FROM users
      WHERE id = ${payload.userId} AND active = true
    `
    return users[0] || null
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  if (!isDatabaseConfigured() || !sql) {
    // Demo authentication
    const demoCredentials = [
      {
        email: "admin@henryscheinone.com",
        password: "admin123",
        user: { id: 1, email: "admin@henryscheinone.com", name: "Admin User", role: "admin" as const, active: true },
      },
      {
        email: "manager@henryscheinone.com",
        password: "manager123",
        user: {
          id: 2,
          email: "manager@henryscheinone.com",
          name: "Manager User",
          role: "manager" as const,
          active: true,
        },
      },
      {
        email: "user@henryscheinone.com",
        password: "user123",
        user: { id: 3, email: "user@henryscheinone.com", name: "Regular User", role: "user" as const, active: true },
      },
    ]

    const demo = demoCredentials.find((d) => d.email === email && d.password === password)
    return demo ? demo.user : null
  }

  try {
    const users = await sql`
      SELECT id, email, name, role, department, password_hash, active
      FROM users
      WHERE email = ${email} AND active = true
    `

    const user = users[0]
    if (!user) {
      return null
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      active: user.active,
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

export async function createSession(user: User): Promise<string> {
  const payload = {
    userId: user.id,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  }

  return encodeToken(payload)
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("auth-token")
}
