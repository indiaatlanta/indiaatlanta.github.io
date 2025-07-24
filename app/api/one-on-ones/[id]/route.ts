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
        oneOnOne: {
          id: 1,
          user_id: 1,
          manager_id: 10,
          meeting_date: "2024-01-15",
          notes: "Discussed Q1 goals and career development opportunities.",
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z",
          manager_name: "Sarah Johnson",
          user_name: "Demo User",
        },
      })
    }

    const oneOnOne = await sql`
      SELECT 
        o.*,
        COALESCE(u1.name, 'Unknown User') as user_name,
        COALESCE(u2.name, 'Unknown Manager') as manager_name
      FROM one_on_ones o
      LEFT JOIN users u1 ON o.user_id = u1.id
      LEFT JOIN users u2 ON o.manager_id = u2.id
      WHERE o.id = ${id} AND (o.user_id = ${user.id} OR o.manager_id = ${user.id})
    `

    if (oneOnOne.length === 0) {
      return NextResponse.json({ error: "One-on-one not found" }, { status: 404 })
    }

    return NextResponse.json({ oneOnOne: oneOnOne[0] })
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
    const body = await request.json()
    const { notes } = body

    if (!isDatabaseConfigured() || !sql) {
      // Return demo response
      return NextResponse.json({
        oneOnOne: {
          id,
          notes: notes || "",
          updated_at: new Date().toISOString(),
        },
      })
    }

    const result = await sql`
      UPDATE one_on_ones 
      SET notes = ${notes || ""}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND (user_id = ${user.id} OR manager_id = ${user.id})
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "One-on-one not found" }, { status: 404 })
    }

    return NextResponse.json({ oneOnOne: result[0] })
  } catch (error) {
    console.error("Failed to update one-on-one:", error)
    return NextResponse.json({ error: "Failed to update one-on-one" }, { status: 500 })
  }
}
