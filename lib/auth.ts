import { sql, isDatabaseConfigured } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export interface User {
  id: number
  email: string
  name: string
  role: string
}

export interface Session {
  id: string
  userId: number
  user: User
  expiresAt: Date
}

// In-memory session store for fallback
const sessionStore = new Map<string, Session>()

export async function createSession(user: User): Promise<string> {
  const sessionId = uuidv4()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  const session: Session = {
    id: sessionId,
    userId: user.id,
    user,
    expiresAt,
  }

  // Try to store in database first
  if (isDatabaseConfigured()) {
    try {
      await sql!`
        INSERT INTO user_sessions (id, user_id, user_data, expires_at)
        VALUES (${sessionId}, ${user.id}, ${JSON.stringify(user)}, ${expiresAt})
        ON CONFLICT (id) DO UPDATE SET
          user_id = EXCLUDED.user_id,
          user_data = EXCLUDED.user_data,
          expires_at = EXCLUDED.expires_at
      `
      console.log("Session stored in database:", sessionId)
      return sessionId
    } catch (error) {
      console.error("Failed to store session in database:", error)
      // Fall through to memory storage
    }
  }

  // Fallback to memory storage
  sessionStore.set(sessionId, session)
  console.log("Session stored in memory:", sessionId)
  return sessionId
}

export async function verifySession(sessionId: string): Promise<User | null> {
  if (!sessionId) {
    return null
  }

  // Try database first
  if (isDatabaseConfigured()) {
    try {
      const sessions = await sql!`
        SELECT id, user_id, user_data, expires_at
        FROM user_sessions
        WHERE id = ${sessionId} AND expires_at > NOW()
      `

      if (sessions.length > 0) {
        const session = sessions[0]
        console.log("Session found in database:", sessionId)
        return JSON.parse(session.user_data)
      }
    } catch (error) {
      console.error("Database session verification error:", error)
      // Fall through to memory check
    }
  }

  // Check memory store
  const session = sessionStore.get(sessionId)
  if (session && session.expiresAt > new Date()) {
    console.log("Session found in memory:", sessionId)
    return session.user
  }

  // Clean up expired session from memory
  if (session) {
    sessionStore.delete(sessionId)
  }

  console.log("Session not found or expired:", sessionId)
  return null
}

export async function deleteSession(sessionId: string): Promise<void> {
  if (!sessionId) {
    return
  }

  // Try database first
  if (isDatabaseConfigured()) {
    try {
      await sql!`
        DELETE FROM user_sessions WHERE id = ${sessionId}
      `
      console.log("Session deleted from database:", sessionId)
    } catch (error) {
      console.error("Failed to delete session from database:", error)
    }
  }

  // Also remove from memory store
  sessionStore.delete(sessionId)
  console.log("Session deleted from memory:", sessionId)
}

export async function cleanupExpiredSessions(): Promise<void> {
  // Clean up database sessions
  if (isDatabaseConfigured()) {
    try {
      await sql!`
        DELETE FROM user_sessions WHERE expires_at <= NOW()
      `
      console.log("Expired database sessions cleaned up")
    } catch (error) {
      console.error("Failed to cleanup database sessions:", error)
    }
  }

  // Clean up memory sessions
  const now = new Date()
  for (const [sessionId, session] of sessionStore.entries()) {
    if (session.expiresAt <= now) {
      sessionStore.delete(sessionId)
    }
  }
  console.log("Expired memory sessions cleaned up")
}

// Run cleanup every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000)
