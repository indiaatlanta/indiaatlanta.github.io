import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit"
import { z } from "zod"

const skillDemonstrationSchema = z.object({
  skillMasterId: z.number().int().positive("Invalid skill"),
  jobRoleId: z.number().int().positive("Invalid job role"),
  level: z.string().regex(/^[A-Z]\d+$/, "Level must be in format like L1, L2, M1, M2, etc."),
  demonstrationDescription: z
    .string()
    .min(1, "Demonstration description is required")
    .max(2000, "Description too long"),
  sortOrder: z.number().int().min(0).optional(),
})

// Get skill demonstrations
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    if (!isDatabaseConfigured() || !sql) {
      // Return demo data
      return NextResponse.json([
        {
          id: 1,
          skill_master_id: 1,
          job_role_id: 1,
          level: "L1",
          demonstration_description: "Can write basic JavaScript functions",
          skill_name: "JavaScript Programming",
          job_role_name: "Junior Developer",
          category_name: "Technical Skills",
          sort_order: 1,
        },
      ])
    }

    const { searchParams } = new URL(request.url)
    const jobRoleId = searchParams.get("jobRoleId")
    const skillMasterId = searchParams.get("skillMasterId")

    let query
    if (jobRoleId) {
      query = sql`
        SELECT 
          sd.*,
          sm.name as skill_name,
          sm.description as skill_description,
          sc.name as category_name,
          sc.color as category_color,
          jr.name as job_role_name,
          jr.code as job_role_code
        FROM skill_demonstrations sd
        JOIN skills_master sm ON sd.skill_master_id = sm.id
        JOIN skill_categories sc ON sm.category_id = sc.id
        JOIN job_roles jr ON sd.job_role_id = jr.id
        WHERE sd.job_role_id = ${Number.parseInt(jobRoleId)}
        ORDER BY sc.sort_order, sm.sort_order, sd.sort_order, sm.name
      `
    } else if (skillMasterId) {
      query = sql`
        SELECT 
          sd.*,
          sm.name as skill_name,
          sm.description as skill_description,
          sc.name as category_name,
          sc.color as category_color,
          jr.name as job_role_name,
          jr.code as job_role_code
        FROM skill_demonstrations sd
        JOIN skills_master sm ON sd.skill_master_id = sm.id
        JOIN skill_categories sc ON sm.category_id = sc.id
        JOIN job_roles jr ON sd.job_role_id = jr.id
        WHERE sd.skill_master_id = ${Number.parseInt(skillMasterId)}
        ORDER BY jr.level, jr.name, sd.sort_order
      `
    } else {
      query = sql`
        SELECT 
          sd.*,
          sm.name as skill_name,
          sm.description as skill_description,
          sc.name as category_name,
          sc.color as category_color,
          jr.name as job_role_name,
          jr.code as job_role_code
        FROM skill_demonstrations sd
        JOIN skills_master sm ON sd.skill_master_id = sm.id
        JOIN skill_categories sc ON sm.category_id = sc.id
        JOIN job_roles jr ON sd.job_role_id = jr.id
        ORDER BY sc.sort_order, sm.name, jr.level, sd.sort_order
      `
    }

    const demonstrations = await query
    return NextResponse.json(demonstrations)
  } catch (error) {
    console.error("Get skill demonstrations error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Create new skill demonstration
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin()
    const body = await request.json()
    const demonstrationData = skillDemonstrationSchema.parse(body)

    if (!isDatabaseConfigured() || !sql) {
      // Demo mode - simulate success
      return NextResponse.json({
        id: Math.floor(Math.random() * 1000),
        ...demonstrationData,
        skill_name: "Demo Skill",
        job_role_name: "Demo Role",
        category_name: "Demo Category",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        message: "Skill demonstration created successfully (demo mode)",
        isDemoMode: true,
      })
    }

    const result = await sql`
      INSERT INTO skill_demonstrations (skill_master_id, job_role_id, level, demonstration_description, sort_order)
      VALUES (${demonstrationData.skillMasterId}, ${demonstrationData.jobRoleId}, ${demonstrationData.level}, ${demonstrationData.demonstrationDescription}, ${demonstrationData.sortOrder || 0})
      RETURNING *
    `

    const newDemonstration = result[0]

    // Get related data for response
    const demonstrationDetails = await sql`
      SELECT 
        sd.*,
        sm.name as skill_name,
        sc.name as category_name,
        jr.name as job_role_name
      FROM skill_demonstrations sd
      JOIN skills_master sm ON sd.skill_master_id = sm.id
      JOIN skill_categories sc ON sm.category_id = sc.id
      JOIN job_roles jr ON sd.job_role_id = jr.id
      WHERE sd.id = ${newDemonstration.id}
    `

    // Create audit log
    await createAuditLog({
      userId: user.id,
      tableName: "skill_demonstrations",
      recordId: newDemonstration.id,
      action: "CREATE",
      newValues: demonstrationData,
    })

    return NextResponse.json(demonstrationDetails[0], { status: 201 })
  } catch (error) {
    console.error("Create skill demonstration error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
