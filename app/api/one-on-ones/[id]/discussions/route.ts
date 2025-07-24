import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/lib/auth"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const oneOnOneId = Number.parseInt(params.id)
    const { content } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // Verify the one-on-one exists and user has access
    const [oneOnOne] = await sql`
      SELECT * FROM one_on_ones 
      WHERE id = ${oneOnOneId} AND (user_id = ${user.id} OR manager_id = ${user.id})
    `

    if (!oneOnOne) {
      return NextResponse.json({ error: "One-on-one not found" }, { status: 404 })
    }

    // Create the discussion
    const [discussion] = await sql`
      INSERT INTO discussions (one_on_one_id, user_id, content)
      VALUES (${oneOnOneId}, ${user.id}, ${content})
      RETURNING *
    `

    // Get the discussion with user name
    const [fullDiscussion] = await sql`
      SELECT d.*, u.name as user_name
      FROM discussions d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.id = ${discussion.id}
    `

    return NextResponse.json({ discussion: fullDiscussion })
  } catch (error) {
    console.error("Failed to create discussion:", error)
    return NextResponse.json({ error: "Failed to create discussion" }, { status: 500 })
  }
}
