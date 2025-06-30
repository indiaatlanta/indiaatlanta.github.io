import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")

    if (sessionCookie && isDatabaseConfigured() && sql) {
      try {
        // Delete session from database
        await sql`
          DELETE FROM user_sessions 
          WHERE id = ${sessionCookie.value}
        `
        console.log("Session deleted from database:", sessionCookie.value)
      } catch (error) {
        console.error("Error deleting session from database:", error)
      }
    }

    // Clear session cookie
    cookieStore.delete("session")
    console.log("Session cookie cleared")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
