import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session")?.value

    if (sessionToken) {
      try {
        // Delete session from database
        await sql`
          DELETE FROM user_sessions 
          WHERE id = ${sessionToken}
        `
      } catch (dbError) {
        console.log("Database unavailable for session cleanup")
      }
    }

    // Clear session cookie
    const response = NextResponse.json({ success: true })
    response.cookies.delete("session")

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
