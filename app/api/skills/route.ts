import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { skillSchema } from "@/lib/validation"
import { createAuditLog } from "@/lib/audit"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const jobRoleId = searchParams.get("jobRoleId")

    let query
    if (jobRoleId) {
      // Try new structure first, fallback to old structure
      try {
        query = sql`
          SELECT 
            sd.id,
            sm.name,
            sd.level,
            sd.demonstration_description as description,
            sm.description as full_description,
            sm.category_id,
            sc.name as category_name,
            sc.color as category_color,
            sd.job_role_id,
            sd.sort_order
          FROM skill_demonstrations sd
          JOIN skills_master sm ON sd.skill_master_id = sm.id
          JOIN skill_categories sc ON sm.category_id = sc.id
          WHERE sd.job_role_id = ${Number.parseInt(jobRoleId)}
          ORDER BY sc.sort_order, sm.sort_order, sd.sort_order, sm.name
        `
      } catch (error) {
        // Fallback to old structure
        query = sql`
          SELECT 
            s.*,
            sc.name as category_name,
            sc.color as category_color
          FROM skills s
          JOIN skill_categories sc ON s.category_id = sc.id
          WHERE s.job_role_id = ${Number.parseInt(jobRoleId)}
          ORDER BY sc.sort_order, s.sort_order, s.name
        `
      }
    } else {
      // Try new structure first, fallback to old structure
      try {
        query = sql`
          SELECT 
            sd.id,
            sm.name,
            sd.level,
            sd.demonstration_description as description,
            sm.description as full_description,
            sm.category_id,
            sc.name as category_name,
            sc.color as category_color,
            sd.job_role_id,
            jr.name as job_role_name,
            jr.code as job_role_code,
            sd.sort_order
          FROM skill_demonstrations sd
          JOIN skills_master sm ON sd.skill_master_id = sm.id
          JOIN skill_categories sc ON sm.category_id = sc.id
          JOIN job_roles jr ON sd.job_role_id = jr.id
          ORDER BY jr.name, sc.sort_order, sm.sort_order, sd.sort_order, sm.name
        `
      } catch (error) {
        // Fallback to old structure
        query = sql`
          SELECT 
            s.*,
            sc.name as category_name,
            sc.color as category_color,
            jr.name as job_role_name,
            jr.code as job_role_code
          FROM skills s
          JOIN skill_categories sc ON s.category_id = sc.id
          JOIN job_roles jr ON s.job_role_id = jr.id
          ORDER BY jr.name, sc.sort_order, s.sort_order, s.name
        `
      }
    }

    const skills = await query
    return NextResponse.json(skills)
  } catch (error) {
    console.error("Get skills error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin()
    const body = await request.json()
    const skillData = skillSchema.parse(body)

    const result = await sql`
      INSERT INTO skills (job_role_id, category_id, name, level, description, full_description, sort_order)
      VALUES (${skillData.jobRoleId}, ${skillData.categoryId}, ${skillData.name}, ${skillData.level}, ${skillData.description}, ${skillData.fullDescription}, ${skillData.sortOrder || 0})
      RETURNING *
    `

    const newSkill = result[0]

    // Create audit log
    await createAuditLog({
      userId: user.id,
      tableName: "skills",
      recordId: newSkill.id,
      action: "CREATE",
      newValues: skillData,
    })

    return NextResponse.json(newSkill, { status: 201 })
  } catch (error) {
    console.error("Create skill error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
