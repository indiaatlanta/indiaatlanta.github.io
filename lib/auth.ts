import { cookies } from "next/headers"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"

export interface User {
  id: number
  name: string
  email: string
  role: string
}

// Demo users for development
const DEMO_USERS = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@henryscheinone.com",
    password: "admin123",
    role: "admin",
  },
  {
    id: 2,
    name: "Regular User",
    email: "user@henryscheinone.com",
    password: "user123",
    role: "user",
  },
  {
    id: 3,
    name: "Manager User",
    email: "manager@henryscheinone.com",
    password: "manager123",
    role: "manager",
  },
  {
    id: 4,
    name: "John Smith",
    email: "john.smith@henryscheinone.com",
    password: "password123",
    role: "user",
  },
  {
    id: 5,
    name: "Jane Doe",
    email: "jane.doe@henryscheinone.com",
    password: "password123",
    role: "user",
  },
]

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session")?.value

    if (!sessionToken) {
      return null
    }

    // Try database first
    if (sql) {
      try {
        const result = await sql`
          SELECT u.id, u.name, u.email, u.role 
          FROM users u
          JOIN user_sessions us ON u.id = us.user_id
          WHERE us.session_token = ${sessionToken}
          AND us.expires_at > NOW()
        `

        if (result.length > 0) {
          return result[0] as User
        }
      } catch (error) {
        console.error("Database session check failed:", error)
      }
    }

    // Fallback to demo session validation
    try {
      const sessionData = JSON.parse(Buffer.from(sessionToken, "base64").toString())
      const user = DEMO_USERS.find((u) => u.id === sessionData.userId)

      if (user && sessionData.expires > Date.now()) {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      }
    } catch (error) {
      console.error("Demo session validation failed:", error)
    }

    return null
  } catch (error) {
    console.error("getCurrentUser failed:", error)
    return null
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  // Try database authentication first
  if (sql) {
    try {
      const result = await sql`
        SELECT id, name, email, role, password_hash 
        FROM users 
        WHERE email = ${email}
      `

      if (result.length > 0) {
        const user = result[0]
        const isValid = await bcrypt.compare(password, user.password_hash)

        if (isValid) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          }
        }
      }
    } catch (error) {
      console.error("Database authentication failed:", error)
    }
  }

  // Fallback to demo users
  const user = DEMO_USERS.find((u) => u.email === email && u.password === password)

  if (user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  }

  return null
}

export async function createSession(user: User): Promise<string> {
  const sessionToken = Buffer.from(
    JSON.stringify({
      userId: user.id,
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    }),
  ).toString("base64")

  // Try to store in database
  if (sql) {
    try {
      await sql`
        INSERT INTO user_sessions (user_id, session_token, expires_at)
        VALUES (${user.id}, ${sessionToken}, ${new Date(Date.now() + 24 * 60 * 60 * 1000)})
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          session_token = EXCLUDED.session_token,
          expires_at = EXCLUDED.expires_at
      `
    } catch (error) {
      console.error("Failed to store session in database:", error)
    }
  }

  return sessionToken
}

export async function destroySession(sessionToken: string): Promise<void> {
  // Remove from database
  if (sql) {
    try {
      await sql`
        DELETE FROM user_sessions 
        WHERE session_token = ${sessionToken}
      `
    } catch (error) {
      console.error("Failed to remove session from database:", error)
    }
  }
}
