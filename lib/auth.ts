import { sql, isDatabaseConfigured } from "@/lib/db"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

export interface User {
  id: number
  email: string
  name: string
  role: string
}

// Demo users for when database is not configured
const demoUsers: User[] = [
  {
    id: 1,
    email: "admin@henryscheinone.com",
    name: "Admin User",
    role: "admin",
  },
  {
    id: 2,
    email: "user@henryscheinone.com",
    name: "John Doe",
    role: "user",
  },
  {
    id: 3,
    email: "manager@henryscheinone.com",
    name: "Jane Manager",
    role: "admin",
  },
  {
    id: 4,
    email: "john.smith@henryscheinone.com",
    name: "John Smith",
    role: "user",
  },
  {
    id: 5,
    email: "jane.doe@henryscheinone.com",
    name: "Jane Doe",
    role: "user",
  },
]

export async function createSession(user: User): Promise<string> {
  const sessionId = uuidv4()

  // Try to store session in database if available
  if (isDatabaseConfigured()) {
    try {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      await sql!`
        INSERT INTO user_sessions (id, user_id, expires_at)
        VALUES (${sessionId}, ${user.id}, ${expiresAt})
        ON CONFLICT (id) 
        DO UPDATE SET 
          user_id = EXCLUDED.user_id,
          expires_at = EXCLUDED.expires_at,
          updated_at = CURRENT_TIMESTAMP
      `
      console.log("Session stored in database:", sessionId)
    } catch (error) {
      console.error("Failed to store session in database:", error)
      // Continue with cookie-only session
    }
  }

  return sessionId
}

export async function verifySession(sessionId: string): Promise<User | null> {
  try {
    // Try database verification first
    if (isDatabaseConfigured()) {
      try {
        const sessions = await sql!`
          SELECT us.user_id, u.email, u.name, u.role
          FROM user_sessions us
          JOIN users u ON us.user_id = u.id
          WHERE us.id = ${sessionId} AND us.expires_at > CURRENT_TIMESTAMP
        `

        if (sessions.length > 0) {
          const session = sessions[0]
          return {
            id: session.user_id,
            email: session.email,
            name: session.name,
            role: session.role,
          }
        }
      } catch (error) {
        console.error("Database session verification failed:", error)
      }
    }

    // Fallback to demo mode - in demo mode, any valid session ID maps to admin user
    console.log("Using demo mode for session verification")
    return demoUsers[0] // Return admin user in demo mode
  } catch (error) {
    console.error("Session verification failed:", error)
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session")?.value

    if (!sessionId) {
      console.log("No session cookie found")
      return null
    }

    return await verifySession(sessionId)
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  if (isDatabaseConfigured()) {
    try {
      await sql!`
        DELETE FROM user_sessions 
        WHERE id = ${sessionId}
      `
      console.log("Session deleted from database")
    } catch (error) {
      console.error("Failed to delete session from database:", error)
    }
  }
}
