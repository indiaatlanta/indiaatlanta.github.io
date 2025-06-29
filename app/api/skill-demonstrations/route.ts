import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { logAuditEvent } from "@/lib/audit"

export async function GET(request: Request) {
  try {
    if (!sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const skill_id = searchParams.get("skill_id")
    const job_role_id = searchParams.get("job_role_id")

    let query = sql`
      SELECT 
        dt.*,
        sm.name as skill_name,
        COUNT(djr.job_role_id) as role_count
      FROM demonstration_templates dt
      JOIN skills_master sm ON dt.skill_id = sm.id
      LEFT JOIN demonstration_job_roles djr ON dt.id = djr.demonstration_template_id
    `

    const conditions = []
    if (skill_id) {
      conditions.push(sql`dt.skill_id = ${skill_id}`)
    }
    if (job_role_id) {
      conditions.push(sql`djr.job_role_id = ${job_role_id}`)
    }

    if (conditions.length > 0) {
      query = sql`${query} WHERE ${sql.join(conditions, sql` AND `)}`
    }

    query = sql`${query} GROUP BY dt.id, sm.name ORDER BY dt.skill_id, dt.level`

    const demonstrations = await query

    return NextResponse.json({ demonstrations })
  } catch (error) {
    console.error("Get demonstrations error:", error)
    return NextResponse.json({ error: "Failed to get demonstrations" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const body = await request.json()
    const { skill_id, level, description, demonstration_description } = body

    if (!skill_id || !level) {
      return NextResponse.json({ error: "skill_id and level are required" }, { status: 400 })
    }

    const newDemonstration = await sql`
      INSERT INTO demonstration_templates (skill_id, level, description, demonstration_description)
      VALUES (${skill_id}, ${level}, ${description || null}, ${demonstration_description || null})
      RETURNING *
    `

    // Log audit event
    await logAuditEvent({
      action: "CREATE",
      table_name: "demonstration_templates",
      record_id: newDemonstration[0].id,
      new_values: newDemonstration[0],
    })

    return NextResponse.json({ demonstration: newDemonstration[0] })
  } catch (error) {
    console.error("Create demonstration error:", error)
    return NextResponse.json({ error: "Failed to create demonstration" }, { status: 500 })
  }
}
