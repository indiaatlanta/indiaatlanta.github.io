import { cookies } from "next/headers"
import { sql, isDatabaseConfigured } from "@/lib/db"
import bcrypt from "bcryptjs"

interface User {
  id: number
  email: string
  name: string
  role: string
}

interface LoginCredentials {
  email: string
  password: string
}

// Demo users for when database is not configured
const DEMO_USERS = [
  {
    id: 1,
    email: "admin@henryscheinone.com",
    name: "Admin User",
    role: "admin",
    password: "admin123",
  },
  {
    id: 2,
    email: "manager@henryscheinone.com",
    name: "Manager User",
    role: "manager",
    password: "manager123",
  },
  {
    id: 3,
    email: "user@henryscheinone.com",
    name: "Regular User",
    role: "user",
    password: "user123",
  },
]

export async function authenticateUser(credentials: LoginCredentials): Promise<User | null> {
  try {
    if (!isDatabaseConfigured() || !sql) {
      // Use demo authentication
      const demoUser = DEMO_USERS.find((u) => u.email === credentials.email && u.password === credentials.password)
      if (demoUser) {
        const { password, ...userWithoutPassword } = demoUser
        return userWithoutPassword
      }
      return null
    }

    // Database authentication
    const users = await sql`
      SELECT id, email, name, role, password_hash
      FROM users
      WHERE email = ${credentials.email}
    `

    if (users.length === 0) {
      return null
    }

    const user = users[0]
    const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash)

    if (!isValidPassword) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

export function createToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  }
  return Buffer.from(JSON.stringify(payload)).toString("base64")
}

export function verifyToken(token: string): User | null {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString())

    if (payload.exp < Date.now()) {
      return null
    }

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    }
  } catch (error) {
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return null
    }

    return verifyToken(token)
  } catch (error) {
    return null
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth()
  if (user.role !== "admin") {
    throw new Error("Admin access required")
  }
  return user
}
