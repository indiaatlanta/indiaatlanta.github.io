import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const oneOnOneId = Number.parseInt(params.id)

    if (!isDatabaseConfigured() || !sql) {
      // Return demo data
      return NextResponse.json({
        actionItems: [
          {
            id: 1,
            one_on_one_id: oneOnOneId,
            title: "Complete React certification",
            description: "Enroll in and complete the React certification course",
            status: "in-progress",
            due_date: "2024-03-31",
            created_at: "2024-01-15T10:00:00Z",
            updated_at: "2024-01-15T10:00:00Z",
          },
        ],
      })
    }

    // Verify user has access to this one-on-one
    const oneOnOne = await sql`
      SELECT id FROM one_on_ones 
      WHERE id = ${oneOnOneId} AND (user_id = ${user.id} OR manager_id = ${user.id})
    `

    if (oneOnOne.length === 0) {
      return NextResponse.json({ error: "One-on-one not found" }, { status: 404 })
    }

    const actionItems = await sql`
      SELECT * FROM one_on_one_action_items
      WHERE one_on_one_id = ${oneOnOneId}
      ORDER BY created_at DESC
    `

    return NextResponse.json({ actionItems })
  } catch (error) {
    console.error("Failed to fetch action items:", error)
    return NextResponse.json({ error: "Failed to fetch action items" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const oneOnOneId = Number.parseInt(params.id)
    const body = await request.json()
    const { title, description, status, dueDate } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    if (!isDatabaseConfigured() || !sql) {
      // Return demo response
      return NextResponse.json({
        actionItem: {
          id: Date.now(),
          one_on_one_id: oneOnOneId,
          title,
          description: description || "",
          status: status || "not-started",
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
      return NextResponse.json({ error: "One-on-one not found" }, { status: 404 })
    }

    const result = await sql`
      INSERT INTO one_on_one_action_items (one_on_one_id, title, description, status, due_date)
      VALUES (${oneOnOneId}, ${title}, ${description || ""}, ${status || "not-started"}, ${dueDate || null})
      RETURNING *
    `

    return NextResponse.json({ actionItem: result[0] })
  } catch (error) {
    console.error("Failed to create action item:", error)
    return NextResponse.json({ error: "Failed to create action item" }, { status: 500 })
  }
}
