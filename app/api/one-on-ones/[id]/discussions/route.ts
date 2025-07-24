import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const oneOnOneId = Number.parseInt(params.id)
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    if (!isDatabaseConfigured() || !sql) {
      // Return demo response
      return NextResponse.json({
        id: Date.now(),
        message,
        user_name: user.name,
        created_at: new Date().toISOString(),
      })
    }

    // Verify the one-on-one belongs to the user
    const oneOnOneCheck = await sql`
      SELECT id FROM one_on_ones WHERE id = ${oneOnOneId} AND user_id = ${user.id}
    `

    if (oneOnOneCheck.length === 0) {
      return NextResponse.json({ error: "One-on-one not found" }, { status: 404 })
    }

    const result = await sql`
      INSERT INTO discussions (one_on_one_id, user_id, user_name, message)
      VALUES (${oneOnOneId}, ${user.id}, ${user.name}, ${message})
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Failed to create discussion:", error)
    return NextResponse.json({ error: "Failed to create discussion" }, { status: 500 })
  }
}
