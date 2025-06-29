import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { logAuditEvent } from "@/lib/audit"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const demonstrationId = Number.parseInt(params.id)

    const demonstration = await sql`
      SELECT 
        dt.*,
        sm.name as skill_name,
        sc.name as category_name
      FROM demonstration_templates dt
      JOIN skills_master sm ON dt.skill_id = sm.id
      LEFT JOIN skill_categories sc ON sm.category_id = sc.id
      WHERE dt.id = ${demonstrationId}
    `

    if (demonstration.length === 0) {
      return NextResponse.json({ error: "Demonstration not found" }, { status: 404 })
    }

    // Get associated job roles
    const jobRoles = await sql`
      SELECT 
        jr.*,
        d.name as department_name
      FROM demonstration_job_roles djr
      JOIN job_roles jr ON djr.job_role_id = jr.id
      JOIN departments d ON jr.department_id = d.id
      WHERE djr.demonstration_template_id = ${demonstrationId}
      ORDER BY d.name, jr.level
    `

    return NextResponse.json({
      demonstration: demonstration[0],
      job_roles: jobRoles,
    })
  } catch (error) {
    console.error("Get demonstration error:", error)
    return NextResponse.json({ error: "Failed to get demonstration" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const demonstrationId = Number.parseInt(params.id)
    const body = await request.json()
    const { skill_id, level, description, demonstration_description } = body

    // Get old values for audit
    const oldDemonstration = await sql`
      SELECT * FROM demonstration_templates WHERE id = ${demonstrationId}
    `

    if (oldDemonstration.length === 0) {
      return NextResponse.json({ error: "Demonstration not found" }, { status: 404 })
    }

    // Update demonstration
    const updatedDemonstration = await sql`
      UPDATE demonstration_templates 
      SET 
        skill_id = ${skill_id},
        level = ${level},
        description = ${description || null},
        demonstration_description = ${demonstration_description || null},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${demonstrationId}
      RETURNING *
    `

    // Log audit event
    await logAuditEvent({
      action: "UPDATE",
      table_name: "demonstration_templates",
      record_id: demonstrationId,
      old_values: oldDemonstration[0],
      new_values: updatedDemonstration[0],
    })

    return NextResponse.json({ demonstration: updatedDemonstration[0] })
  } catch (error) {
    console.error("Update demonstration error:", error)
    return NextResponse.json({ error: "Failed to update demonstration" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const demonstrationId = Number.parseInt(params.id)

    // Get demonstration for audit
    const demonstration = await sql`
      SELECT * FROM demonstration_templates WHERE id = ${demonstrationId}
    `

    if (demonstration.length === 0) {
      return NextResponse.json({ error: "Demonstration not found" }, { status: 404 })
    }

    // Delete demonstration (this will cascade to related records)
    await sql`
      DELETE FROM demonstration_templates WHERE id = ${demonstrationId}
    `

    // Log audit event
    await logAuditEvent({
      action: "DELETE",
      table_name: "demonstration_templates",
      record_id: demonstrationId,
      old_values: demonstration[0],
    })

    return NextResponse.json({ message: "Demonstration deleted successfully" })
  } catch (error) {
    console.error("Delete demonstration error:", error)
    return NextResponse.json({ error: "Failed to delete demonstration" }, { status: 500 })
  }
}
