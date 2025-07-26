import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit"
import { z } from "zod"

const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required").max(255, "Name too long"),
  slug: z.string().min(1, "Slug is required").max(255, "Slug too long"),
  description: z.string().max(2000, "Description too long").optional(),
})

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdmin()
    const body = await request.json()
    const departmentData = departmentSchema.parse(body)
    const departmentId = Number.parseInt(params.id)

    if (!isDatabaseConfigured() || !sql) {
      // Demo mode - simulate success
      return NextResponse.json({
        id: departmentId,
        ...departmentData,
        updated_at: new Date().toISOString(),
        message: "Department updated successfully (demo mode)",
        isDemoMode: true,
      })
    }

    // Get current department for audit log
    const currentDept = await sql`
      SELECT * FROM departments WHERE id = ${departmentId}
    `

    if (currentDept.length === 0) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 })
    }

    const result = await sql`
      UPDATE departments 
      SET name = ${departmentData.name}, 
          slug = ${departmentData.slug}, 
          description = ${departmentData.description || ""},
          updated_at = NOW()
      WHERE id = ${departmentId}
      RETURNING *
    `

    const updatedDepartment = result[0]

    // Create audit log
    await createAuditLog({
      userId: user.id,
      tableName: "departments",
      recordId: departmentId,
      action: "UPDATE",
      oldValues: currentDept[0],
      newValues: departmentData,
    })

    return NextResponse.json(updatedDepartment)
  } catch (error) {
    console.error("Update department error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdmin()
    const departmentId = Number.parseInt(params.id)

    if (!isDatabaseConfigured() || !sql) {
      // Demo mode - simulate success
      return NextResponse.json({
        message: "Department deleted successfully (demo mode)",
        isDemoMode: true,
      })
    }

    // Get current department for audit log
    const currentDept = await sql`
      SELECT * FROM departments WHERE id = ${departmentId}
    `

    if (currentDept.length === 0) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 })
    }

    // Check if department has job roles
    const jobRoles = await sql`
      SELECT COUNT(*) as count FROM job_roles WHERE department_id = ${departmentId}
    `

    if (jobRoles[0].count > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete department with existing job roles. Please delete or reassign job roles first.",
        },
        { status: 400 },
      )
    }

    await sql`
      DELETE FROM departments WHERE id = ${departmentId}
    `

    // Create audit log
    await createAuditLog({
      userId: user.id,
      tableName: "departments",
      recordId: departmentId,
      action: "DELETE",
      oldValues: currentDept[0],
    })

    return NextResponse.json({ message: "Department deleted successfully" })
  } catch (error) {
    console.error("Delete department error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
