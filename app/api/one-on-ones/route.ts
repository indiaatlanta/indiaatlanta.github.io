import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isDatabaseConfigured() || !sql) {
      // Return demo data
      return NextResponse.json([
        {
          id: 1,
          meeting_date: "2024-01-15",
          notes: "Discussed Q1 goals and performance review process.",
          manager_name: "Sarah Johnson",
          action_items: [
            {
              id: 1,
              description: "Complete project documentation",
              status: "in-progress",
              due_date: "2024-01-30",
              created_at: "2024-01-15T10:00:00Z",
            },
          ],
          discussions: [
            {
              id: 1,
              message: "Great progress on the new feature implementation!",
              user_name: "Sarah Johnson",
              created_at: "2024-01-15T10:30:00Z",
            },
          ],
        },
      ])
    }

    // Get one-on-ones with related data
    const oneOnOnes = await sql`
      SELECT 
        o.id,
        o.meeting_date,
        o.notes,
        o.manager_name,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', ai.id,
              'description', ai.description,
              'status', ai.status,
              'due_date', ai.due_date,
              'created_at', ai.created_at
            )
          ) FILTER (WHERE ai.id IS NOT NULL),
          '[]'::json
        ) as action_items,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', d.id,
              'message', d.message,
              'user_name', d.user_name,
              'created_at', d.created_at
            )
          ) FILTER (WHERE d.id IS NOT NULL),
          '[]'::json
        ) as discussions
      FROM one_on_ones o
      LEFT JOIN action_items ai ON o.id = ai.one_on_one_id
      LEFT JOIN discussions d ON o.id = d.one_on_one_id
      WHERE o.user_id = ${user.id}
      GROUP BY o.id, o.meeting_date, o.notes, o.manager_name
      ORDER BY o.meeting_date DESC
    `

    return NextResponse.json(oneOnOnes)
  } catch (error) {
    console.error("Failed to fetch one-on-ones:", error)
    return NextResponse.json({ error: "Failed to fetch one-on-ones" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { meeting_date, manager_name, notes } = await request.json()

    if (!meeting_date || !manager_name) {
      return NextResponse.json({ error: "Meeting date and manager name are required" }, { status: 400 })
    }

    if (!isDatabaseConfigured() || !sql) {
      // Return demo response
      return NextResponse.json({
        id: Date.now(),
        meeting_date,
        manager_name,
        notes: notes || "",
        action_items: [],
        discussions: [],
      })
    }

    // Ensure demo managers exist
    const demoManagers = [
      { name: "Sarah Johnson", email: "sarah.johnson@henryscheinone.com" },
      { name: "Mike Chen", email: "mike.chen@henryscheinone.com" },
      { name: "Emily Davis", email: "emily.davis@henryscheinone.com" },
      { name: "David Wilson", email: "david.wilson@henryscheinone.com" },
    ]

    for (const manager of demoManagers) {
      await sql`
        INSERT INTO users (name, email, role, password_hash)
        VALUES (${manager.name}, ${manager.email}, 'admin', 'demo_hash')
        ON CONFLICT (email) DO NOTHING
      `
    }

    // Get manager ID
    const managerResult = await sql`
      SELECT id FROM users WHERE name = ${manager_name} LIMIT 1
    `

    let managerId = managerResult.length > 0 ? managerResult[0].id : null

    if (!managerId) {
      // Create manager if not found
      const newManager = await sql`
        INSERT INTO users (name, email, role, password_hash)
        VALUES (${manager_name}, ${manager_name.toLowerCase().replace(" ", ".")}@henryscheinone.com, 'admin', 'demo_hash')
        RETURNING id
      `
      managerId = newManager[0].id
    }

    // Create one-on-one
    const result = await sql`
      INSERT INTO one_on_ones (user_id, manager_id, manager_name, meeting_date, notes)
      VALUES (${user.id}, ${managerId}, ${manager_name}, ${meeting_date}, ${notes || ""})
      RETURNING *
    `

    const oneOnOne = {
      ...result[0],
      action_items: [],
      discussions: [],
    }

    return NextResponse.json(oneOnOne)
  } catch (error) {
    console.error("Failed to create one-on-one:", error)
    return NextResponse.json({ error: "Failed to create one-on-one" }, { status: 500 })
  }
}
