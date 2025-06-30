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
          LEFT JOIN role_skills rs ON jr.id = rs.role_id
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
            total_roles: dept.total_roles,
            total_skills: dept.total_skills,
          })),
        })
      } catch (error) {
        console.error("Database error:", error)
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
        total_roles: 12,
        total_skills: 45,
      },
      {
        id: 2,
        name: "Product Management",
        slug: "product-management",
        description: "Product strategy and management roles",
        total_roles: 8,
        total_skills: 32,
      },
      {
        id: 3,
        name: "Design",
        slug: "design",
        description: "UX/UI design and creative roles",
        total_roles: 6,
        total_skills: 28,
      },
      {
        id: 4,
        name: "Data Science",
        slug: "data-science",
        description: "Analytics and data-driven roles",
        total_roles: 5,
        total_skills: 38,
      },
      {
        id: 5,
        name: "Marketing",
        slug: "marketing",
        description: "Marketing and growth roles",
        total_roles: 10,
        total_skills: 25,
      },
      {
        id: 6,
        name: "Sales",
        slug: "sales",
        description: "Sales and business development roles",
        total_roles: 7,
        total_skills: 22,
      },
    ]

    return NextResponse.json({ departments: demoDepartments })
  } catch (error) {
    console.error("Departments API error:", error)
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 })
  }
}
