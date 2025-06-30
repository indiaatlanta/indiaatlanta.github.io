import { NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function GET() {
  try {
    if (isDatabaseConfigured()) {
      try {
        const departments = await sql!`
          SELECT 
            d.id,
            d.name,
            d.slug,
            d.description,
            COUNT(DISTINCT jr.id) as total_roles,
            COUNT(DISTINCT s.id) as total_skills
          FROM departments d
          LEFT JOIN job_roles jr ON d.id = jr.department_id
          LEFT JOIN role_skills rs ON jr.id = rs.job_role_id
          LEFT JOIN skills s ON rs.skill_id = s.id
          GROUP BY d.id, d.name, d.slug, d.description
          ORDER BY d.name
        `

        return NextResponse.json({
          departments: departments.map((dept) => ({
            id: dept.id,
            name: dept.name,
            slug: dept.slug,
            description: dept.description,
            skillCount: Number.parseInt(dept.total_skills) || 0,
            roleCount: Number.parseInt(dept.total_roles) || 0,
          })),
        })
      } catch (error) {
        console.error("Database error fetching departments:", error)
        // Fall through to demo data
      }
    }

    // Demo data fallback
    const demoDepartments = [
      {
        id: 1,
        name: "Engineering",
        slug: "engineering",
        description: "Software development and technical roles",
        skillCount: 45,
        roleCount: 12,
      },
      {
        id: 2,
        name: "Product Management",
        slug: "product-management",
        description: "Product strategy and management roles",
        skillCount: 32,
        roleCount: 8,
      },
      {
        id: 3,
        name: "Design",
        slug: "design",
        description: "UX/UI design and creative roles",
        skillCount: 28,
        roleCount: 6,
      },
      {
        id: 4,
        name: "Data Science",
        slug: "data-science",
        description: "Analytics and data-driven roles",
        skillCount: 38,
        roleCount: 5,
      },
      {
        id: 5,
        name: "Marketing",
        slug: "marketing",
        description: "Marketing and growth roles",
        skillCount: 25,
        roleCount: 7,
      },
      {
        id: 6,
        name: "Sales",
        slug: "sales",
        description: "Sales and business development roles",
        skillCount: 22,
        roleCount: 9,
      },
    ]

    return NextResponse.json({ departments: demoDepartments })
  } catch (error) {
    console.error("Error fetching departments:", error)
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 })
  }
}
