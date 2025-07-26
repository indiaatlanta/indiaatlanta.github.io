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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdmin()
    const body = await request.json()
    const skillData = skillMasterSchema.parse(body)
    const skillId = Number.parseInt(params.id)

    if (!isDatabaseConfigured() || !sql) {
      // Demo mode - simulate success
      return NextResponse.json({
        id: skillId,
        ...skillData,
        category_name: "Demo Category",
        category_color: "#3B82F6",
        demonstration_count: 0,
        updated_at: new Date().toISOString(),
        message: "Skill updated successfully (demo mode)",
        isDemoMode: true,
      })
    }

    // Get current skill for audit log
    const currentSkill = await sql`
      SELECT * FROM skills_master WHERE id = ${skillId}
    `

    if (currentSkill.length === 0) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 })
    }

    const result = await sql`
      UPDATE skills_master 
      SET name = ${skillData.name}, 
          description = ${skillData.description}, 
          category_id = ${skillData.categoryId},
          sort_order = ${skillData.sortOrder || 0},
          updated_at = NOW()
      WHERE id = ${skillId}
      RETURNING *
    `

    const updatedSkill = result[0]

    // Get category details and demonstration count
    const skillDetails = await sql`
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
      WHERE sm.id = ${skillId}
    `

    // Create audit log
    await createAuditLog({
      userId: user.id,
      tableName: "skills_master",
      recordId: skillId,
      action: "UPDATE",
      oldValues: currentSkill[0],
      newValues: skillData,
    })

    return NextResponse.json(skillDetails[0])
  } catch (error) {
    console.error("Update skill master error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdmin()
    const skillId = Number.parseInt(params.id)

    if (!isDatabaseConfigured() || !sql) {
      // Demo mode - simulate success
      return NextResponse.json({
        message: "Skill deleted successfully (demo mode)",
        isDemoMode: true,
      })
    }

    // Get current skill for audit log
    const currentSkill = await sql`
      SELECT * FROM skills_master WHERE id = ${skillId}
    `

    if (currentSkill.length === 0) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 })
    }

    // Delete skill demonstrations first (cascade)
    await sql`
      DELETE FROM skill_demonstrations WHERE skill_master_id = ${skillId}
    `

    // Delete the skill
    await sql`
      DELETE FROM skills_master WHERE id = ${skillId}
    `

    // Create audit log
    await createAuditLog({
      userId: user.id,
      tableName: "skills_master",
      recordId: skillId,
      action: "DELETE",
      oldValues: currentSkill[0],
    })

    return NextResponse.json({ message: "Skill and associated demonstrations deleted successfully" })
  } catch (error) {
    console.error("Delete skill master error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
