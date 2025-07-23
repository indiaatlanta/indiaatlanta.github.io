import { sql } from "@vercel/postgres"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

export interface User {
  id: number
  name: string
  email: string
  role: string
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session")?.value

    if (!sessionId) {
      // Return demo user for development
      return {
        id: 1,
        name: "Demo User",
        email: "demo@henryscheinone.com",
        role: "user",
      }
    }

    if (!sql) {
      // Return demo user if no database connection
      return {
        id: 1,
        name: "Demo User",
        email: "demo@henryscheinone.com",
        role: "user",
      }
    }

    // Check if session exists and is valid
    const sessionResult = await sql`
      SELECT us.id, us.user_id, us.expires_at, u.name, u.email, u.role
      FROM user_sessions us
      JOIN users u ON us.user_id = u.id
      WHERE us.id = ${sessionId} AND us.expires_at > NOW()
    `

    if (sessionResult.length === 0) {
      // Return demo user if session not found
      return {
        id: 1,
        name: "Demo User",
        email: "demo@henryscheinone.com",
        role: "user",
      }
    }

    const session = sessionResult[0]
    return {
      id: session.user_id,
      name: session.name,
      email: session.email,
      role: session.role,
    }
  } catch (error) {
    console.error("Database session check failed:", error)
    // Return demo user on error
    return {
      id: 1,
      name: "Demo User",
      email: "demo@henryscheinone.com",
      role: "user",
    }
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    if (!sql) {
      // Demo authentication
      if (email === "admin@henryscheinone.com" && password === "admin123") {
        return {
          id: 1,
          name: "Admin User",
          email: "admin@henryscheinone.com",
          role: "admin",
        }
      }
      if (email === "demo@henryscheinone.com" && password === "demo123") {
        return {
          id: 2,
          name: "Demo User",
          email: "demo@henryscheinone.com",
          role: "user",
        }
      }
      return null
    }

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

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  } catch (error) {
    console.error("Authentication failed:", error)
    return null
  }
}

export async function createSession(userId: number): Promise<string> {
  try {
    if (!sql) {
      // Return demo session ID
      return `demo-session-${userId}-${Date.now()}`
    }

    const sessionId = `session-${userId}-${Date.now()}-${Math.random().toString(36).substring(2)}`
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await sql`
      INSERT INTO user_sessions (id, user_id, expires_at)
      VALUES (${sessionId}, ${userId}, ${expiresAt})
    `

    return sessionId
  } catch (error) {
    console.error("Failed to create session:", error)
    return `fallback-session-${userId}-${Date.now()}`
  }
}

export async function destroySession(sessionId: string): Promise<void> {
  try {
    if (!sql) {
      return
    }

    await sql`
      DELETE FROM user_sessions
      WHERE id = ${sessionId}
    `
  } catch (error) {
    console.error("Failed to destroy session:", error)
  }
}
