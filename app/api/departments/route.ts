import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    if (!isDatabaseConfigured() || !sql) {
      // Return mock departments for demo mode
      const mockDepartments = [
        {
          id: 1,
          name: "Engineering",
          slug: "engineering",
          description: "Software development and technical roles",
          color: "#3B82F6",
          role_count: 8,
        },
        {
          id: 2,
          name: "Product",
          slug: "product",
          description: "Product management and strategy roles",
          color: "#10B981",
          role_count: 5,
        },
        {
          id: 3,
          name: "Design",
          slug: "design",
          description: "User experience and visual design roles",
          color: "#8B5CF6",
          role_count: 4,
        },
        {
          id: 4,
          name: "Marketing",
          slug: "marketing",
          description: "Marketing and growth roles",
          color: "#F59E0B",
          role_count: 6,
        },
        {
          id: 5,
          name: "Sales",
          slug: "sales",
          description: "Sales and business development roles",
          color: "#EF4444",
          role_count: 7,
        },
        {
          id: 6,
          name: "Operations",
          slug: "operations",
          description: "Operations and support roles",
          color: "#6B7280",
          role_count: 5,
        },
      ]
      return NextResponse.json({ departments: mockDepartments, isDemoMode: true })
    }

    const departments = await sql`
      SELECT 
        d.id,
        d.name,
        d.slug,
        d.description,
        d.color,
        COUNT(jr.id) as role_count
      FROM departments d
      LEFT JOIN job_roles jr ON d.id = jr.department_id
      GROUP BY d.id, d.name, d.slug, d.description, d.color, d.sort_order
      ORDER BY d.sort_order, d.name
    `

    return NextResponse.json({ departments, isDemoMode: false })
  } catch (error) {
    console.error("Get departments error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
