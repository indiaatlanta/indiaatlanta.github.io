import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { requireAdmin, hashPassword } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminUser = await requireAdmin()
    const userId = Number.parseInt(params.id)
    const body = await request.json()

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json({ message: "User updated successfully (Demo Mode)" })
    }

    const { email, name, role, managerId, departmentId, jobTitle, isActive, password } = body

    // Get old values for audit
    const oldUser = await sql`SELECT * FROM users WHERE id = ${userId}`
    if (oldUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const updateData: any = {
      email,
      name,
      role,
      manager_id: managerId || null,
      department_id: departmentId || null,
      job_title: jobTitle || null,
      is_active: isActive,
      updated_at: new Date(),
    }

    // Only update password if provided
    if (password) {
      updateData.password_hash = await hashPassword(password)
    }

    const result = await sql`
      UPDATE users 
      SET 
        email = ${updateData.email},
        name = ${updateData.name},
        role = ${updateData.role},
        manager_id = ${updateData.manager_id},
        department_id = ${updateData.department_id},
        job_title = ${updateData.job_title},
        is_active = ${updateData.is_active},
        updated_at = ${updateData.updated_at}
        ${password ? sql`, password_hash = ${updateData.password_hash}` : sql``}
      WHERE id = ${userId}
      RETURNING id, email, name, role, manager_id, department_id, job_title, hire_date, is_active, created_at, updated_at
    `

    const updatedUser = result[0]

    // Create audit log
    await createAuditLog({
      userId: adminUser.id,
      tableName: "users",
      recordId: userId,
      action: "UPDATE",
      oldValues: oldUser[0],
      newValues: updateData,
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminUser = await requireAdmin()
    const userId = Number.parseInt(params.id)

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json({ message: "User deactivated successfully (Demo Mode)" })
    }

    // Get user data for audit
    const user = await sql`SELECT * FROM users WHERE id = ${userId}`
    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Soft delete by setting is_active to false
    await sql`UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ${userId}`

    // Create audit log
    await createAuditLog({
      userId: adminUser.id,
      tableName: "users",
      recordId: userId,
      action: "UPDATE",
      oldValues: user[0],
      newValues: { is_active: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
