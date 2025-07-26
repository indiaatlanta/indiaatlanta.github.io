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
    const body = await request.json()
    const roleData = jobRoleSchema.parse(body)
    const roleId = Number.parseInt(params.id)

    if (!isDatabaseConfigured() || !sql) {
      // Demo mode - simulate success
      return NextResponse.json({
        id: roleId,
        ...roleData,
        department_name: "Demo Department",
        skill_count: 0,
        updated_at: new Date().toISOString(),
        message: "Job role updated successfully (demo mode)",
        isDemoMode: true,
      })
    }

    // Get current role for audit log
    const currentRole = await sql`
      SELECT * FROM job_roles WHERE id = ${roleId}
    `

    if (currentRole.length === 0) {
      return NextResponse.json({ error: "Job role not found" }, { status: 404 })
    }

    const result = await sql`
      UPDATE job_roles 
      SET name = ${roleData.name}, 
          code = ${roleData.code}, 
          department_id = ${roleData.departmentId},
          level = ${roleData.level || 1},
          salary_min = ${roleData.salaryMin || null},
          salary_max = ${roleData.salaryMax || null},
          location_type = ${roleData.locationType || null},
          updated_at = NOW()
      WHERE id = ${roleId}
      RETURNING *
    `

    const updatedRole = result[0]

    // Get department name and skill count
    const roleDetails = await sql`
      SELECT 
        jr.*,
        d.name as department_name,
        COALESCE(skill_counts.skill_count, 0) as skill_count
      FROM job_roles jr
      JOIN departments d ON jr.department_id = d.id
      LEFT JOIN (
        SELECT 
          job_role_id,
          COUNT(*) as skill_count
        FROM skill_demonstrations
        GROUP BY job_role_id
      ) skill_counts ON jr.id = skill_counts.job_role_id
      WHERE jr.id = ${roleId}
    `

    // Create audit log
    await createAuditLog({
      userId: user.id,
      tableName: "job_roles",
      recordId: roleId,
      action: "UPDATE",
      oldValues: currentRole[0],
      newValues: roleData,
    })

    return NextResponse.json(roleDetails[0])
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

    if (!isDatabaseConfigured() || !sql) {
      // Demo mode - simulate success
      return NextResponse.json({
        message: "Job role deleted successfully (demo mode)",
        isDemoMode: true,
      })
    }

    // Get current role for audit log
    const currentRole = await sql`
      SELECT * FROM job_roles WHERE id = ${roleId}
    `

    if (currentRole.length === 0) {
      return NextResponse.json({ error: "Job role not found" }, { status: 404 })
    }

    // Check if role has skill demonstrations
    const demonstrations = await sql`
      SELECT COUNT(*) as count FROM skill_demonstrations WHERE job_role_id = ${roleId}
    `

    if (demonstrations[0].count > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete job role with existing skill demonstrations. Please delete demonstrations first.",
        },
        { status: 400 },
      )
    }

    await sql`
      DELETE FROM job_roles WHERE id = ${roleId}
    `

    // Create audit log
    await createAuditLog({
      userId: user.id,
      tableName: "job_roles",
      recordId: roleId,
      action: "DELETE",
      oldValues: currentRole[0],
    })

    return NextResponse.json({ message: "Job role deleted successfully" })
  } catch (error) {
    console.error("Delete job role error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
