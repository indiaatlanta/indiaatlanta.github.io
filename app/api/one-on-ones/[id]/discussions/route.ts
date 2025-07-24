import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const oneOnOneId = Number.parseInt(params.id)

    if (!isDatabaseConfigured() || !sql) {
      // Return demo data
      return NextResponse.json({
        discussions: [
          {
            id: 1,
            one_on_one_id: oneOnOneId,
            user_id: 1,
            content: "I'd like to discuss opportunities for mentoring junior developers",
            created_at: "2024-01-15T10:00:00Z",
            user_name: "Demo User",
          },
        ],
      })
    }

    // Verify user has access to this one-on-one
    const oneOnOne = await sql`
      SELECT id FROM one_on_ones 
      WHERE id = ${oneOnOneId} AND (user_id = ${user.id} OR manager_id = ${user.id})
    `

    if (oneOnOne.length === 0) {
      return NextResponse.json({ error: "One-on-one not found" }, { status: 404 })
    }

    const discussions = await sql`
      SELECT 
        d.*,
        COALESCE(u.name, 'Unknown User') as user_name
      FROM one_on_one_discussions d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.one_on_one_id = ${oneOnOneId}
      ORDER BY d.created_at ASC
    `

    return NextResponse.json({ discussions })
  } catch (error) {
    console.error("Failed to fetch discussions:", error)
    return NextResponse.json({ error: "Failed to fetch discussions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const oneOnOneId = Number.parseInt(params.id)
    const body = await request.json()
    const { content } = body

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    if (!isDatabaseConfigured() || !sql) {
      // Return demo response
      return NextResponse.json({
        discussion: {
          id: Date.now(),
          one_on_one_id: oneOnOneId,
          user_id: user.id,
          content,
          created_at: new Date().toISOString(),
          user_name: user.name,
        },
      })
    }

    // Verify user has access to this one-on-one
    const oneOnOne = await sql`
      SELECT id FROM one_on_ones 
      WHERE id = ${oneOnOneId} AND (user_id = ${user.id} OR manager_id = ${user.id})
    `

    if (oneOnOne.length === 0) {
      return NextResponse.json({ error: "One-on-one not found" }, { status: 404 })
    }

    const result = await sql`
      INSERT INTO one_on_one_discussions (one_on_one_id, user_id, content)
      VALUES (${oneOnOneId}, ${user.id}, ${content})
      RETURNING *
    `

    // Get the discussion with user name
    const discussionWithUser = await sql`
      SELECT 
        d.*,
        COALESCE(u.name, 'Unknown User') as user_name
      FROM one_on_one_discussions d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.id = ${result[0].id}
    `

    return NextResponse.json({ discussion: discussionWithUser[0] })
  } catch (error) {
    console.error("Failed to create discussion:", error)
    return NextResponse.json({ error: "Failed to create discussion" }, { status: 500 })
  }
}
