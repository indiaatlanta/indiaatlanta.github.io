import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit"
import { z } from "zod"

const jobRoleLinksSchema = z.object({
  jobRoleIds: z.array(z.number().int().positive()).min(1, "At least one job role is required"),
})

// Update job role links for a demonstration template
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdmin()
    const templateId = Number.parseInt(params.id)
    const body = await request.json()
    const { jobRoleIds } = jobRoleLinksSchema.parse(body)

    // Get old links for audit
    const oldLinks = await sql`
      SELECT job_role_id FROM demonstration_job_roles 
      WHERE demonstration_template_id = ${templateId}
    `

    // Start transaction
    await sql.begin(async (sql) => {
      // Remove existing links
      await sql`DELETE FROM demonstration_job_roles WHERE demonstration_template_id = ${templateId}`

      // Add new links
      for (const jobRoleId of jobRoleIds) {
        await sql`
          INSERT INTO demonstration_job_roles (demonstration_template_id, job_role_id, sort_order)
          VALUES (${templateId}, ${jobRoleId}, 0)
        `
      }
    })

    // Create audit log
    await createAuditLog({
      userId: user.id,
      tableName: "demonstration_job_roles",
      recordId: templateId,
      action: "UPDATE",
      oldValues: { job_role_ids: oldLinks.map((l) => l.job_role_id) },
      newValues: { job_role_ids: jobRoleIds },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update job role links error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
