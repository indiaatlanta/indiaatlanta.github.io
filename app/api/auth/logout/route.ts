import { type NextRequest, NextResponse } from "next/server"
import { deleteSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")

    if (sessionCookie?.value) {
      await deleteSession(sessionCookie.value)
    }

    const response = NextResponse.json({ success: true })
    response.cookies.delete("session")

    return response
  } catch (error) {
    console.error("Logout error:", error)
    const response = NextResponse.json({ success: true })
    response.cookies.delete("session")
    return response
  }
}
