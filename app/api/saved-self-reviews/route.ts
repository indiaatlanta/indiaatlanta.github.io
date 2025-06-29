import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (!isDatabaseConfigured() || !sql) {
      // Return mock data for demo mode
      return NextResponse.json({
        reviews: [
          {
            id: 1,
            name: "Q1 2024 Self Review",
            description: "First quarter self assessment",
            role_name: "Software Engineer",
            created_at: new Date().toISOString(),
            user_name: user.name,
          },
        ],
        isDemoMode: true,
      })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    let query
    if (user.role === "admin" || (user.role === "manager" && userId)) {
      // Admin can see all, managers can see specific user's data
      const targetUserId = userId ? Number.parseInt(userId) : user.id
      query = sql`
        SELECT 
          ssr.*,
          u.name as user_name,
          u.email as user_email
        FROM saved_self_reviews ssr
        JOIN users u ON ssr.user_id = u.id
        WHERE ssr.user_id = ${targetUserId}
        ORDER BY ssr.created_at DESC
      `
    } else if (user.role === "manager") {
      // Managers can see their team's reviews
      query = sql`
        SELECT 
          ssr.*,
          u.name as user_name,
          u.email as user_email
        FROM saved_self_reviews ssr
        JOIN users u ON ssr.user_id = u.id
        WHERE u.manager_id = ${user.id} OR ssr.user_id = ${user.id}
        ORDER BY ssr.created_at DESC
      `
    } else {
      // Regular users can only see their own
      query = sql`
        SELECT 
          ssr.*,
          u.name as user_name,
          u.email as user_email
        FROM saved_self_reviews ssr
        JOIN users u ON ssr.user_id = u.id
        WHERE ssr.user_id = ${user.id}
        ORDER BY ssr.created_at DESC
      `
    }

    const reviews = await query
    return NextResponse.json({ reviews, isDemoMode: false })
  } catch (error) {
    console.error("Get saved self reviews error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json({
        id: 1,
        message: "Self review saved successfully (Demo Mode)",
        created_at: new Date().toISOString(),
      })
    }

    const { name, description, roleId, roleName, reviewData } = body

    const result = await sql`
      INSERT INTO saved_self_reviews (user_id, role_id, role_name, name, description, review_data)
      VALUES (${user.id}, ${roleId || null}, ${roleName}, ${name}, ${description || null}, ${JSON.stringify(reviewData)})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Save self review error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
