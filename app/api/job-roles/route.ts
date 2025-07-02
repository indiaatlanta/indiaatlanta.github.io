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

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin()
    const body = await request.json()
    const roleData = jobRoleSchema.parse(body)

    if (!isDatabaseConfigured() || !sql) {
      // Demo mode - simulate success
      return NextResponse.json({
        id: Math.floor(Math.random() * 1000),
        ...roleData,
        message: "Job role created successfully (demo mode)",
        isDemoMode: true,
      })
    }

    const result = await sql`
      INSERT INTO job_roles (name, code, department_id, level, salary_min, salary_max, location_type)
      VALUES (
        ${roleData.name}, 
        ${roleData.code}, 
        ${roleData.departmentId}, 
        ${roleData.level || 1}, 
        ${roleData.salaryMin || null}, 
        ${roleData.salaryMax || null}, 
        ${roleData.locationType || null}
      )
      RETURNING *
    `

    const newRole = result[0]

    // Create audit log
    await createAuditLog({
      userId: user.id,
      tableName: "job_roles",
      recordId: newRole.id,
      action: "CREATE",
      newValues: roleData,
    })

    return NextResponse.json(newRole, { status: 201 })
  } catch (error) {
    console.error("Create job role error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
