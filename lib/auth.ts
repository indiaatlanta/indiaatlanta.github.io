import { sql, isDatabaseConfigured } from "@/lib/db"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")

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
  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET)

  // Try to store session in database if available
  if (isDatabaseConfigured()) {
    try {
      const sessionId = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      await sql!`
        INSERT INTO user_sessions (id, user_id, token, expires_at)
        VALUES (${sessionId}, ${user.id}, ${token}, ${expiresAt})
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          token = EXCLUDED.token,
          expires_at = EXCLUDED.expires_at,
          updated_at = CURRENT_TIMESTAMP
      `
      console.log("Session stored in database")
    } catch (error) {
      console.error("Failed to store session in database:", error)
      // Continue with cookie-only session
    }
  }

  return token
}

export async function verifySession(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)

    const user: User = {
      id: payload.userId as number,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
    }

    // Verify user still exists if database is available
    if (isDatabaseConfigured()) {
      try {
        const users = await sql!`
          SELECT id, email, name, role 
          FROM users 
          WHERE id = ${user.id}
        `

        if (users.length === 0) {
          console.log("User not found in database, checking demo users")
          // Check if it's a demo user
          const demoUser = demoUsers.find((u) => u.id === user.id)
          return demoUser || null
        }

        return {
          id: users[0].id,
          email: users[0].email,
          name: users[0].name,
          role: users[0].role,
        }
      } catch (error) {
        console.error("Database verification failed, using token data:", error)
        // Fall back to demo users
        const demoUser = demoUsers.find((u) => u.id === user.id)
        return demoUser || user
      }
    }

    // If no database, check against demo users
    const demoUser = demoUsers.find((u) => u.id === user.id)
    return demoUser || user
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value

  if (!token) {
    return null
  }

  return verifySession(token)
}

export async function deleteSession(token: string): Promise<void> {
  if (isDatabaseConfigured()) {
    try {
      await sql!`
        DELETE FROM user_sessions 
        WHERE token = ${token}
      `
      console.log("Session deleted from database")
    } catch (error) {
      console.error("Failed to delete session from database:", error)
    }
  }
}
