import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit"
import { z } from "zod"

const jobRoleSchema = z.object({
  name: z.string().min(1, "Role name is required").max(255, "Name too long"),
  code: z.string().min(1, "Role code is required").max(50, "Code too long"),
  departmentId: z.number().int().positive("Invalid department"),
  level: z.number().int().min(1).max(10).optional(),
  salaryMin: z.number().int().min(0).optional(),
  salaryMax: z.number().int().min(0).optional(),
  locationType: z.string().max(50).optional(),
})

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdmin()
    const roleId = Number.parseInt(params.id)
    const body = await request.json()
    const roleData = jobRoleSchema.parse(body)

    if (isNaN(roleId)) {
      return NextResponse.json({ error: "Invalid job role ID" }, { status: 400 })
    }

    if (!isDatabaseConfigured() || !sql) {
      // Demo mode - simulate success
      return NextResponse.json({
        id: roleId,
        ...roleData,
        message: "Job role updated successfully (demo mode)",
        isDemoMode: true,
      })
    }

    // Get old values for audit
    const oldRole = await sql`
      SELECT * FROM job_roles WHERE id = ${roleId}
    `

    if (oldRole.length === 0) {
      return NextResponse.json({ error: "Job role not found" }, { status: 404 })
    }

    const result = await sql`
      UPDATE job_roles 
      SET 
        name = ${roleData.name},
        code = ${roleData.code},
        department_id = ${roleData.departmentId},
        level = ${roleData.level || 1},
        salary_min = ${roleData.salaryMin || null},
        salary_max = ${roleData.salaryMax || null},
        location_type = ${roleData.locationType || null},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${roleId}
      RETURNING *
    `

    const updatedRole = result[0]

    // Create audit log
    await createAuditLog({
      userId: user.id,
      tableName: "job_roles",
      recordId: roleId,
      action: "UPDATE",
      oldValues: oldRole[0],
      newValues: roleData,
    })

    return NextResponse.json(updatedRole)
  } catch (error) {
    console.error("Update job role error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdmin()
    const roleId = Number.parseInt(params.id)

    if (isNaN(roleId)) {
      return NextResponse.json({ error: "Invalid job role ID" }, { status: 400 })
    }

    if (!isDatabaseConfigured() || !sql) {
      // Demo mode - simulate success
      return NextResponse.json({
        message: "Job role deleted successfully (demo mode)",
        isDemoMode: true,
      })
    }

    // Delete associated skill demonstrations first
    await sql`
      DELETE FROM skill_demonstrations WHERE job_role_id = ${roleId}
    `

    const result = await sql`
      DELETE FROM job_roles WHERE id = ${roleId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Job role not found" }, { status: 404 })
    }

    // Create audit log
    await createAuditLog({
      userId: user.id,
      tableName: "job_roles",
      recordId: roleId,
      action: "DELETE",
      oldValues: result[0],
    })

    return NextResponse.json({ message: "Job role deleted successfully" })
  } catch (error) {
    console.error("Delete job role error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
