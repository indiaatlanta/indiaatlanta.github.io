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

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    if (!isDatabaseConfigured() || !sql) {
      // Return demo data
      return NextResponse.json({
        departments: [
          { id: 1, name: "Engineering", slug: "engineering", description: "Software development and technical roles" },
          { id: 2, name: "Product", slug: "product", description: "Product management and strategy" },
          { id: 3, name: "Design", slug: "design", description: "User experience and visual design" },
          { id: 4, name: "Marketing", slug: "marketing", description: "Marketing and growth" },
        ],
        isDemoMode: true,
      })
    }

    const departments = await sql`
      SELECT id, name, slug, description, created_at, updated_at
      FROM departments
      ORDER BY name
    `

    return NextResponse.json({
      departments,
      isDemoMode: false,
    })
  } catch (error) {
    console.error("Get departments error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin()
    const body = await request.json()
    const departmentData = departmentSchema.parse(body)

    if (!isDatabaseConfigured() || !sql) {
      // Demo mode - simulate success
      return NextResponse.json({
        id: Math.floor(Math.random() * 1000),
        ...departmentData,
        message: "Department created successfully (demo mode)",
        isDemoMode: true,
      })
    }

    const result = await sql`
      INSERT INTO departments (name, slug, description)
      VALUES (${departmentData.name}, ${departmentData.slug}, ${departmentData.description || ""})
      RETURNING *
    `

    const newDepartment = result[0]

    // Create audit log
    await createAuditLog({
      userId: user.id,
      tableName: "departments",
      recordId: newDepartment.id,
      action: "CREATE",
      newValues: departmentData,
    })

    return NextResponse.json(newDepartment, { status: 201 })
  } catch (error) {
    console.error("Create department error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
