import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, dueDate } = body
    const oneOnOneId = Number.parseInt(params.id)

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json({
        actionItem: {
          id: Date.now(),
          one_on_one_id: oneOnOneId,
          title,
          description: description || "",
          status: "not-started",
          due_date: dueDate || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      })
    }

    // Verify user has access to this one-on-one
    const oneOnOne = await sql`
      SELECT id FROM one_on_ones 
      WHERE id = ${oneOnOneId} AND (user_id = ${user.id} OR manager_id = ${user.id})
    `

    if (oneOnOne.length === 0) {
      return NextResponse.json({ error: "One-on-one not found or unauthorized" }, { status: 404 })
    }

    // Create action item
    const result = await sql`
      INSERT INTO one_on_one_action_items (one_on_one_id, title, description, due_date)
      VALUES (${oneOnOneId}, ${title}, ${description || ""}, ${dueDate || null})
      RETURNING *
    `

    return NextResponse.json({ actionItem: result[0] })
  } catch (error) {
    console.error("Failed to create action item:", error)
    return NextResponse.json({ error: "Failed to create action item" }, { status: 500 })
  }
}
