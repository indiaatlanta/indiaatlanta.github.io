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
      const demoOneOnOnes = [
        {
          id: 1,
          user_id: 1,
          manager_id: 10,
          meeting_date: "2024-01-15",
          notes:
            "Discussed Q1 goals and career development opportunities. Employee is interested in taking on more leadership responsibilities.",
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z",
          manager_name: "Sarah Johnson",
          user_name: "Demo User",
          action_items: [
            {
              id: 1,
              one_on_one_id: 1,
              title: "Complete React certification",
              description: "Enroll in and complete the React certification course by end of Q1",
              status: "in-progress",
              due_date: "2024-03-31",
              created_at: "2024-01-15T10:00:00Z",
              updated_at: "2024-01-15T10:00:00Z",
            },
          ],
          discussions: [
            {
              id: 1,
              one_on_one_id: 1,
              user_id: 1,
              content: "I'd like to discuss opportunities for mentoring junior developers",
              created_at: "2024-01-15T10:00:00Z",
              updated_at: "2024-01-15T10:00:00Z",
              user_name: "Demo User",
            },
          ],
        },
      ]
      return NextResponse.json({ oneOnOnes: demoOneOnOnes })
    }

    // Ensure tables exist with correct names
    await sql`
      CREATE TABLE IF NOT EXISTS one_on_ones (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        manager_id INTEGER NOT NULL,
        meeting_date DATE NOT NULL,
        notes TEXT DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS one_on_one_action_items (
        id SERIAL PRIMARY KEY,
        one_on_one_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        status VARCHAR(20) NOT NULL DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed', 'cancelled')),
        due_date DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS one_on_one_discussions (
        id SERIAL PRIMARY KEY,
        one_on_one_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Ensure demo managers exist
    await sql`
      INSERT INTO users (id, name, email, role, password_hash)
      VALUES 
        (10, 'Sarah Johnson', 'sarah.johnson@henryscheinone.com', 'manager', '$2a$10$demo.hash.for.development.only'),
        (11, 'Mike Chen', 'mike.chen@henryscheinone.com', 'manager', '$2a$10$demo.hash.for.development.only'),
        (12, 'Emily Davis', 'emily.davis@henryscheinone.com', 'manager', '$2a$10$demo.hash.for.development.only')
      ON CONFLICT (id) DO NOTHING
    `

    // Get one-on-ones for the current user (either as employee or manager)
    const oneOnOnes = await sql`
      SELECT 
        o.*,
        COALESCE(u1.name, 'Unknown User') as user_name,
        COALESCE(u2.name, 'Unknown Manager') as manager_name
      FROM one_on_ones o
      LEFT JOIN users u1 ON o.user_id = u1.id
      LEFT JOIN users u2 ON o.manager_id = u2.id
      WHERE o.user_id = ${user.id} OR o.manager_id = ${user.id}
      ORDER BY o.meeting_date DESC, o.created_at DESC
    `

    // Get action items for each one-on-one
    const oneOnOneIds = oneOnOnes.map((o) => o.id)
    let actionItems = []
    let discussions = []

    if (oneOnOneIds.length > 0) {
      actionItems = await sql`
        SELECT * FROM one_on_one_action_items
        WHERE one_on_one_id = ANY(${oneOnOneIds})
        ORDER BY created_at DESC
      `

      discussions = await sql`
        SELECT 
          d.*,
          COALESCE(u.name, 'Unknown User') as user_name
        FROM one_on_one_discussions d
        LEFT JOIN users u ON d.user_id = u.id
        WHERE d.one_on_one_id = ANY(${oneOnOneIds})
        ORDER BY d.created_at ASC
      `
    }

    // Group action items and discussions by one-on-one ID
    const oneOnOnesWithDetails = oneOnOnes.map((oneOnOne) => ({
      ...oneOnOne,
      action_items: actionItems.filter((item) => item.one_on_one_id === oneOnOne.id),
      discussions: discussions.filter((discussion) => discussion.one_on_one_id === oneOnOne.id),
    }))

    return NextResponse.json({ oneOnOnes: oneOnOnesWithDetails })
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

    const body = await request.json()
    const { managerId, meetingDate, notes } = body

    if (!managerId || !meetingDate) {
      return NextResponse.json({ error: "Manager ID and meeting date are required" }, { status: 400 })
    }

    if (!isDatabaseConfigured() || !sql) {
      // Return demo response
      return NextResponse.json({
        oneOnOne: {
          id: Date.now(),
          user_id: user.id,
          manager_id: managerId,
          meeting_date: meetingDate,
          notes: notes || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      })
    }

    // Ensure current user exists
    await sql`
      INSERT INTO users (id, name, email, role, password_hash)
      VALUES (${user.id}, ${user.name}, ${user.email}, ${user.role}, 'demo_hash')
      ON CONFLICT (id) DO NOTHING
    `

    // Ensure manager exists - create a demo manager if needed
    const managerExists = await sql`
      SELECT id FROM users WHERE id = ${managerId}
    `

    if (managerExists.length === 0) {
      // Create a demo manager
      await sql`
        INSERT INTO users (id, name, email, role, password_hash)
        VALUES (
          ${managerId}, 
          ${`Manager ${managerId}`}, 
          ${`manager${managerId}@henryscheinone.com`}, 
          'manager', 
          'demo_hash'
        )
      `
    }

    // Create one-on-one
    const result = await sql`
      INSERT INTO one_on_ones (user_id, manager_id, meeting_date, notes)
      VALUES (${user.id}, ${managerId}, ${meetingDate}, ${notes || ""})
      RETURNING *
    `

    return NextResponse.json({ oneOnOne: result[0] })
  } catch (error) {
    console.error("Failed to create one-on-one:", error)
    return NextResponse.json({ error: "Failed to create one-on-one" }, { status: 500 })
  }
}
