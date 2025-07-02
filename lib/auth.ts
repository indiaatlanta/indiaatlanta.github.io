import { cookies } from "next/headers"

export interface User {
  id: string
  name: string
  email: string
  role: "user" | "admin" | "manager"
}

export interface Session {
  user: User
}

// Demo users for authentication
const DEMO_USERS: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@henryscheinone.com",
    role: "admin",
  },
  {
    id: "2",
    name: "Regular User",
    email: "user@henryscheinone.com",
    role: "user",
  },
  {
    id: "3",
    name: "Manager User",
    email: "manager@henryscheinone.com",
    role: "manager",
  },
  {
    id: "4",
    name: "John Smith",
    email: "john.smith@henryscheinone.com",
    role: "user",
  },
  {
    id: "5",
    name: "Jane Doe",
    email: "jane.doe@henryscheinone.com",
    role: "user",
  },
]

// Demo passwords (in real app, these would be hashed)
const DEMO_PASSWORDS: Record<string, string> = {
  "admin@henryscheinone.com": "admin123",
  "user@henryscheinone.com": "user123",
  "manager@henryscheinone.com": "manager123",
  "john.smith@henryscheinone.com": "password123",
  "jane.doe@henryscheinone.com": "password123",
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    console.log("Authenticating user:", email)

    // Check if user exists in demo users
    const user = DEMO_USERS.find((u) => u.email === email)
    if (!user) {
      console.log("User not found:", email)
      return null
    }

    // Check password
    const expectedPassword = DEMO_PASSWORDS[email]
    if (password !== expectedPassword) {
      console.log("Invalid password for user:", email)
      return null
    }

    console.log("Authentication successful for:", email)
    return user
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie?.value) {
      return null
    }

    // In a real app, you would validate the session token
    // For demo purposes, we'll parse the stored user data
    const userData = JSON.parse(sessionCookie.value)

    return {
      user: userData,
    }
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const session = await getSession()
    return session?.user || null
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function createSession(user: User): Promise<void> {
  const cookieStore = await cookies()

  // In a real app, you would create a secure session token
  // For demo purposes, we'll store the user data directly
  cookieStore.set("session", JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}
