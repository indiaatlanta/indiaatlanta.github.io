import { NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"

// Demo departments for when database is not configured
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
    name: "Product",
    slug: "product",
    description: "Product management and strategy",
    skillCount: 32,
    roleCount: 8,
  },
  {
    id: 3,
    name: "Design",
    slug: "design",
    description: "UX/UI and visual design",
    skillCount: 28,
    roleCount: 6,
  },
  {
    id: 4,
    name: "Marketing",
    slug: "marketing",
    description: "Digital marketing and growth",
    skillCount: 35,
    roleCount: 10,
  },
  {
    id: 5,
    name: "Sales",
    slug: "sales",
    description: "Sales and business development",
    skillCount: 25,
    roleCount: 7,
  },
  {
    id: 6,
    name: "Operations",
    slug: "operations",
    description: "Business operations and support",
    skillCount: 30,
    roleCount: 9,
  },
]

export async function GET() {
  try {
    let departments = []

    // Try to fetch from database if configured
    if (isDatabaseConfigured()) {
      try {
        const result = await sql!`
          SELECT 
            d.id,
            d.name,
            d.slug,
            d.description,
            COUNT(DISTINCT s.id) as skill_count,
            COUNT(DISTINCT jr.id) as role_count
          FROM departments d
          LEFT JOIN skills s ON d.id = s.department_id
          LEFT JOIN job_roles jr ON d.id = jr.department_id
          GROUP BY d.id, d.name, d.slug, d.description
          ORDER BY d.name
        `

        departments = result.map((dept: any) => ({
          id: dept.id,
          name: dept.name,
          slug: dept.slug,
          description: dept.description,
          skillCount: Number.parseInt(dept.skill_count) || 0,
          roleCount: Number.parseInt(dept.role_count) || 0,
        }))

        console.log("Fetched departments from database:", departments.length)
      } catch (dbError) {
        console.error("Database error fetching departments:", dbError)
        // Fall back to demo data
        departments = demoDepartments
      }
    } else {
      // Use demo data when database is not configured
      departments = demoDepartments
      console.log("Using demo departments data")
    }

    return NextResponse.json({
      departments,
      total: departments.length,
    })
  } catch (error) {
    console.error("Error fetching departments:", error)
    return NextResponse.json(
      {
        departments: demoDepartments,
        total: demoDepartments.length,
      },
      { status: 200 },
    )
  }
}
