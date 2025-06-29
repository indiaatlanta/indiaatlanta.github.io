import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { logAuditEvent } from "@/lib/audit"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const skillId = Number.parseInt(params.id)

    const skill = await sql`
      SELECT 
        sm.*,
        sc.name as category_name,
        sc.color as category_color
      FROM skills_master sm
      LEFT JOIN skill_categories sc ON sm.category_id = sc.id
      WHERE sm.id = ${skillId}
    `

    if (skill.length === 0) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 })
    }

    return NextResponse.json({ skill: skill[0] })
  } catch (error) {
    console.error("Get skill error:", error)
    return NextResponse.json({ error: "Failed to get skill" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const skillId = Number.parseInt(params.id)
    const body = await request.json()
    const { name, category_id, description, sort_order } = body

    // Get old values for audit
    const oldSkill = await sql`
      SELECT * FROM skills_master WHERE id = ${skillId}
    `

    if (oldSkill.length === 0) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 })
    }

    // Update skill
    const updatedSkill = await sql`
      UPDATE skills_master 
      SET 
        name = ${name},
        category_id = ${category_id},
        description = ${description},
        sort_order = ${sort_order || 0},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${skillId}
      RETURNING *
    `

    // Log audit event
    await logAuditEvent({
      action: "UPDATE",
      table_name: "skills_master",
      record_id: skillId,
      old_values: oldSkill[0],
      new_values: updatedSkill[0],
    })

    return NextResponse.json({ skill: updatedSkill[0] })
  } catch (error) {
    console.error("Update skill error:", error)
    return NextResponse.json({ error: "Failed to update skill" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const skillId = Number.parseInt(params.id)

    // Get skill for audit
    const skill = await sql`
      SELECT * FROM skills_master WHERE id = ${skillId}
    `

    if (skill.length === 0) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 })
    }

    // Delete skill (this will cascade to related records)
    await sql`
      DELETE FROM skills_master WHERE id = ${skillId}
    `

    // Log audit event
    await logAuditEvent({
      action: "DELETE",
      table_name: "skills_master",
      record_id: skillId,
      old_values: skill[0],
    })

    return NextResponse.json({ message: "Skill deleted successfully" })
  } catch (error) {
    console.error("Delete skill error:", error)
    return NextResponse.json({ error: "Failed to delete skill" }, { status: 500 })
  }
}
