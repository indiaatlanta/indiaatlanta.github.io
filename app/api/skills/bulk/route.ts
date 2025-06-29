import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { logAuditEvent } from "@/lib/audit"

export async function POST(request: Request) {
  try {
    if (!sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const body = await request.json()
    const { skills } = body

    if (!Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json({ error: "Invalid skills data" }, { status: 400 })
    }

    const results = []

    for (const skill of skills) {
      const { name, category_id, description, sort_order } = skill

      try {
        const newSkill = await sql`
          INSERT INTO skills_master (name, category_id, description, sort_order)
          VALUES (${name}, ${category_id}, ${description || null}, ${sort_order || 0})
          RETURNING *
        `

        // Log audit event
        await logAuditEvent({
          action: "CREATE",
          table_name: "skills_master",
          record_id: newSkill[0].id,
          new_values: newSkill[0],
        })

        results.push({ success: true, skill: newSkill[0] })
      } catch (error) {
        console.error(`Error creating skill ${name}:`, error)
        results.push({ success: false, error: `Failed to create skill: ${name}` })
      }
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Bulk create skills error:", error)
    return NextResponse.json({ error: "Failed to create skills" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    if (!sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const body = await request.json()
    const { skills } = body

    if (!Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json({ error: "Invalid skills data" }, { status: 400 })
    }

    const results = []

    for (const skill of skills) {
      const { id, name, category_id, description, sort_order } = skill

      if (!id) {
        results.push({ success: false, error: "Skill ID is required for updates" })
        continue
      }

      try {
        // Get old values for audit
        const oldSkill = await sql`
          SELECT * FROM skills_master WHERE id = ${id}
        `

        if (oldSkill.length === 0) {
          results.push({ success: false, error: `Skill with ID ${id} not found` })
          continue
        }

        const updatedSkill = await sql`
          UPDATE skills_master 
          SET 
            name = ${name},
            category_id = ${category_id},
            description = ${description || null},
            sort_order = ${sort_order || 0},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING *
        `

        // Log audit event
        await logAuditEvent({
          action: "UPDATE",
          table_name: "skills_master",
          record_id: id,
          old_values: oldSkill[0],
          new_values: updatedSkill[0],
        })

        results.push({ success: true, skill: updatedSkill[0] })
      } catch (error) {
        console.error(`Error updating skill ${id}:`, error)
        results.push({ success: false, error: `Failed to update skill: ${id}` })
      }
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Bulk update skills error:", error)
    return NextResponse.json({ error: "Failed to update skills" }, { status: 500 })
  }
}
