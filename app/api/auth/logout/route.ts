import { NextResponse } from "next/server"
import { clearAuthCookie } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function POST() {
  try {
    await clearAuthCookie()
    redirect("/")
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
