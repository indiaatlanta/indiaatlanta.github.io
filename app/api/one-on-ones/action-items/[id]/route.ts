import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/lib/auth"

const sql = neon(process.env.DATABASE_URL!)

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const actionItemId = Number.parseInt(params.id)
    const { title, description, status, dueDate } = await request.json()

    // Update the action item
    const [actionItem] = await sql`
      UPDATE action_items 
      SET 
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        status = COALESCE(${status}, status),
        due_date = COALESCE(${dueDate}, due_date),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${actionItemId}
      RETURNING *
    `

    if (!actionItem) {
      return NextResponse.json({ error: "Action item not found" }, { status: 404 })
    }

    return NextResponse.json({ actionItem })
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

    // Delete the action item
    const [deletedItem] = await sql`
      DELETE FROM action_items 
      WHERE id = ${actionItemId}
      RETURNING *
    `

    if (!deletedItem) {
      return NextResponse.json({ error: "Action item not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete action item:", error)
    return NextResponse.json({ error: "Failed to delete action item" }, { status: 500 })
  }
}
