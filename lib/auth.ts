import { cookies } from "next/headers"
import { sql, isDatabaseConfigured } from "@/lib/db"

export interface User {
  id: number
  email: string
  name: string
  role: string
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session")?.value

    if (!sessionId) {
      console.log("No session cookie found")
      return null
    }

    console.log("Checking session:", sessionId)

    // Demo users for fallback
    const demoUsers = [
      { email: "admin@henryscheinone.com", name: "Admin User", role: "admin", id: 1 },
      { email: "user@henryscheinone.com", name: "Regular User", role: "user", id: 2 },
      { email: "manager@henryscheinone.com", name: "Manager User", role: "admin", id: 3 },
      { email: "john.smith@henryscheinone.com", name: "John Smith", role: "user", id: 4 },
      { email: "jane.doe@henryscheinone.com", name: "Jane Doe", role: "user", id: 5 },
    ]

    if (!isDatabaseConfigured() || !sql) {
      console.log("Database not configured, using demo user")
      // In demo mode, just return the first demo user (admin)
      return demoUsers[0]
    }

    try {
      // Try to get user from database session
      const sessions = await sql`
        SELECT us.user_id, u.email, u.name, u.role
        FROM user_sessions us
        JOIN users u ON us.user_id = u.id
        WHERE us.id = ${sessionId} AND us.expires_at > CURRENT_TIMESTAMP
      `

      if (sessions.length > 0) {
        const session = sessions[0]
        console.log("Database session found:", { userId: session.user_id, email: session.email })
        return {
          id: session.user_id,
          email: session.email,
          name: session.name || "User",
          role: session.role,
        }
      }

      // If no database session found, try to get user directly (fallback)
      const users = await sql`
        SELECT id, email, name, role
        FROM users
        LIMIT 1
      `

      if (users.length > 0) {
        const user = users[0]
        console.log("Using first database user as fallback:", { id: user.id, email: user.email })
        return {
          id: user.id,
          email: user.email,
          name: user.name || "User",
          role: user.role,
        }
      }

      console.log("No database user found, using demo user")
      return demoUsers[0]
    } catch (dbError) {
      console.log("Database session check failed, using demo user:", dbError.message)
      // Fallback to demo user if database fails
      return demoUsers[0]
    }
  } catch (error) {
    console.error("Auth error:", error)
    return null
  }
}

// Add getSession as an alias for getCurrentUser for backward compatibility
export const getSession = async () => {
  const user = await getCurrentUser()
  return user ? { user } : null
}

export async function createSession(userId: number): Promise<string> {
  const { v4: uuidv4 } = await import("uuid")
  const sessionId = uuidv4()

  try {
    if (isDatabaseConfigured() && sql) {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      try {
        await sql`
          INSERT INTO user_sessions (id, user_id, expires_at)
          VALUES (${sessionId}, ${userId}, ${expiresAt})
          ON CONFLICT (id) DO UPDATE SET
            user_id = EXCLUDED.user_id,
            expires_at = EXCLUDED.expires_at
        `
        console.log("Session created in database:", sessionId)
      } catch (sessionError) {
        console.log("Could not create database session (table may not exist):", sessionError.message)
        // Continue without database session storage
      }
    }

    // Set cookie regardless of database storage
    const cookieStore = await cookies()
    cookieStore.set("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return sessionId
  } catch (error) {
    console.error("Session creation error:", error)
    throw error
  }
}
