import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { skillSchema } from "@/lib/validation"
import { createAuditLog } from "@/lib/audit"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobRoleId = searchParams.get("jobRoleId")
    const checkOnly = searchParams.get("checkOnly")

    // If this is just a database connectivity check, don't require auth
    if (checkOnly === "true") {
      const isDemoMode = !isDatabaseConfigured() || !sql
      return NextResponse.json({ isDemoMode })
    }

    // For actual data requests, require admin auth
    await requireAdmin()

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json({
        skills: [],
        isDemoMode: true,
      })
    }

    let query
    if (jobRoleId) {
      query = sql`
        SELECT 
          sd.id,
          sd.skill_id,
          sm.name,
          sd.level,
          sd.description,
          sd.full_description,
          sc.id as category_id,
          sc.name as category_name,
          sc.color as category_color,
          sd.job_role_id,
          sd.sort_order,
          sd.created_at,
          sd.updated_at
        FROM skill_demonstrations sd
        JOIN skills_master sm ON sd.skill_id = sm.id
        JOIN skill_categories sc ON sm.category_id = sc.id
        WHERE sd.job_role_id = ${Number.parseInt(jobRoleId)}
        ORDER BY sc.sort_order, sm.name
      `
    } else {
      query = sql`
        SELECT 
          sd.id,
          sd.skill_id,
          sm.name,
          sd.level,
          sd.description,
          sd.full_description,
          sc.id as category_id,
          sc.name as category_name,
          sc.color as category_color,
          sd.job_role_id,
          sd.sort_order,
          sd.created_at,
          sd.updated_at
        FROM skill_demonstrations sd
        JOIN skills_master sm ON sd.skill_id = sm.id
        JOIN skill_categories sc ON sm.category_id = sc.id
        ORDER BY sd.job_role_id, sc.sort_order, sm.name
      `
    }

    const skills = await query

    return NextResponse.json(skills || [])
  } catch (error) {
    console.error("Get skills error:", error)
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin()

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const body = await request.json()
    const skillData = skillSchema.parse(body)

    // First, check if the skill master exists or create it
    const skillMaster = await sql`
      SELECT id FROM skills_master WHERE name = ${skillData.name}
    `

    let skillId
    if (skillMaster.length === 0) {
      // Create new skill master
      const newSkillMaster = await sql`
        INSERT INTO skills_master (name, category_id, description)
        VALUES (${skillData.name}, ${skillData.categoryId}, ${skillData.description})
        RETURNING id
      `
      skillId = newSkillMaster[0].id
    } else {
      skillId = skillMaster[0].id
    }

    // Create skill demonstration
    const result = await sql`
      INSERT INTO skill_demonstrations (
        skill_id,
        job_role_id,
        level,
        description,
        full_description,
        sort_order
      )
      VALUES (
        ${skillId},
        ${skillData.jobRoleId},
        ${skillData.level},
        ${skillData.description},
        ${skillData.fullDescription},
        ${skillData.sortOrder || 0}
      )
      RETURNING *
    `

    const newSkill = result[0]

    // Create audit log
    await createAuditLog({
      userId: user.id,
      tableName: "skill_demonstrations",
      recordId: newSkill.id,
      action: "CREATE",
      newValues: skillData,
    })

    return NextResponse.json(newSkill)
  } catch (error) {
    console.error("Create skill error:", error)
    return NextResponse.json({ error: "Failed to create skill" }, { status: 500 })
  }
}
