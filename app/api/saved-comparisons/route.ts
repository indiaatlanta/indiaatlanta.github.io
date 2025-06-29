import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (!isDatabaseConfigured() || !sql) {
      // Return mock data for demo mode
      return NextResponse.json({
        comparisons: [
          {
            id: 1,
            name: "E2 vs E3 Comparison",
            description: "Comparing Software Engineer and Senior Engineer roles",
            role_names: ["Software Engineer", "Senior Engineer"],
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
          sc.*,
          u.name as user_name,
          u.email as user_email
        FROM saved_comparisons sc
        JOIN users u ON sc.user_id = u.id
        WHERE sc.user_id = ${targetUserId}
        ORDER BY sc.created_at DESC
      `
    } else if (user.role === "manager") {
      // Managers can see their team's comparisons
      query = sql`
        SELECT 
          sc.*,
          u.name as user_name,
          u.email as user_email
        FROM saved_comparisons sc
        JOIN users u ON sc.user_id = u.id
        WHERE u.manager_id = ${user.id} OR sc.user_id = ${user.id}
        ORDER BY sc.created_at DESC
      `
    } else {
      // Regular users can only see their own
      query = sql`
        SELECT 
          sc.*,
          u.name as user_name,
          u.email as user_email
        FROM saved_comparisons sc
        JOIN users u ON sc.user_id = u.id
        WHERE sc.user_id = ${user.id}
        ORDER BY sc.created_at DESC
      `
    }

    const comparisons = await query
    return NextResponse.json({ comparisons, isDemoMode: false })
  } catch (error) {
    console.error("Get saved comparisons error:", error)
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
        message: "Comparison saved successfully (Demo Mode)",
        created_at: new Date().toISOString(),
      })
    }

    const { name, description, roleIds, roleNames, comparisonData } = body

    const result = await sql`
      INSERT INTO saved_comparisons (user_id, name, description, role_ids, role_names, comparison_data)
      VALUES (${user.id}, ${name}, ${description || null}, ${roleIds}, ${roleNames}, ${JSON.stringify(comparisonData)})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Save comparison error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
