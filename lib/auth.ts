import { cookies } from "next/headers"
import { sql, isDatabaseConfigured } from "@/lib/db"

export interface User {
  id: number
  email: string
  name: string
  role: string
}

export interface Session {
  user: User
}

// Demo users for when database is not available
const demoUsers = [
  { id: 1, email: "admin@henryscheinone.com", name: "Admin User", role: "admin" },
  { id: 2, email: "user@henryscheinone.com", name: "Regular User", role: "user" },
  { id: 3, email: "manager@henryscheinone.com", name: "Manager User", role: "admin" },
  { id: 4, email: "john.smith@henryscheinone.com", name: "John Smith", role: "user" },
  { id: 5, email: "jane.doe@henryscheinone.com", name: "Jane Doe", role: "user" },
]

export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      console.log("No session cookie found")
      return null
    }

    const sessionId = sessionCookie.value
    console.log("Found session cookie:", sessionId)

    // Check if database is configured
    if (!isDatabaseConfigured() || !sql) {
      console.log("Database not configured, using demo session")
      // For demo mode, we'll use a simple session mapping
      // In a real app, you'd want to store this more securely
      const demoUser = demoUsers[0] // Default to admin for demo
      return { user: demoUser }
    }

    try {
      // Query database for session
      const sessions = await sql`
        SELECT s.id, s.user_id, s.expires_at, u.email, u.name, u.role
        FROM user_sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = ${sessionId} AND s.expires_at > NOW()
      `

      if (sessions.length === 0) {
        console.log("No valid session found in database")
        return null
      }

      const session = sessions[0]
      console.log("Valid session found for user:", session.email)

      return {
        user: {
          id: session.user_id,
          email: session.email,
          name: session.name || "User",
          role: session.role,
        },
      }
    } catch (dbError) {
      console.error("Database session check failed:", dbError)
      // Fallback to demo mode
      console.log("Falling back to demo session")
      const demoUser = demoUsers[0] // Default to admin for demo
      return { user: demoUser }
    }
  } catch (error) {
    console.error("Session check error:", error)
    return null
  }
}

export async function requireAuth(): Promise<User> {
  const session = await getSession()
  if (!session) {
    throw new Error("Authentication required")
  }
  return session.user
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth()
  if (user.role !== "admin") {
    throw new Error("Admin access required")
  }
  return user
}
