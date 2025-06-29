import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const JWT_SECRET = process.env.JWT_SECRET || "hs1-careers-matrix-secret-key-2024-change-in-production"

export interface User {
  id: number
  email: string
  name: string
  role: "admin" | "manager" | "user"
  department?: string
  job_title?: string
  manager_id?: number
  is_active: boolean
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function createToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  )
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function requireAuth(): Promise<User> {
  // This would be used in API routes to require authentication
  throw new Error("Not authenticated")
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth()
  if (user.role !== "admin") {
    throw new Error("Admin access required")
  }
  return user
}

export async function requireManager(): Promise<User> {
  const user = await requireAuth()
  if (user.role !== "admin" && user.role !== "manager") {
    throw new Error("Manager access required")
  }
  return user
}
