import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { requireAdmin, hashPassword } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin()

    if (!isDatabaseConfigured() || !sql) {
      // Return mock data for demo mode
      return NextResponse.json({
        users: [
          { id: 1, email: "admin@henryscheinone.com", name: "Demo Admin", role: "admin", is_active: true },
          { id: 2, email: "manager@henryscheinone.com", name: "Demo Manager", role: "manager", is_active: true },
          { id: 3, email: "user@henryscheinone.com", name: "Demo User", role: "user", manager_id: 2, is_active: true },
        ],
        isDemoMode: true,
      })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const managerId = searchParams.get("managerId")

    let query = sql`
      SELECT 
        u.id,
        u.email,
        u.name,
        u.role,
        u.manager_id,
        u.department_id,
        u.job_title,
        u.hire_date,
        u.is_active,
        u.created_at,
        m.name as manager_name,
        d.name as department_name
      FROM users u
      LEFT JOIN users m ON u.manager_id = m.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.is_active = true
    `

    if (role) {
      query = sql`${query} AND u.role = ${role}`
    }

    if (managerId) {
      query = sql`${query} AND u.manager_id = ${Number.parseInt(managerId)}`
    }

    query = sql`${query} ORDER BY u.name`

    const users = await query
    return NextResponse.json({ users, isDemoMode: false })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminUser = await requireAdmin()
    const body = await request.json()

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json({ message: "User created successfully (Demo Mode)" })
    }

    const { email, name, password, role, managerId, departmentId, jobTitle } = body

    // Hash password
    const passwordHash = await hashPassword(password)

    const result = await sql`
      INSERT INTO users (email, password_hash, name, role, manager_id, department_id, job_title, hire_date)
      VALUES (${email}, ${passwordHash}, ${name}, ${role}, ${managerId || null}, ${departmentId || null}, ${jobTitle || null}, CURRENT_DATE)
      RETURNING id, email, name, role, manager_id, department_id, job_title, hire_date, is_active, created_at
    `

    const newUser = result[0]

    // Create audit log
    await createAuditLog({
      userId: adminUser.id,
      tableName: "users",
      recordId: newUser.id,
      action: "CREATE",
      newValues: { email, name, role, managerId, departmentId, jobTitle },
    })

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
