import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function POST() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session")?.value

    if (sessionId) {
      // Try to delete session from database if it exists
      if (isDatabaseConfigured() && sql) {
        try {
          await sql`DELETE FROM user_sessions WHERE id = ${sessionId}`
          console.log("Session deleted from database:", sessionId)
        } catch (dbError) {
          console.log("Could not delete database session (table may not exist):", dbError.message)
          // Continue with cookie deletion even if database deletion fails
        }
      }

      // Delete session cookie
      cookieStore.delete("session")
      console.log("Session cookie deleted")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
