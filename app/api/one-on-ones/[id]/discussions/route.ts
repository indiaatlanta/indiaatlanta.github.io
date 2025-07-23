import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { content } = body
    const oneOnOneId = Number.parseInt(params.id)

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json({
        discussion: {
          id: Date.now(),
          one_on_one_id: oneOnOneId,
          user_id: user.id,
          content: content.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
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
      return NextResponse.json({ error: "One-on-one not found or unauthorized" }, { status: 404 })
    }

    // Create discussion
    const result = await sql`
      INSERT INTO one_on_one_discussions (one_on_one_id, user_id, content)
      VALUES (${oneOnOneId}, ${user.id}, ${content.trim()})
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
