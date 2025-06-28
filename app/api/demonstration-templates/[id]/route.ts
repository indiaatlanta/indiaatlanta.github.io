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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdmin()
    const templateId = Number.parseInt(params.id)
    const body = await request.json()
    const demonstrationData = demonstrationTemplateSchema.parse(body)

    // Get old values for audit
    const oldTemplate = await sql`
      SELECT dt.*, 
        COALESCE(
          json_agg(djr.job_role_id) FILTER (WHERE djr.job_role_id IS NOT NULL),
          '[]'::json
        ) as job_role_ids
      FROM demonstration_templates dt
      LEFT JOIN demonstration_job_roles djr ON dt.id = djr.demonstration_template_id
      WHERE dt.id = ${templateId}
      GROUP BY dt.id
    `

    if (oldTemplate.length === 0) {
      return NextResponse.json({ error: "Demonstration template not found" }, { status: 404 })
    }

    // Start transaction
    const result = await sql.begin(async (sql) => {
      // Update the demonstration template
      const templateResult = await sql`
        UPDATE demonstration_templates 
        SET 
          skill_master_id = ${demonstrationData.skillMasterId},
          level = ${demonstrationData.level},
          demonstration_description = ${demonstrationData.demonstrationDescription},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${templateId}
        RETURNING *
      `

      // Remove existing job role links
      await sql`DELETE FROM demonstration_job_roles WHERE demonstration_template_id = ${templateId}`

      // Add new job role links
      for (const jobRoleId of demonstrationData.jobRoleIds) {
        await sql`
          INSERT INTO demonstration_job_roles (demonstration_template_id, job_role_id, sort_order)
          VALUES (${templateId}, ${jobRoleId}, 0)
        `
      }

      return templateResult[0]
    })

    // Create audit log
    await createAuditLog({
      userId: user.id,
      tableName: "demonstration_templates",
      recordId: templateId,
      action: "UPDATE",
      oldValues: oldTemplate[0],
      newValues: demonstrationData,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Update demonstration template error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdmin()
    const templateId = Number.parseInt(params.id)

    // Get template data for audit
    const template = await sql`
      SELECT dt.*, 
        COALESCE(
          json_agg(djr.job_role_id) FILTER (WHERE djr.job_role_id IS NOT NULL),
          '[]'::json
        ) as job_role_ids
      FROM demonstration_templates dt
      LEFT JOIN demonstration_job_roles djr ON dt.id = djr.demonstration_template_id
      WHERE dt.id = ${templateId}
      GROUP BY dt.id
    `

    if (template.length === 0) {
      return NextResponse.json({ error: "Demonstration template not found" }, { status: 404 })
    }

    // Delete template (cascade will handle job role links)
    await sql`DELETE FROM demonstration_templates WHERE id = ${templateId}`

    // Create audit log
    await createAuditLog({
      userId: user.id,
      tableName: "demonstration_templates",
      recordId: templateId,
      action: "DELETE",
      oldValues: template[0],
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete demonstration template error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
