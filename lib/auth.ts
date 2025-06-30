import { sql, isDatabaseConfigured } from "@/lib/db"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

export interface User {
  id: number
  email: string
  name: string
  role: string
}

// Global in-memory session store
const globalSessionStore = new Map<string, { user: User; expiresAt: Date }>()

export async function createSession(user: User): Promise<string> {
  const sessionId = uuidv4()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  console.log("Creating session for user:", user.email, "Session ID:", sessionId)

  // Always store in memory first for immediate access
  globalSessionStore.set(sessionId, { user, expiresAt })
  console.log("Session stored in memory")

  // Try to store session in database if available
  if (isDatabaseConfigured()) {
    try {
      await sql!`
        INSERT INTO user_sessions (id, user_id, expires_at)
        VALUES (${sessionId}, ${user.id}, ${expiresAt})
        ON CONFLICT (id) 
        DO UPDATE SET 
          user_id = EXCLUDED.user_id,
          expires_at = EXCLUDED.expires_at,
          updated_at = CURRENT_TIMESTAMP
      `
      console.log("Session also stored in database")
    } catch (error) {
      console.error("Failed to store session in database:", error)
      // Continue with memory-only session
    }
  }

  return sessionId
}

export async function verifySession(sessionId: string): Promise<User | null> {
  if (!sessionId) {
    console.log("No session ID provided")
    return null
  }

  console.log("Verifying session:", sessionId)

  // Check memory store first (fastest)
  const memorySession = globalSessionStore.get(sessionId)
  if (memorySession) {
    if (memorySession.expiresAt > new Date()) {
      console.log("Valid session found in memory for user:", memorySession.user.email)
      return memorySession.user
    } else {
      // Clean up expired session
      globalSessionStore.delete(sessionId)
      console.log("Expired session removed from memory")
    }
  }

  // Try database verification if configured
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
        const user = {
          id: session.user_id,
          email: session.email,
          name: session.name,
          role: session.role,
        }

        // Store in memory for faster future lookups
        globalSessionStore.set(sessionId, {
          user,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        })

        console.log("Database session found and cached for user:", session.email)
        return user
      }
    } catch (error) {
      console.error("Database session verification failed:", error)
    }
  }

  console.log("Session verification failed for:", sessionId)
  return null
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session")?.value

    if (!sessionId) {
      console.log("No session cookie found")
      return null
    }

    console.log("Found session cookie, verifying...")
    return await verifySession(sessionId)
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  if (!sessionId) {
    return
  }

  console.log("Deleting session:", sessionId)

  // Remove from memory
  globalSessionStore.delete(sessionId)

  // Remove from database if configured
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

// Clean up expired sessions periodically
setInterval(
  () => {
    const now = new Date()
    let cleanedCount = 0
    for (const [sessionId, session] of globalSessionStore.entries()) {
      if (session.expiresAt <= now) {
        globalSessionStore.delete(sessionId)
        cleanedCount++
      }
    }
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired sessions`)
    }
  },
  60 * 60 * 1000,
) // Clean up every hour
