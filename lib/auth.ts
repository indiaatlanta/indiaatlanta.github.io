import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { sql, isDatabaseConfigured } from "@/lib/db"

export interface User {
  id: number
  name: string
  email: string
  role: "user" | "admin"
}

export interface Session {
  id: string
  userId: number
  user: User
  expiresAt: Date
}

// Demo users for fallback
const DEMO_USERS = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@henryscheinone.com",
    role: "admin" as const,
    password: "admin123",
  },
  {
    id: 2,
    name: "John Doe",
    email: "john.doe@henryscheinone.com",
    role: "user" as const,
    password: "password123",
  },
  {
    id: 3,
    name: "Jane Smith",
    email: "jane.smith@henryscheinone.com",
    role: "user" as const,
    password: "password123",
  },
]

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session")?.value

    if (!sessionId) {
      return null
    }

    if (!isDatabaseConfigured() || !sql) {
      // Demo mode - return demo user based on session
      const demoUser = DEMO_USERS.find((u) => u.id.toString() === sessionId) || DEMO_USERS[0]
      return {
        id: demoUser.id,
        name: demoUser.name,
        email: demoUser.email,
        role: demoUser.role,
      }
    }

    // Database mode
    const result = await sql`
      SELECT u.id, u.name, u.email, u.role
      FROM users u
      JOIN user_sessions us ON u.id = us.user_id
      WHERE us.id = ${sessionId}
      AND us.expires_at > NOW()
    `

    if (result.length === 0) {
      return null
    }

    return result[0] as User
  } catch (error) {
    console.error("Database session check failed:", error)
    // Fallback to demo user
    return DEMO_USERS[0]
  }
}

export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session")?.value

    if (!sessionId) {
      return null
    }

    const user = await getCurrentUser()
    if (!user) {
      return null
    }

    return {
      id: sessionId,
      userId: user.id,
      user,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    }
  } catch (error) {
    console.error("Failed to get session:", error)
    return null
  }
}

export async function createSession(email: string, password: string): Promise<User | null> {
  try {
    if (!isDatabaseConfigured() || !sql) {
      // Demo mode authentication
      const demoUser = DEMO_USERS.find((u) => u.email === email)
      if (demoUser && demoUser.password === password) {
        return {
          id: demoUser.id,
          name: demoUser.name,
          email: demoUser.email,
          role: demoUser.role,
        }
      }
      return null
    }

    // Database mode
    const result = await sql`
      SELECT id, name, email, role, password_hash
      FROM users
      WHERE email = ${email}
    `

    if (result.length === 0) {
      return null
    }

    const user = result[0]
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      return null
    }

    // Create session
    const sessionId = `session_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    await sql`
      INSERT INTO user_sessions (id, user_id, expires_at)
      VALUES (${sessionId}, ${user.id}, ${expiresAt})
    `

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  } catch (error) {
    console.error("Failed to create session:", error)
    return null
  }
}

export async function destroySession(sessionId: string): Promise<void> {
  try {
    if (!isDatabaseConfigured() || !sql) {
      return // Demo mode - nothing to clean up
    }

    await sql`
      DELETE FROM user_sessions
      WHERE id = ${sessionId}
    `
  } catch (error) {
    console.error("Failed to destroy session:", error)
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
