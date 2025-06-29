import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import { sql, isDatabaseConfigured } from "./db"

export interface User {
  id: number
  email: string
  name: string
  role: "admin" | "manager" | "user"
  manager_id?: number
  department_id?: number
  job_title?: string
  hire_date?: string
  is_active?: boolean
}

export interface Session {
  id: string
  userId: number
  expiresAt: Date
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: number): Promise<string> {
  if (!isDatabaseConfigured() || !sql) {
    // In demo mode, just set a cookie without database storage
    const sessionId = uuidv4()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const cookieStore = cookies()
    cookieStore.set("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
    })

    return sessionId
  }

  const sessionId = uuidv4()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await sql`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (${sessionId}, ${userId}, ${expiresAt})
  `

  const cookieStore = cookies()
  cookieStore.set("session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
  })

  return sessionId
}

export async function getSession(): Promise<{ user: User; session: Session } | null> {
  // Return null if database is not configured (preview mode)
  if (!isDatabaseConfigured() || !sql) {
    // Check for demo session cookie
    try {
      const cookieStore = cookies()
      const sessionId = cookieStore.get("session")?.value

      if (sessionId) {
        // Return appropriate mock session based on session ID
        if (sessionId === "demo-admin-session") {
          return {
            user: {
              id: 1,
              email: "admin@henryscheinone.com",
              name: "Demo Admin",
              role: "admin",
            },
            session: {
              id: sessionId,
              userId: 1,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          }
        } else if (sessionId === "demo-manager-session") {
          return {
            user: {
              id: 2,
              email: "manager@henryscheinone.com",
              name: "Demo Manager",
              role: "manager",
            },
            session: {
              id: sessionId,
              userId: 2,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          }
        } else if (sessionId === "demo-user-session") {
          return {
            user: {
              id: 3,
              email: "user@henryscheinone.com",
              name: "Demo User",
              role: "user",
            },
            session: {
              id: sessionId,
              userId: 3,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          }
        }
      }
    } catch (error) {
      console.error("Error checking demo session:", error)
    }
    return null
  }

  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session")?.value

    if (!sessionId) {
      return null
    }

    const result = await sql`
      SELECT 
        s.id as session_id,
        s.user_id,
        s.expires_at,
        u.id,
        u.email,
        u.name,
        u.role,
        u.manager_id,
        u.department_id,
        u.job_title,
        u.hire_date,
        u.is_active
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ${sessionId} AND s.expires_at > NOW() AND u.is_active = true
    `

    if (result.length === 0) {
      return null
    }

    const row = result[0]
    return {
      session: {
        id: row.session_id,
        userId: row.user_id,
        expiresAt: row.expires_at,
      },
      user: {
        id: row.id,
        email: row.email,
        name: row.name,
        role: row.role,
        manager_id: row.manager_id,
        department_id: row.department_id,
        job_title: row.job_title,
        hire_date: row.hire_date,
        is_active: row.is_active,
      },
    }
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

export async function deleteSession(): Promise<void> {
  if (!isDatabaseConfigured() || !sql) {
    // Just clear the cookie if database is not configured
    try {
      const cookieStore = cookies()
      cookieStore.delete("session")
    } catch (error) {
      console.error("Error clearing cookie:", error)
    }
    return
  }

  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session")?.value

    if (sessionId) {
      try {
        await sql`DELETE FROM sessions WHERE id = ${sessionId}`
      } catch (error) {
        console.error("Error deleting session:", error)
      }
    }

    cookieStore.delete("session")
  } catch (error) {
    console.error("Error in deleteSession:", error)
  }
}

export async function requireAuth(): Promise<User> {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }
  return session.user
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth()
  if (user.role !== "admin") {
    redirect("/")
  }
  return user
}

export async function requireManagerOrAdmin(): Promise<User> {
  const user = await requireAuth()
  if (user.role !== "admin" && user.role !== "manager") {
    redirect("/")
  }
  return user
}

// Mock functions for preview/demo mode
export function getMockSession(): { user: User; session: Session } | null {
  // Return a mock admin session for demo purposes when database is not configured
  if (process.env.NODE_ENV === "development" && !isDatabaseConfigured()) {
    return {
      user: {
        id: 1,
        email: "admin@henryscheinone.com",
        name: "Demo Admin",
        role: "admin",
      },
      session: {
        id: "mock-session",
        userId: 1,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    }
  }
  return null
}
