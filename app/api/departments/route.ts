import { NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"

// Demo departments for when database is not configured
const demoDepartments = [
  {
    id: 1,
    name: "Software Engineering",
    slug: "software-engineering",
    description: "Build and maintain software applications and systems",
    total_roles: 12,
    total_skills: 45,
  },
  {
    id: 2,
    name: "Product Management",
    slug: "product-management",
    description: "Drive product strategy and development lifecycle",
    total_roles: 8,
    total_skills: 32,
  },
  {
    id: 3,
    name: "Data Science",
    slug: "data-science",
    description: "Analyze data to drive business insights and decisions",
    total_roles: 6,
    total_skills: 28,
  },
  {
    id: 4,
    name: "Design",
    slug: "design",
    description: "Create user experiences and visual designs",
    total_roles: 7,
    total_skills: 25,
  },
  {
    id: 5,
    name: "Marketing",
    slug: "marketing",
    description: "Promote products and engage with customers",
    total_roles: 9,
    total_skills: 30,
  },
  {
    id: 6,
    name: "Sales",
    slug: "sales",
    description: "Drive revenue through customer relationships",
    total_roles: 5,
    total_skills: 22,
  },
]

export async function GET() {
  try {
    let departments = demoDepartments

    // Try to fetch from database if configured
    if (isDatabaseConfigured()) {
      try {
        const dbDepartments = await sql!`
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

        if (dbDepartments.length > 0) {
          departments = dbDepartments.map((dept) => ({
            ...dept,
            total_roles: Number(dept.total_roles) || 0,
            total_skills: Number(dept.total_skills) || 0,
          }))
        }
      } catch (dbError) {
        console.error("Database error, using demo data:", dbError)
      }
    }

    return NextResponse.json(departments)
  } catch (error) {
    console.error("Error fetching departments:", error)
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 })
  }
}
