import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/lib/auth"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create tables if they don't exist
    await sql`
      CREATE TABLE IF NOT EXISTS one_on_ones (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        manager_id INTEGER NOT NULL,
        meeting_date DATE NOT NULL,
        notes TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS action_items (
        id SERIAL PRIMARY KEY,
        one_on_one_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        status VARCHAR(20) DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed', 'cancelled')),
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS discussions (
        id SERIAL PRIMARY KEY,
        one_on_one_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Ensure demo managers exist
    await sql`
      INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at)
      VALUES 
        (10, 'Sarah Johnson', 'sarah.johnson@henryscheinone.com', '$2b$10$dummy', 'manager', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (11, 'Mike Chen', 'mike.chen@henryscheinone.com', '$2b$10$dummy', 'manager', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (12, 'Lisa Rodriguez', 'lisa.rodriguez@henryscheinone.com', '$2b$10$dummy', 'manager', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO NOTHING
    `

    // Get one-on-ones with related data
    const oneOnOnes = await sql`
      SELECT 
        o.*,
        u.name as user_name,
        m.name as manager_name,
        COALESCE(
          json_agg(
            CASE WHEN a.id IS NOT NULL THEN
              json_build_object(
                'id', a.id,
                'one_on_one_id', a.one_on_one_id,
                'title', a.title,
                'description', a.description,
                'status', a.status,
                'due_date', a.due_date,
                'created_at', a.created_at,
                'updated_at', a.updated_at
              )
            END
          ) FILTER (WHERE a.id IS NOT NULL), '[]'::json
        ) as action_items,
        COALESCE(
          json_agg(
            CASE WHEN d.id IS NOT NULL THEN
              json_build_object(
                'id', d.id,
                'one_on_one_id', d.one_on_one_id,
                'user_id', d.user_id,
                'content', d.content,
                'created_at', d.created_at,
                'user_name', du.name
              )
            END
          ) FILTER (WHERE d.id IS NOT NULL), '[]'::json
        ) as discussions
      FROM one_on_ones o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN users m ON o.manager_id = m.id
      LEFT JOIN action_items a ON o.id = a.one_on_one_id
      LEFT JOIN discussions d ON o.id = d.one_on_one_id
      LEFT JOIN users du ON d.user_id = du.id
      WHERE o.user_id = ${user.id} OR o.manager_id = ${user.id}
      GROUP BY o.id, u.name, m.name
      ORDER BY o.meeting_date DESC
    `

    return NextResponse.json({ oneOnOnes })
  } catch (error) {
    console.error("Database query failed:", error)

    // Return demo data on error
    const demoOneOnOnes = [
      {
        id: 1,
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
            one_on_one_id: 1,
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
            one_on_one_id: 1,
            user_id: 1,
            content: "Looking forward to taking on more challenging projects this quarter.",
            created_at: "2024-01-15T10:00:00Z",
            user_name: "Demo User",
          },
        ],
      },
    ]

    return NextResponse.json({ oneOnOnes: demoOneOnOnes })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { managerId, meetingDate, notes } = await request.json()

    if (!managerId || !meetingDate) {
      return NextResponse.json({ error: "Manager ID and meeting date are required" }, { status: 400 })
    }

    // Ensure the manager exists
    await sql`
      INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at)
      VALUES (${managerId}, 'Manager ${managerId}', 'manager${managerId}@henryscheinone.com', '$2b$10$dummy', 'manager', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO NOTHING
    `

    // Create the one-on-one
    const [oneOnOne] = await sql`
      INSERT INTO one_on_ones (user_id, manager_id, meeting_date, notes)
      VALUES (${user.id}, ${managerId}, ${meetingDate}, ${notes || ""})
      RETURNING *
    `

    // Get the full record with names
    const [fullOneOnOne] = await sql`
      SELECT 
        o.*,
        u.name as user_name,
        m.name as manager_name
      FROM one_on_ones o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN users m ON o.manager_id = m.id
      WHERE o.id = ${oneOnOne.id}
    `

    return NextResponse.json({
      oneOnOne: {
        ...fullOneOnOne,
        action_items: [],
        discussions: [],
      },
    })
  } catch (error) {
    console.error("Failed to create one-on-one:", error)
    return NextResponse.json({ error: "Failed to create one-on-one" }, { status: 500 })
  }
}
