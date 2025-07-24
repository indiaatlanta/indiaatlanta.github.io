import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)

    if (!isDatabaseConfigured() || !sql) {
      // Return demo data
      return NextResponse.json({
        id,
        meeting_date: "2024-01-15",
        notes: "Discussed Q1 goals and performance review process.",
        manager_name: "Sarah Johnson",
        action_items: [],
        discussions: [],
      })
    }

    const result = await sql`
      SELECT * FROM one_on_ones
      WHERE id = ${id} AND user_id = ${user.id}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "One-on-one not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Failed to fetch one-on-one:", error)
    return NextResponse.json({ error: "Failed to fetch one-on-one" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    const { notes } = await request.json()

    if (!isDatabaseConfigured() || !sql) {
      // Return demo response
      return NextResponse.json({
        id,
        notes,
        meeting_date: "2024-01-15",
        manager_name: "Sarah Johnson",
        action_items: [],
        discussions: [],
      })
    }

    const result = await sql`
      UPDATE one_on_ones
      SET notes = ${notes}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "One-on-one not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
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

    const id = Number.parseInt(params.id)

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json({ success: true })
    }

    const result = await sql`
      DELETE FROM one_on_ones
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "One-on-one not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete one-on-one:", error)
    return NextResponse.json({ error: "Failed to delete one-on-one" }, { status: 500 })
  }
}
