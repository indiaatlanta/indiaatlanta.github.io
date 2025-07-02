import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit"

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
