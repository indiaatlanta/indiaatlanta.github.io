import { type NextRequest, NextResponse } from "next/server"
import { deleteSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    await deleteSession()

    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete("session")

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.redirect(new URL("/login", request.url))
  }
}
