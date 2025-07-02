import { cookies } from "next/headers"

export interface User {
  id: string
  name: string
  email: string
  role: "user" | "admin"
}

export interface Session {
  user: User
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
