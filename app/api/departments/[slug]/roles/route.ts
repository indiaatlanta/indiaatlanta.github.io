import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params

    if (!isDatabaseConfigured() || !sql) {
      // Return mock roles for demo mode
      const mockRoles: Record<string, any[]> = {
        engineering: [
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
            skill_count: 18,
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
            skill_count: 24,
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
        ],
        product: [
          {
            id: 5,
            name: "Product Manager I",
            code: "PM1",
            level: 1,
            salary_min: 80000,
            salary_max: 100000,
            location_type: "Hybrid",
            department_id: 2,
            department_name: "Product",
            skill_count: 15,
          },
          {
            id: 6,
            name: "Product Manager II",
            code: "PM2",
            level: 2,
            salary_min: 100000,
            salary_max: 130000,
            location_type: "Hybrid",
            department_id: 2,
            department_name: "Product",
            skill_count: 20,
          },
          {
            id: 7,
            name: "Senior Product Manager",
            code: "SPM",
            level: 3,
            salary_min: 130000,
            salary_max: 170000,
            location_type: "Hybrid",
            department_id: 2,
            department_name: "Product",
            skill_count: 25,
          },
          {
            id: 8,
            name: "Product Director",
            code: "M2",
            level: 4,
            salary_min: 160000,
            salary_max: 220000,
            location_type: "Hybrid",
            department_id: 2,
            department_name: "Product",
            skill_count: 22,
          },
        ],
        design: [
          {
            id: 9,
            name: "UX Designer I",
            code: "UX1",
            level: 1,
            salary_min: 65000,
            salary_max: 85000,
            location_type: "Hybrid",
            department_id: 3,
            department_name: "Design",
            skill_count: 14,
          },
          {
            id: 10,
            name: "UX Designer II",
            code: "UX2",
            level: 2,
            salary_min: 85000,
            salary_max: 110000,
            location_type: "Hybrid",
            department_id: 3,
            department_name: "Design",
            skill_count: 18,
          },
          {
            id: 11,
            name: "Senior UX Designer",
            code: "SUX",
            level: 3,
            salary_min: 110000,
            salary_max: 140000,
            location_type: "Hybrid",
            department_id: 3,
            department_name: "Design",
            skill_count: 22,
          },
        ],
        marketing: [
          {
            id: 12,
            name: "Marketing Specialist",
            code: "MK1",
            level: 1,
            salary_min: 55000,
            salary_max: 75000,
            location_type: "Hybrid",
            department_id: 4,
            department_name: "Marketing",
            skill_count: 12,
          },
          {
            id: 13,
            name: "Marketing Manager",
            code: "MK2",
            level: 2,
            salary_min: 75000,
            salary_max: 95000,
            location_type: "Hybrid",
            department_id: 4,
            department_name: "Marketing",
            skill_count: 16,
          },
          {
            id: 14,
            name: "Senior Marketing Manager",
            code: "SMK",
            level: 3,
            salary_min: 95000,
            salary_max: 125000,
            location_type: "Hybrid",
            department_id: 4,
            department_name: "Marketing",
            skill_count: 20,
          },
        ],
        sales: [
          {
            id: 15,
            name: "Sales Representative",
            code: "SR1",
            level: 1,
            salary_min: 50000,
            salary_max: 70000,
            location_type: "Hybrid",
            department_id: 5,
            department_name: "Sales",
            skill_count: 10,
          },
          {
            id: 16,
            name: "Senior Sales Representative",
            code: "SR2",
            level: 2,
            salary_min: 70000,
            salary_max: 90000,
            location_type: "Hybrid",
            department_id: 5,
            department_name: "Sales",
            skill_count: 14,
          },
          {
            id: 17,
            name: "Sales Manager",
            code: "M3",
            level: 3,
            salary_min: 90000,
            salary_max: 120000,
            location_type: "Hybrid",
            department_id: 5,
            department_name: "Sales",
            skill_count: 18,
          },
        ],
        operations: [
          {
            id: 18,
            name: "Operations Specialist",
            code: "OP1",
            level: 1,
            salary_min: 55000,
            salary_max: 75000,
            location_type: "Hybrid",
            department_id: 6,
            department_name: "Operations",
            skill_count: 11,
          },
          {
            id: 19,
            name: "Operations Manager",
            code: "M4",
            level: 2,
            salary_min: 75000,
            salary_max: 100000,
            location_type: "Hybrid",
            department_id: 6,
            department_name: "Operations",
            skill_count: 16,
          },
        ],
      }

      const roles = mockRoles[slug] || []
      return NextResponse.json({ roles, isDemoMode: true })
    }

    // Get department first
    const departments = await sql`
      SELECT id FROM departments WHERE slug = ${slug}
    `

    if (departments.length === 0) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 })
    }

    const departmentId = departments[0].id

    // Get roles for this department with skill counts
    const roles = await sql`
      SELECT 
        jr.id,
        jr.name as title,
        jr.code,
        jr.level,
        jr.salary_min,
        jr.salary_max,
        jr.location_type,
        jr.department_id,
        d.name as department_name,
        CASE 
          WHEN jr.code LIKE 'M%' OR LOWER(jr.name) LIKE '%manager%' OR LOWER(jr.name) LIKE '%director%' OR LOWER(jr.name) LIKE '%lead%'
          THEN true 
          ELSE false 
        END as is_manager,
        COUNT(djr.demonstration_template_id) as skill_count
      FROM job_roles jr
      LEFT JOIN departments d ON jr.department_id = d.id
      LEFT JOIN demonstration_job_roles djr ON jr.id = djr.job_role_id
      WHERE jr.department_id = ${departmentId}
      GROUP BY jr.id, jr.name, jr.code, jr.level, jr.salary_min, jr.salary_max, jr.location_type, jr.department_id, d.name
      ORDER BY jr.level, jr.name
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
