import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit"
import { z } from "zod"

const skillMasterSchema = z.object({
  name: z.string().min(1, "Skill name is required").max(255, "Skill name too long"),
  description: z.string().min(1, "Description is required").max(10000, "Description too long"),
  categoryId: z.number().int().positive("Invalid category"),
  sortOrder: z.number().int().min(0).optional(),
})

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

// Get all master skills
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")

    let query
    if (categoryId) {
      query = sql`
        SELECT 
          sm.*,
          sc.name as category_name,
          sc.color as category_color,
          COUNT(sd.id) as demonstration_count
        FROM skills_master sm
        JOIN skill_categories sc ON sm.category_id = sc.id
        LEFT JOIN skill_demonstrations sd ON sm.id = sd.skill_master_id
        WHERE sm.category_id = ${Number.parseInt(categoryId)}
        GROUP BY sm.id, sc.name, sc.color
        ORDER BY sm.sort_order, sm.name
      `
    } else {
      query = sql`
        SELECT 
          sm.*,
          sc.name as category_name,
          sc.color as category_color,
          COUNT(sd.id) as demonstration_count
        FROM skills_master sm
        JOIN skill_categories sc ON sm.category_id = sc.id
        LEFT JOIN skill_demonstrations sd ON sm.id = sd.skill_master_id
        GROUP BY sm.id, sc.name, sc.color
        ORDER BY sc.sort_order, sm.sort_order, sm.name
      `
    }

    const skills = await query
    return NextResponse.json(skills)
  } catch (error) {
    console.error("Get master skills error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Create new master skill
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin()
    const body = await request.json()
    const skillData = skillMasterSchema.parse(body)

    const result = await sql`
      INSERT INTO skills_master (name, category_id, description, sort_order)
      VALUES (${skillData.name}, ${skillData.categoryId}, ${skillData.description}, ${skillData.sortOrder || 0})
      RETURNING *
    `

    const newSkill = result[0]

    // Create audit log
    await createAuditLog({
      userId: user.id,
      tableName: "skills_master",
      recordId: newSkill.id,
      action: "CREATE",
      newValues: skillData,
    })

    return NextResponse.json(newSkill, { status: 201 })
  } catch (error) {
    console.error("Create master skill error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
