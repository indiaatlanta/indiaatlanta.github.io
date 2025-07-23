import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, status, dueDate } = body
    const actionItemId = Number.parseInt(params.id)

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json({
        actionItem: {
          id: actionItemId,
          title: title || "",
          description: description || "",
          status: status || "not-started",
          due_date: dueDate || null,
          updated_at: new Date().toISOString(),
        },
      })
    }

    // Verify user has access to this action item
    const actionItem = await sql`
      SELECT ai.* FROM one_on_one_action_items ai
      JOIN one_on_ones o ON ai.one_on_one_id = o.id
      WHERE ai.id = ${actionItemId} AND (o.user_id = ${user.id} OR o.manager_id = ${user.id})
    `

    if (actionItem.length === 0) {
      return NextResponse.json({ error: "Action item not found or unauthorized" }, { status: 404 })
    }

    // Update action item
    const result = await sql`
      UPDATE one_on_one_action_items 
      SET 
        title = ${title || actionItem[0].title},
        description = ${description !== undefined ? description : actionItem[0].description},
        status = ${status || actionItem[0].status},
        due_date = ${dueDate !== undefined ? dueDate : actionItem[0].due_date},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${actionItemId}
      RETURNING *
    `

    return NextResponse.json({ actionItem: result[0] })
  } catch (error) {
    console.error("Failed to update action item:", error)
    return NextResponse.json({ error: "Failed to update action item" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const actionItemId = Number.parseInt(params.id)

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json({ success: true })
    }

    // Verify user has access to this action item and delete it
    const result = await sql`
      DELETE FROM one_on_one_action_items 
      WHERE id = ${actionItemId} 
      AND one_on_one_id IN (
        SELECT id FROM one_on_ones 
        WHERE user_id = ${user.id} OR manager_id = ${user.id}
      )
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Action item not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete action item:", error)
    return NextResponse.json({ error: "Failed to delete action item" }, { status: 500 })
  }
}
