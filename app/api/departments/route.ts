import { NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"

// Demo departments data
const demoDepartments = [
  {
    id: 1,
    name: "Software Engineering",
    slug: "software-engineering",
    description: "Build and maintain software applications and systems",
    skillCount: 15,
    roleCount: 8,
  },
  {
    id: 2,
    name: "Product Management",
    slug: "product-management",
    description: "Drive product strategy and development lifecycle",
    skillCount: 12,
    roleCount: 6,
  },
  {
    id: 3,
    name: "Data Science",
    slug: "data-science",
    description: "Analyze data to drive business insights and decisions",
    skillCount: 18,
    roleCount: 7,
  },
  {
    id: 4,
    name: "Design",
    slug: "design",
    description: "Create user experiences and visual designs",
    skillCount: 10,
    roleCount: 5,
  },
  {
    id: 5,
    name: "Marketing",
    slug: "marketing",
    description: "Promote products and engage with customers",
    skillCount: 14,
    roleCount: 9,
  },
  {
    id: 6,
    name: "Sales",
    slug: "sales",
    description: "Drive revenue through customer relationships",
    skillCount: 11,
    roleCount: 6,
  },
  {
    id: 7,
    name: "Customer Success",
    slug: "customer-success",
    description: "Ensure customer satisfaction and retention",
    skillCount: 9,
    roleCount: 4,
  },
  {
    id: 8,
    name: "Operations",
    slug: "operations",
    description: "Manage business processes and efficiency",
    skillCount: 13,
    roleCount: 7,
  },
]

export async function GET() {
  try {
    let departments = []

    if (isDatabaseConfigured()) {
      try {
        const result = await sql!`
          SELECT 
            d.id,
            d.name,
            d.slug,
            d.description,
            COUNT(DISTINCT ds.skill_id) as skill_count,
            COUNT(DISTINCT jr.id) as role_count
          FROM departments d
          LEFT JOIN department_skills ds ON d.id = ds.department_id
          LEFT JOIN job_roles jr ON d.id = jr.department_id
          GROUP BY d.id, d.name, d.slug, d.description
          ORDER BY d.name
        `

        departments = result.map((row: any) => ({
          id: row.id,
          name: row.name,
          slug: row.slug,
          description: row.description,
          skillCount: Number.parseInt(row.skill_count) || 0,
          roleCount: Number.parseInt(row.role_count) || 0,
        }))

        console.log("Fetched departments from database:", departments.length)
      } catch (error) {
        console.error("Database error fetching departments:", error)
        departments = demoDepartments
      }
    } else {
      departments = demoDepartments
      console.log("Using demo departments data")
    }

    return NextResponse.json(departments)
  } catch (error) {
    console.error("Error fetching departments:", error)
    return NextResponse.json(demoDepartments)
  }
}
