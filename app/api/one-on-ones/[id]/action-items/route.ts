import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/lib/auth"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const oneOnOneId = Number.parseInt(params.id)
    const { title, description, dueDate } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Verify the one-on-one exists and user has access
    const [oneOnOne] = await sql`
      SELECT * FROM one_on_ones 
      WHERE id = ${oneOnOneId} AND (user_id = ${user.id} OR manager_id = ${user.id})
    `

    if (!oneOnOne) {
      return NextResponse.json({ error: "One-on-one not found" }, { status: 404 })
    }

    // Create the action item
    const [actionItem] = await sql`
      INSERT INTO action_items (one_on_one_id, title, description, due_date)
      VALUES (${oneOnOneId}, ${title}, ${description || ""}, ${dueDate || null})
      RETURNING *
    `

    return NextResponse.json({ actionItem })
  } catch (error) {
    console.error("Failed to create action item:", error)
    return NextResponse.json({ error: "Failed to create action item" }, { status: 500 })
  }
}
