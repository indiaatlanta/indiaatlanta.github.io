import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const actionItemId = Number.parseInt(params.id)
    const { status, description, due_date } = await request.json()

    if (!isDatabaseConfigured() || !sql) {
      // Return demo response
      return NextResponse.json({
        id: actionItemId,
        status,
        description: description || "Demo action item",
        due_date,
        created_at: new Date().toISOString(),
      })
    }

    // Verify the action item belongs to the user's one-on-one
    const authCheck = await sql`
      SELECT ai.id FROM action_items ai
      JOIN one_on_ones o ON ai.one_on_one_id = o.id
      WHERE ai.id = ${actionItemId} AND o.user_id = ${user.id}
    `

    if (authCheck.length === 0) {
      return NextResponse.json({ error: "Action item not found" }, { status: 404 })
    }

    const updateFields = []
    const updateValues = []

    if (status !== undefined) {
      updateFields.push("status = $" + (updateValues.length + 1))
      updateValues.push(status)
    }
    if (description !== undefined) {
      updateFields.push("description = $" + (updateValues.length + 1))
      updateValues.push(description)
    }
    if (due_date !== undefined) {
      updateFields.push("due_date = $" + (updateValues.length + 1))
      updateValues.push(due_date)
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    const result = await sql`
      UPDATE action_items
      SET ${sql.unsafe(updateFields.join(", "))}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${actionItemId}
      RETURNING *
    `

    return NextResponse.json(result[0])
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

    // Verify the action item belongs to the user's one-on-one
    const authCheck = await sql`
      SELECT ai.id FROM action_items ai
      JOIN one_on_ones o ON ai.one_on_one_id = o.id
      WHERE ai.id = ${actionItemId} AND o.user_id = ${user.id}
    `

    if (authCheck.length === 0) {
      return NextResponse.json({ error: "Action item not found" }, { status: 404 })
    }

    await sql`
      DELETE FROM action_items WHERE id = ${actionItemId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete action item:", error)
    return NextResponse.json({ error: "Failed to delete action item" }, { status: 500 })
  }
}
