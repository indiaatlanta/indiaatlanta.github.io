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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdmin()
    const skillId = Number.parseInt(params.id)
    const body = await request.json()
    const skillData = skillMasterSchema.parse(body)

    // Get old values for audit
    const oldSkill = await sql`
      SELECT * FROM skills_master WHERE id = ${skillId}
    `

    if (oldSkill.length === 0) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 })
    }

    const result = await sql`
      UPDATE skills_master 
      SET 
        name = ${skillData.name},
        category_id = ${skillData.categoryId},
        description = ${skillData.description},
        sort_order = ${skillData.sortOrder || 0},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${skillId}
      RETURNING *
    `

    const updatedSkill = result[0]

    // Create audit log
    await createAuditLog({
      userId: user.id,
      tableName: "skills_master",
      recordId: skillId,
      action: "UPDATE",
      oldValues: oldSkill[0],
      newValues: skillData,
    })

    return NextResponse.json(updatedSkill)
  } catch (error) {
    console.error("Update master skill error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdmin()
    const skillId = Number.parseInt(params.id)

    // Get skill data for audit
    const skill = await sql`
      SELECT * FROM skills_master WHERE id = ${skillId}
    `

    if (skill.length === 0) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 })
    }

    // Check if skill has demonstrations
    const demonstrations = await sql`
      SELECT COUNT(*) as count FROM skill_demonstrations WHERE skill_master_id = ${skillId}
    `

    if (demonstrations[0].count > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete skill with existing demonstrations. Delete demonstrations first.",
        },
        { status: 400 },
      )
    }

    await sql`DELETE FROM skills_master WHERE id = ${skillId}`

    // Create audit log
    await createAuditLog({
      userId: user.id,
      tableName: "skills_master",
      recordId: skillId,
      action: "DELETE",
      oldValues: skill[0],
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete master skill error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
