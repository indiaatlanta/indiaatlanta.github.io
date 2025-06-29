import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params

    if (!isDatabaseConfigured() || !sql) {
      // Return mock roles for demo mode
      const mockRoles = [
        {
          id: 1,
          name: "Software Engineer I",
          code: "SE1",
          level: 1,
          salary_min: 70000,
          salary_max: 90000,
          location_type: "Hybrid",
          department_id: 1,
          department_name: "Engineering",
          skill_count: 12,
        },
        {
          id: 2,
          name: "Software Engineer II",
          code: "SE2",
          level: 2,
          salary_min: 90000,
          salary_max: 120000,
          location_type: "Hybrid",
          department_id: 1,
          department_name: "Engineering",
          skill_count: 15,
        },
        {
          id: 3,
          name: "Senior Software Engineer",
          code: "SSE",
          level: 3,
          salary_min: 120000,
          salary_max: 160000,
          location_type: "Hybrid",
          department_id: 1,
          department_name: "Engineering",
          skill_count: 18,
        },
        {
          id: 4,
          name: "Engineering Manager",
          code: "M1",
          level: 4,
          salary_min: 140000,
          salary_max: 180000,
          location_type: "Hybrid",
          department_id: 1,
          department_name: "Engineering",
          skill_count: 20,
        },
        {
          id: 5,
          name: "Senior Engineering Manager",
          code: "M2",
          level: 5,
          salary_min: 160000,
          salary_max: 220000,
          location_type: "Hybrid",
          department_id: 1,
          department_name: "Engineering",
          skill_count: 22,
        },
      ]

      return NextResponse.json({ roles: mockRoles, isDemoMode: true })
    }

    // Get department first
    const departments = await sql`
      SELECT id, name FROM departments WHERE slug = ${slug}
    `

    if (departments.length === 0) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 })
    }

    const department = departments[0]

    // Get roles for this department with skill counts
    const roles = await sql`
      SELECT 
        jr.id,
        jr.name,
        jr.code,
        jr.level,
        jr.salary_min,
        jr.salary_max,
        jr.location_type,
        jr.department_id,
        d.name as department_name,
        COUNT(DISTINCT djr.demonstration_template_id) as skill_count
      FROM job_roles jr
      JOIN departments d ON jr.department_id = d.id
      LEFT JOIN demonstration_job_roles djr ON jr.id = djr.job_role_id
      WHERE jr.department_id = ${department.id}
      GROUP BY jr.id, jr.name, jr.code, jr.level, jr.salary_min, jr.salary_max, jr.location_type, jr.department_id, d.name
      ORDER BY 
        CASE WHEN jr.code LIKE 'M%' THEN 1 ELSE 0 END,
        jr.level
    `

    return NextResponse.json({ roles, isDemoMode: false })
  } catch (error) {
    console.error("Get department roles error:", error)

    // Fallback to demo data
    const mockRoles = [
      {
        id: 1,
        name: "Software Engineer I",
        code: "SE1",
        level: 1,
        salary_min: 70000,
        salary_max: 90000,
        location_type: "Hybrid",
        department_id: 1,
        department_name: "Engineering",
        skill_count: 12,
      },
    ]

    return NextResponse.json({ roles: mockRoles, isDemoMode: true })
  }
}
