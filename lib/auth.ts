import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET || "hs1-careers-matrix-secret-key-2024-change-in-production"

export interface User {
  id: number
  email: string
  name: string
  role: "admin" | "manager" | "user"
  department?: string
  job_title?: string
}

export async function getSession(): Promise<User | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any

    return {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      department: decoded.department,
      job_title: decoded.job_title,
    }
  } catch (error) {
    console.error("Session error:", error)
    return null
  }
}

export function requireAuth(allowedRoles?: string[]) {
  return async (request: Request) => {
    const user = await getSession()

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return new Response("Forbidden", { status: 403 })
    }

    return user
  }
}
