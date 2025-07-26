import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
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
    const body = await request.json()
    const demonstrationData = skillDemonstrationSchema.parse(body)
    const demonstrationId = Number.parseInt(params.id)

    if (!isDatabaseConfigured() || !sql) {
      // Demo mode - simulate success
      return NextResponse.json({
        id: demonstrationId,
        ...demonstrationData,
        skill_name: "Demo Skill",
        job_role_name: "Demo Role",
        category_name: "Demo Category",
        updated_at: new Date().toISOString(),
        message: "Skill demonstration updated successfully (demo mode)",
        isDemoMode: true,
      })
    }

    // Get current demonstration for audit log
    const currentDemo = await sql`
      SELECT * FROM skill_demonstrations WHERE id = ${demonstrationId}
    `

    if (currentDemo.length === 0) {
      return NextResponse.json({ error: "Skill demonstration not found" }, { status: 404 })
    }

    const result = await sql`
      UPDATE skill_demonstrations 
      SET skill_master_id = ${demonstrationData.skillMasterId}, 
          job_role_id = ${demonstrationData.jobRoleId}, 
          level = ${demonstrationData.level},
          demonstration_description = ${demonstrationData.demonstrationDescription},
          sort_order = ${demonstrationData.sortOrder || 0},
          updated_at = NOW()
      WHERE id = ${demonstrationId}
      RETURNING *
    `

    // Get updated demonstration with related data
    const demonstrationDetails = await sql`
      SELECT 
        sd.*,
        sm.name as skill_name,
        sc.name as category_name,
        jr.name as job_role_name
      FROM skill_demonstrations sd
      JOIN skills_master sm ON sd.skill_master_id = sm.id
      JOIN skill_categories sc ON sm.category_id = sc.id
      JOIN job_roles jr ON sd.job_role_id = jr.id
      WHERE sd.id = ${demonstrationId}
    `

    // Create audit log
    await createAuditLog({
      userId: user.id,
      tableName: "skill_demonstrations",
      recordId: demonstrationId,
      action: "UPDATE",
      oldValues: currentDemo[0],
      newValues: demonstrationData,
    })

    return NextResponse.json(demonstrationDetails[0])
  } catch (error) {
    console.error("Update skill demonstration error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdmin()
    const demonstrationId = Number.parseInt(params.id)

    if (!isDatabaseConfigured() || !sql) {
      // Demo mode - simulate success
      return NextResponse.json({
        message: "Skill demonstration deleted successfully (demo mode)",
        isDemoMode: true,
      })
    }

    // Get current demonstration for audit log
    const currentDemo = await sql`
      SELECT * FROM skill_demonstrations WHERE id = ${demonstrationId}
    `

    if (currentDemo.length === 0) {
      return NextResponse.json({ error: "Skill demonstration not found" }, { status: 404 })
    }

    await sql`
      DELETE FROM skill_demonstrations WHERE id = ${demonstrationId}
    `

    // Create audit log
    await createAuditLog({
      userId: user.id,
      tableName: "skill_demonstrations",
      recordId: demonstrationId,
      action: "DELETE",
      oldValues: currentDemo[0],
    })

    return NextResponse.json({ message: "Skill demonstration deleted successfully" })
  } catch (error) {
    console.error("Delete skill demonstration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
