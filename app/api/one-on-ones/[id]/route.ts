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
    const { notes } = body
    const oneOnOneId = Number.parseInt(params.id)

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json({
        oneOnOne: {
          id: oneOnOneId,
          notes: notes || "",
          updated_at: new Date().toISOString(),
        },
      })
    }

    // Update one-on-one notes
    const result = await sql`
      UPDATE one_on_ones 
      SET notes = ${notes || ""}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${oneOnOneId} AND (user_id = ${user.id} OR manager_id = ${user.id})
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "One-on-one not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({ oneOnOne: result[0] })
  } catch (error) {
    console.error("Failed to update one-on-one:", error)
    return NextResponse.json({ error: "Failed to update one-on-one" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const oneOnOneId = Number.parseInt(params.id)

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json({ success: true })
    }

    // Delete one-on-one (cascades to action items and discussions)
    const result = await sql`
      DELETE FROM one_on_ones 
      WHERE id = ${oneOnOneId} AND (user_id = ${user.id} OR manager_id = ${user.id})
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "One-on-one not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete one-on-one:", error)
    return NextResponse.json({ error: "Failed to delete one-on-one" }, { status: 500 })
  }
}
