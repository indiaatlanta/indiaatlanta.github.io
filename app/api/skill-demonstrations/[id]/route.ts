import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit"
import { z } from "zod"

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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdmin()
    const demonstrationId = Number.parseInt(params.id)
    const body = await request.json()
    const demonstrationData = skillDemonstrationSchema.parse(body)

    // Get old values for audit
    const oldDemonstration = await sql`
      SELECT * FROM skill_demonstrations WHERE id = ${demonstrationId}
    `

    if (oldDemonstration.length === 0) {
      return NextResponse.json({ error: "Skill demonstration not found" }, { status: 404 })
    }

    const result = await sql`
      UPDATE skill_demonstrations 
      SET 
        skill_master_id = ${demonstrationData.skillMasterId},
        job_role_id = ${demonstrationData.jobRoleId},
        level = ${demonstrationData.level},
        demonstration_description = ${demonstrationData.demonstrationDescription},
        sort_order = ${demonstrationData.sortOrder || 0},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${demonstrationId}
      RETURNING *
    `

    const updatedDemonstration = result[0]

    // Create audit log
    await createAuditLog({
      userId: user.id,
      tableName: "skill_demonstrations",
      recordId: demonstrationId,
      action: "UPDATE",
      oldValues: oldDemonstration[0],
      newValues: demonstrationData,
    })

    return NextResponse.json(updatedDemonstration)
  } catch (error) {
    console.error("Update skill demonstration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdmin()
    const demonstrationId = Number.parseInt(params.id)

    // Get demonstration data for audit
    const demonstration = await sql`
      SELECT * FROM skill_demonstrations WHERE id = ${demonstrationId}
    `

    if (demonstration.length === 0) {
      return NextResponse.json({ error: "Skill demonstration not found" }, { status: 404 })
    }

    await sql`DELETE FROM skill_demonstrations WHERE id = ${demonstrationId}`

    // Create audit log
    await createAuditLog({
      userId: user.id,
      tableName: "skill_demonstrations",
      recordId: demonstrationId,
      action: "DELETE",
      oldValues: demonstration[0],
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete skill demonstration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
