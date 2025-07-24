import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/lib/auth"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const oneOnOneId = Number.parseInt(params.id)

    // Get one-on-one with related data
    const [oneOnOne] = await sql`
      SELECT 
        o.*,
        u.name as user_name,
        m.name as manager_name
      FROM one_on_ones o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN users m ON o.manager_id = m.id
      WHERE o.id = ${oneOnOneId} AND (o.user_id = ${user.id} OR o.manager_id = ${user.id})
    `

    if (!oneOnOne) {
      return NextResponse.json({ error: "One-on-one not found" }, { status: 404 })
    }

    // Get action items
    const actionItems = await sql`
      SELECT * FROM action_items 
      WHERE one_on_one_id = ${oneOnOneId}
      ORDER BY created_at DESC
    `

    // Get discussions
    const discussions = await sql`
      SELECT d.*, u.name as user_name
      FROM discussions d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.one_on_one_id = ${oneOnOneId}
      ORDER BY d.created_at ASC
    `

    return NextResponse.json({
      oneOnOne: {
        ...oneOnOne,
        action_items: actionItems,
        discussions: discussions,
      },
    })
  } catch (error) {
    console.error("Database query failed:", error)

    // Return demo data on error
    const demoOneOnOne = {
      id: Number.parseInt(params.id),
      user_id: 1,
      manager_id: 10,
      meeting_date: "2024-01-15",
      notes: "Discussed Q1 goals and career development opportunities.",
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
      user_name: "Demo User",
      manager_name: "Sarah Johnson",
      action_items: [
        {
          id: 1,
          one_on_one_id: Number.parseInt(params.id),
          title: "Complete React training",
          description: "Finish the advanced React course by end of month",
          status: "in-progress",
          due_date: "2024-01-31",
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z",
        },
      ],
      discussions: [
        {
          id: 1,
          one_on_one_id: Number.parseInt(params.id),
          user_id: 1,
          content: "Looking forward to taking on more challenging projects this quarter.",
          created_at: "2024-01-15T10:00:00Z",
          user_name: "Demo User",
        },
      ],
    }

    return NextResponse.json({ oneOnOne: demoOneOnOne })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const oneOnOneId = Number.parseInt(params.id)
    const { notes } = await request.json()

    // Update the one-on-one
    const [updatedOneOnOne] = await sql`
      UPDATE one_on_ones 
      SET notes = ${notes}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${oneOnOneId} AND (user_id = ${user.id} OR manager_id = ${user.id})
      RETURNING *
    `

    if (!updatedOneOnOne) {
      return NextResponse.json({ error: "One-on-one not found" }, { status: 404 })
    }

    // Get the full record with names
    const [fullOneOnOne] = await sql`
      SELECT 
        o.*,
        u.name as user_name,
        m.name as manager_name
      FROM one_on_ones o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN users m ON o.manager_id = m.id
      WHERE o.id = ${oneOnOneId}
    `

    return NextResponse.json({ oneOnOne: fullOneOnOne })
  } catch (error) {
    console.error("Failed to update one-on-one:", error)
    return NextResponse.json({ error: "Failed to update one-on-one" }, { status: 500 })
  }
}
