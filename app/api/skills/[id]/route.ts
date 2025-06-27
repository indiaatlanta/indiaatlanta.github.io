import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { skillSchema } from "@/lib/validation"
import { createAuditLog } from "@/lib/audit"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdmin()
    const skillId = Number.parseInt(params.id)
    const body = await request.json()
    const skillData = skillSchema.parse(body)

    // Get old values for audit
    const oldSkill = await sql`
      SELECT * FROM skills WHERE id = ${skillId}
    `

    if (oldSkill.length === 0) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 })
    }

    const result = await sql`
      UPDATE skills 
      SET 
        job_role_id = ${skillData.jobRoleId},
        category_id = ${skillData.categoryId},
        name = ${skillData.name},
        level = ${skillData.level},
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
      tableName: "skills",
      recordId: skillId,
      action: "UPDATE",
      oldValues: oldSkill[0],
      newValues: skillData,
    })

    return NextResponse.json(updatedSkill)
  } catch (error) {
    console.error("Update skill error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdmin()
    const skillId = Number.parseInt(params.id)

    // Get skill data for audit
    const skill = await sql`
      SELECT * FROM skills WHERE id = ${skillId}
    `

    if (skill.length === 0) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 })
    }

    await sql`DELETE FROM skills WHERE id = ${skillId}`

    // Create audit log
    await createAuditLog({
      userId: user.id,
      tableName: "skills",
      recordId: skillId,
      action: "DELETE",
      oldValues: skill[0],
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete skill error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
