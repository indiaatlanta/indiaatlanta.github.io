import { cookies } from "next/headers"
import { sql, isDatabaseConfigured } from "@/lib/db"
import bcrypt from "bcryptjs"

export interface User {
  id: number
  email: string
  name: string
  role: "admin" | "manager" | "user"
  department?: string
  active: boolean
}

// Demo users for when database is not configured
const DEMO_USERS: User[] = [
  {
    id: 1,
    email: "admin@henryscheinone.com",
    name: "Admin User",
    role: "admin",
    department: "IT",
    active: true,
  },
  {
    id: 2,
    email: "manager@henryscheinone.com",
    name: "Manager User",
    role: "manager",
    department: "Engineering",
    active: true,
  },
  {
    id: 3,
    email: "user@henryscheinone.com",
    name: "Regular User",
    role: "user",
    department: "Engineering",
    active: true,
  },
]

function createToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    department: user.department,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  }
  return Buffer.from(JSON.stringify(payload)).toString("base64")
}

function verifyToken(token: string): User | null {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString())
    if (payload.exp < Date.now()) {
      return null
    }
    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      department: payload.department,
      active: true,
    }
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) {
    return null
  }

  return verifyToken(token)
}

export async function login(
  email: string,
  password: string,
): Promise<{ success: boolean; user?: User; error?: string }> {
  if (!isDatabaseConfigured() || !sql) {
    // Demo mode
    const user = DEMO_USERS.find((u) => u.email === email)
    if (!user) {
      return { success: false, error: "Invalid credentials" }
    }

    // Check demo passwords
    const validPasswords = {
      "admin@henryscheinone.com": "admin123",
      "manager@henryscheinone.com": "manager123",
      "user@henryscheinone.com": "user123",
    }

    if (validPasswords[email as keyof typeof validPasswords] !== password) {
      return { success: false, error: "Invalid credentials" }
    }

    return { success: true, user }
  }

  try {
    const users = await sql`
      SELECT id, email, name, role, department, active, password_hash
      FROM users
      WHERE email = ${email} AND active = true
    `

    if (users.length === 0) {
      return { success: false, error: "Invalid credentials" }
    }

    const user = users[0]
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      return { success: false, error: "Invalid credentials" }
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        active: user.active,
      },
    }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "Login failed" }
  }
}

export async function setAuthCookie(user: User) {
  const token = createToken(user)
  const cookieStore = await cookies()

  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete("auth-token")
}
