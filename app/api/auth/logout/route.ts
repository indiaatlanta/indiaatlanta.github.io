import { NextResponse } from "next/server"
import { deleteSession } from "@/lib/auth"

export async function POST() {
  try {
    await deleteSession()

    // Create response and clear session cookie
    const response = NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL || "http://localhost:3000"))
    response.cookies.delete("session")

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}
