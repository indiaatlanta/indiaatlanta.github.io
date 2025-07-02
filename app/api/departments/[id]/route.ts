import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdmin()
    const departmentId = Number.parseInt(params.id)

    if (isNaN(departmentId)) {
      return NextResponse.json({ error: "Invalid department ID" }, { status: 400 })
    }

    if (!isDatabaseConfigured() || !sql) {
      // Demo mode - simulate success
      return NextResponse.json({
        message: "Department deleted successfully (demo mode)",
        isDemoMode: true,
      })
    }

    // Check if department has job roles
    const jobRoles = await sql`
      SELECT COUNT(*) as count FROM job_roles WHERE department_id = ${departmentId}
    `

    if (jobRoles[0].count > 0) {
      return NextResponse.json({ error: "Cannot delete department with existing job roles" }, { status: 400 })
    }

    const result = await sql`
      DELETE FROM departments WHERE id = ${departmentId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 })
    }

    // Create audit log
    await createAuditLog({
      userId: user.id,
      tableName: "departments",
      recordId: departmentId,
      action: "DELETE",
      oldValues: result[0],
    })

    return NextResponse.json({ message: "Department deleted successfully" })
  } catch (error) {
    console.error("Delete department error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
