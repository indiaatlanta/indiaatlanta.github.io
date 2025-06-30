import { type NextRequest, NextResponse } from "next/server"
import { deleteSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")

    if (sessionCookie?.value) {
      await deleteSession(sessionCookie.value)
    }

    const response = NextResponse.json({ success: true })

    // Clear the session cookie
    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
