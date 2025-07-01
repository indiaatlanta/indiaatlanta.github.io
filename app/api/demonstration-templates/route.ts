import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit"
import { z } from "zod"

const demonstrationTemplateSchema = z.object({
  skillMasterId: z.number().int().positive("Invalid skill"),
  level: z.string().regex(/^[A-Z]\d+$/, "Level must be in format like L1, L2, M1, M2, etc."),
  demonstrationDescription: z
    .string()
    .min(1, "Demonstration description is required")
    .max(2000, "Description too long"),
  jobRoleIds: z.array(z.number().int().positive()).min(1, "At least one job role is required"),
})

// Get demonstration templates
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const skillMasterId = searchParams.get("skillMasterId")
    const jobRoleId = searchParams.get("jobRoleId")

    let query
    if (skillMasterId) {
      query = sql`
        SELECT 
          dt.*,
          sm.name as skill_name,
          sm.description as skill_description,
          sc.name as category_name,
          sc.color as category_color,
          COALESCE(
            json_agg(
              json_build_object(
                'job_role_id', djr.job_role_id,
                'job_role_name', jr.name,
                'job_role_code', jr.code,
                'sort_order', djr.sort_order
              ) ORDER BY jr.level, jr.name
            ) FILTER (WHERE djr.job_role_id IS NOT NULL),
            '[]'::json
          ) as job_roles
        FROM demonstration_templates dt
        JOIN skills_master sm ON dt.skill_master_id = sm.id
        JOIN skill_categories sc ON sm.category_id = sc.id
        LEFT JOIN demonstration_job_roles djr ON dt.id = djr.demonstration_template_id
        LEFT JOIN job_roles jr ON djr.job_role_id = jr.id
        WHERE dt.skill_master_id = ${Number.parseInt(skillMasterId)}
        GROUP BY dt.id, sm.name, sm.description, sc.name, sc.color
        ORDER BY dt.level, dt.demonstration_description
      `
    } else if (jobRoleId) {
      query = sql`
        SELECT 
          dt.*,
          sm.name as skill_name,
          sm.description as skill_description,
          sc.name as category_name,
          sc.color as category_color,
          djr.sort_order,
          COALESCE(
            json_agg(
              json_build_object(
                'job_role_id', djr2.job_role_id,
                'job_role_name', jr2.name,
                'job_role_code', jr2.code,
                'sort_order', djr2.sort_order
              ) ORDER BY jr2.level, jr2.name
            ) FILTER (WHERE djr2.job_role_id IS NOT NULL),
            '[]'::json
          ) as job_roles
        FROM demonstration_templates dt
        JOIN skills_master sm ON dt.skill_master_id = sm.id
        JOIN skill_categories sc ON sm.category_id = sc.id
        JOIN demonstration_job_roles djr ON dt.id = djr.demonstration_template_id
        LEFT JOIN demonstration_job_roles djr2 ON dt.id = djr2.demonstration_template_id
        LEFT JOIN job_roles jr2 ON djr2.job_role_id = jr2.id
        WHERE djr.job_role_id = ${Number.parseInt(jobRoleId)}
        GROUP BY dt.id, sm.name, sm.description, sc.name, sc.color, djr.sort_order
        ORDER BY sc.sort_order, sm.sort_order, djr.sort_order, sm.name
      `
    } else {
      query = sql`
        SELECT 
          dt.*,
          sm.name as skill_name,
          sm.description as skill_description,
          sc.name as category_name,
          sc.color as category_color,
          COALESCE(
            json_agg(
              json_build_object(
                'job_role_id', djr.job_role_id,
                'job_role_name', jr.name,
                'job_role_code', jr.code,
                'sort_order', djr.sort_order
              ) ORDER BY jr.level, jr.name
            ) FILTER (WHERE djr.job_role_id IS NOT NULL),
            '[]'::json
          ) as job_roles
        FROM demonstration_templates dt
        JOIN skills_master sm ON dt.skill_master_id = sm.id
        JOIN skill_categories sc ON sm.category_id = sc.id
        LEFT JOIN demonstration_job_roles djr ON dt.id = djr.demonstration_template_id
        LEFT JOIN job_roles jr ON djr.job_role_id = jr.id
        GROUP BY dt.id, sm.name, sm.description, sc.name, sc.color
        ORDER BY sc.sort_order, sm.name, dt.level
      `
    }

    const demonstrations = await query
    return NextResponse.json(demonstrations)
  } catch (error) {
    console.error("Get demonstration templates error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Create new demonstration template
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin()
    const body = await request.json()
    const demonstrationData = demonstrationTemplateSchema.parse(body)

    // Start transaction
    const result = await sql.begin(async (sql) => {
      // Create the demonstration template
      const templateResult = await sql`
        INSERT INTO demonstration_templates (skill_master_id, level, demonstration_description)
        VALUES (${demonstrationData.skillMasterId}, ${demonstrationData.level}, ${demonstrationData.demonstrationDescription})
        RETURNING *
      `

      const newTemplate = templateResult[0]

      // Link to job roles
      for (const jobRoleId of demonstrationData.jobRoleIds) {
        await sql`
          INSERT INTO demonstration_job_roles (demonstration_template_id, job_role_id, sort_order)
          VALUES (${newTemplate.id}, ${jobRoleId}, 0)
        `
      }

      return newTemplate
    })

    // Create audit log
    await createAuditLog({
      userId: user.id,
      tableName: "demonstration_templates",
      recordId: result.id,
      action: "CREATE",
      newValues: demonstrationData,
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Create demonstration template error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
