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

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    if (!isDatabaseConfigured() || !sql) {
      // Return demo data
      return NextResponse.json({
        roles: [
          {
            id: 1,
            name: "Senior Software Engineer",
            code: "SSE",
            level: 3,
            department_id: 1,
            department_name: "Engineering",
            skill_count: 12,
          },
          {
            id: 2,
            name: "Product Manager",
            code: "PM",
            level: 2,
            department_id: 2,
            department_name: "Product",
            skill_count: 8,
          },
        ],
        isDemoMode: true,
      })
    }

    const roles = await sql`
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
      ORDER BY d.name, jr.level, jr.name
    `

    return NextResponse.json({
      roles,
      isDemoMode: false,
    })
  } catch (error) {
    console.error("Get job roles error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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
        department_name: "Demo Department",
        skill_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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

    // Get department name for response
    const department = await sql`
      SELECT name FROM departments WHERE id = ${roleData.departmentId}
    `

    const roleWithDepartment = {
      ...newRole,
      department_name: department[0]?.name || "Unknown",
      skill_count: 0,
    }

    // Create audit log
    await createAuditLog({
      userId: user.id,
      tableName: "job_roles",
      recordId: newRole.id,
      action: "CREATE",
      newValues: roleData,
    })

    return NextResponse.json(roleWithDepartment, { status: 201 })
  } catch (error) {
    console.error("Create job role error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
