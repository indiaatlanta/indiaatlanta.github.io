import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit"
import { z } from "zod"

const skillMasterSchema = z.object({
  name: z.string().min(1, "Skill name is required").max(255, "Name too long"),
  description: z.string().min(1, "Description is required").max(10000, "Description too long"),
  categoryId: z.number().int().positive("Invalid category"),
  sortOrder: z.number().int().min(0).optional(),
})

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    if (!isDatabaseConfigured() || !sql) {
      // Return demo data
      return NextResponse.json([
        {
          id: 1,
          name: "JavaScript Programming",
          description: "Proficiency in JavaScript programming language",
          category_id: 1,
          category_name: "Technical Skills",
          category_color: "#3B82F6",
          demonstration_count: 3,
          sort_order: 1,
        },
        {
          id: 2,
          name: "Project Management",
          description: "Ability to manage projects effectively",
          category_id: 2,
          category_name: "Leadership",
          category_color: "#10B981",
          demonstration_count: 2,
          sort_order: 1,
        },
      ])
    }

    const skills = await sql`
      SELECT 
        sm.*,
        sc.name as category_name,
        sc.color as category_color,
        COALESCE(demo_counts.demonstration_count, 0) as demonstration_count
      FROM skills_master sm
      JOIN skill_categories sc ON sm.category_id = sc.id
      LEFT JOIN (
        SELECT 
          skill_master_id,
          COUNT(*) as demonstration_count
        FROM skill_demonstrations
        GROUP BY skill_master_id
      ) demo_counts ON sm.id = demo_counts.skill_master_id
      ORDER BY sc.sort_order, sm.sort_order, sm.name
    `

    return NextResponse.json(skills)
  } catch (error) {
    console.error("Get skills master error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin()
    const body = await request.json()
    const skillData = skillMasterSchema.parse(body)

    if (!isDatabaseConfigured() || !sql) {
      // Demo mode - simulate success
      return NextResponse.json({
        id: Math.floor(Math.random() * 1000),
        ...skillData,
        category_name: "Demo Category",
        category_color: "#3B82F6",
        demonstration_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        message: "Skill created successfully (demo mode)",
        isDemoMode: true,
      })
    }

    const result = await sql`
      INSERT INTO skills_master (name, description, category_id, sort_order)
      VALUES (${skillData.name}, ${skillData.description}, ${skillData.categoryId}, ${skillData.sortOrder || 0})
      RETURNING *
    `

    const newSkill = result[0]

    // Get category details
    const category = await sql`
      SELECT name, color FROM skill_categories WHERE id = ${skillData.categoryId}
    `

    const skillWithCategory = {
      ...newSkill,
      category_name: category[0]?.name || "Unknown",
      category_color: category[0]?.color || "#3B82F6",
      demonstration_count: 0,
    }

    // Create audit log
    await createAuditLog({
      userId: user.id,
      tableName: "skills_master",
      recordId: newSkill.id,
      action: "CREATE",
      newValues: skillData,
    })

    return NextResponse.json(skillWithCategory, { status: 201 })
  } catch (error) {
    console.error("Create skill master error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
