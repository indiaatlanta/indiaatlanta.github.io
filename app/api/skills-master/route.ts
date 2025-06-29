import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { logAuditEvent } from "@/lib/audit"

export async function GET(request: Request) {
  try {
    if (!sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const category_id = searchParams.get("category_id")
    const search = searchParams.get("search")

    let query = sql`
      SELECT 
        sm.*,
        sc.name as category_name,
        sc.color as category_color,
        sc.sort_order as category_sort_order
      FROM skills_master sm
      LEFT JOIN skill_categories sc ON sm.category_id = sc.id
    `

    const conditions = []
    if (category_id) {
      conditions.push(sql`sm.category_id = ${category_id}`)
    }
    if (search) {
      conditions.push(sql`sm.name ILIKE ${"%" + search + "%"}`)
    }

    if (conditions.length > 0) {
      query = sql`${query} WHERE ${sql.join(conditions, sql` AND `)}`
    }

    query = sql`${query} ORDER BY sc.sort_order, sm.sort_order, sm.name`

    const skills = await query

    return NextResponse.json({ skills })
  } catch (error) {
    console.error("Get skills error:", error)
    return NextResponse.json({ error: "Failed to get skills" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const body = await request.json()
    const { name, category_id, description, sort_order } = body

    if (!name || !category_id) {
      return NextResponse.json({ error: "Name and category_id are required" }, { status: 400 })
    }

    const newSkill = await sql`
      INSERT INTO skills_master (name, category_id, description, sort_order)
      VALUES (${name}, ${category_id}, ${description || null}, ${sort_order || 0})
      RETURNING *
    `

    // Log audit event
    await logAuditEvent({
      action: "CREATE",
      table_name: "skills_master",
      record_id: newSkill[0].id,
      new_values: newSkill[0],
    })

    return NextResponse.json({ skill: newSkill[0] })
  } catch (error) {
    console.error("Create skill error:", error)
    return NextResponse.json({ error: "Failed to create skill" }, { status: 500 })
  }
}
