import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params

    if (!isDatabaseConfigured() || !sql) {
      // Return mock department for demo mode
      const mockDepartments: Record<string, any> = {
        engineering: {
          id: 1,
          name: "Engineering",
          slug: "engineering",
          description: "Software development and technical roles",
          color: "#3B82F6",
        },
        product: {
          id: 2,
          name: "Product",
          slug: "product",
          description: "Product management and strategy roles",
          color: "#10B981",
        },
        design: {
          id: 3,
          name: "Design",
          slug: "design",
          description: "User experience and visual design roles",
          color: "#8B5CF6",
        },
        marketing: {
          id: 4,
          name: "Marketing",
          slug: "marketing",
          description: "Marketing and growth roles",
          color: "#F59E0B",
        },
        sales: {
          id: 5,
          name: "Sales",
          slug: "sales",
          description: "Sales and business development roles",
          color: "#EF4444",
        },
        operations: {
          id: 6,
          name: "Operations",
          slug: "operations",
          description: "Operations and support roles",
          color: "#6B7280",
        },
      }

      const department = mockDepartments[slug]
      if (!department) {
        return NextResponse.json({ error: "Department not found" }, { status: 404 })
      }

      return NextResponse.json({ department, isDemoMode: true })
    }

    const departments = await sql`
      SELECT id, name, slug, description, color
      FROM departments
      WHERE slug = ${slug}
    `

    if (departments.length === 0) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 })
    }

    return NextResponse.json({ department: departments[0], isDemoMode: false })
  } catch (error) {
    console.error("Get department error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
