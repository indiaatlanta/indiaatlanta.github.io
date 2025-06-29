import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "hs1-careers-matrix-secret-key-2024-change-in-production"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ user: null })
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any

      return NextResponse.json({
        user: {
          id: decoded.userId,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
          department: decoded.department,
          job_title: decoded.job_title,
        },
      })
    } catch (jwtError) {
      // Token is invalid or expired
      const response = NextResponse.json({ user: null })
      response.cookies.delete("auth-token")
      return response
    }
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ error: "Failed to check session" }, { status: 500 })
  }
}
