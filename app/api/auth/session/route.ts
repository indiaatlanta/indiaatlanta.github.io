import { type NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "No session found" }, { status: 401 })
    }

    const user = await verifySession(sessionCookie.value)

    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Session verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
