import { sql, isDatabaseConfigured } from "@/lib/db"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

export interface User {
  id: number
  email: string
  name: string
  role: string
}

export interface Session {
  user: User
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
        WHERE id = 1
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

// Add getSession function that returns a session object
export async function getSession(): Promise<Session | null> {
  const user = await getCurrentUser()
  return user ? { user } : null
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    console.log("Authenticating user:", email)

    // Demo authentication for development
    const demoCredentials: Record<string, { password: string; user: User }> = {
      "admin@henryscheinone.com": {
        password: "admin123",
        user: { id: 1, name: "Admin User", email: "admin@henryscheinone.com", role: "admin" },
      },
      "user@henryscheinone.com": {
        password: "user123",
        user: { id: 2, name: "Regular User", email: "user@henryscheinone.com", role: "user" },
      },
      "manager@henryscheinone.com": {
        password: "manager123",
        user: { id: 3, name: "Manager User", email: "manager@henryscheinone.com", role: "admin" },
      },
      "john.smith@henryscheinone.com": {
        password: "password123",
        user: { id: 4, name: "John Smith", email: "john.smith@henryscheinone.com", role: "user" },
      },
      "jane.doe@henryscheinone.com": {
        password: "password123",
        user: { id: 5, name: "Jane Doe", email: "jane.doe@henryscheinone.com", role: "user" },
      },
    }

    // Check demo credentials first
    const demoAuth = demoCredentials[email]
    if (demoAuth && demoAuth.password === password) {
      console.log("Demo authentication successful for:", email)
      return demoAuth.user
    }

    if (!isDatabaseConfigured() || !sql) {
      console.log("Database not configured, demo auth failed")
      return null
    }

    try {
      // Try database authentication
      const users = await sql`
        SELECT id, name, email, role, password_hash
        FROM users
        WHERE email = ${email}
      `

      if (users.length === 0) {
        console.log("User not found in database:", email)
        return null
      }

      const user = users[0]
      const isValidPassword = await bcrypt.compare(password, user.password_hash)

      if (!isValidPassword) {
        console.log("Invalid password for user:", email)
        return null
      }

      console.log("Database authentication successful for:", email)
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    } catch (dbError) {
      console.log("Database authentication failed:", dbError.message)
      return null
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

export async function createSession(userId: number): Promise<string> {
  const sessionId = uuidv4()

  try {
    if (isDatabaseConfigured() && sql) {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      try {
        // Ensure the user exists before creating a session
        const userExists = await sql`
          SELECT id FROM users WHERE id = ${userId}
        `

        if (userExists.length === 0) {
          // Create a basic user record if it doesn't exist
          await sql`
            INSERT INTO users (id, name, email, role, password_hash)
            VALUES (${userId}, 'Demo User', 'demo@henryscheinone.com', 'user', 'demo_hash')
            ON CONFLICT (id) DO NOTHING
          `
        }

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

export async function destroySession(): Promise<void> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session")?.value

    if (sessionId && isDatabaseConfigured() && sql) {
      try {
        await sql`
          DELETE FROM user_sessions
          WHERE id = ${sessionId}
        `
        console.log("Session destroyed in database:", sessionId)
      } catch (dbError) {
        console.log("Could not destroy database session:", dbError.message)
      }
    }

    // Clear cookie regardless of database operation
    cookieStore.delete("session")
  } catch (error) {
    console.error("Session destruction error:", error)
  }
}
