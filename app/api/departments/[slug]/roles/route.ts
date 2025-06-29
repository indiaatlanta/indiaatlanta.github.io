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
            title: "Software Engineer I",
            code: "SE1",
            level: "Junior",
            description: "Entry-level software development position",
            is_manager: false,
            skill_count: 12,
          },
          {
            id: 2,
            title: "Software Engineer II",
            code: "SE2",
            level: "Mid",
            description: "Mid-level software development position",
            is_manager: false,
            skill_count: 18,
          },
          {
            id: 3,
            title: "Senior Software Engineer",
            code: "SE3",
            level: "Senior",
            description: "Senior-level software development position",
            is_manager: false,
            skill_count: 24,
          },
          {
            id: 4,
            title: "Engineering Manager",
            code: "M-EM",
            level: "Manager",
            description: "Engineering team leadership and management",
            is_manager: true,
            skill_count: 20,
          },
        ],
        product: [
          {
            id: 5,
            title: "Product Manager I",
            code: "PM1",
            level: "Junior",
            description: "Entry-level product management position",
            is_manager: false,
            skill_count: 15,
          },
          {
            id: 6,
            title: "Product Manager II",
            code: "PM2",
            level: "Mid",
            description: "Mid-level product management position",
            is_manager: false,
            skill_count: 20,
          },
          {
            id: 7,
            title: "Senior Product Manager",
            code: "PM3",
            level: "Senior",
            description: "Senior product strategy and execution",
            is_manager: false,
            skill_count: 25,
          },
          {
            id: 8,
            title: "Product Director",
            code: "M-PD",
            level: "Manager",
            description: "Product team leadership and strategy",
            is_manager: true,
            skill_count: 22,
          },
        ],
        design: [
          {
            id: 9,
            title: "UX Designer I",
            code: "UX1",
            level: "Junior",
            description: "Entry-level UX design position",
            is_manager: false,
            skill_count: 14,
          },
          {
            id: 10,
            title: "UX Designer II",
            code: "UX2",
            level: "Mid",
            description: "Mid-level UX design position",
            is_manager: false,
            skill_count: 18,
          },
          {
            id: 11,
            title: "Senior UX Designer",
            code: "UX3",
            level: "Senior",
            description: "Senior UX design and research",
            is_manager: false,
            skill_count: 22,
          },
        ],
        marketing: [
          {
            id: 12,
            title: "Marketing Specialist",
            code: "MK1",
            level: "Junior",
            description: "Entry-level marketing position",
            is_manager: false,
            skill_count: 12,
          },
          {
            id: 13,
            title: "Marketing Manager",
            code: "MK2",
            level: "Mid",
            description: "Marketing campaign management",
            is_manager: false,
            skill_count: 16,
          },
          {
            id: 14,
            title: "Senior Marketing Manager",
            code: "MK3",
            level: "Senior",
            description: "Senior marketing strategy",
            is_manager: false,
            skill_count: 20,
          },
        ],
        sales: [
          {
            id: 15,
            title: "Sales Representative",
            code: "SR1",
            level: "Junior",
            description: "Entry-level sales position",
            is_manager: false,
            skill_count: 10,
          },
          {
            id: 16,
            title: "Senior Sales Representative",
            code: "SR2",
            level: "Mid",
            description: "Experienced sales professional",
            is_manager: false,
            skill_count: 14,
          },
          {
            id: 17,
            title: "Sales Manager",
            code: "M-SM",
            level: "Manager",
            description: "Sales team leadership",
            is_manager: true,
            skill_count: 18,
          },
        ],
        operations: [
          {
            id: 18,
            title: "Operations Specialist",
            code: "OP1",
            level: "Junior",
            description: "Entry-level operations position",
            is_manager: false,
            skill_count: 11,
          },
          {
            id: 19,
            title: "Operations Manager",
            code: "M-OM",
            level: "Manager",
            description: "Operations team leadership",
            is_manager: true,
            skill_count: 16,
          },
        ],
      }

      const roles = mockRoles[slug] || []
      return NextResponse.json({ roles, isDemoMode: true })
    }

    // Get department ID first
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
        jr.title,
        jr.code,
        jr.level,
        jr.description,
        jr.is_manager,
        COUNT(djr.demonstration_template_id) as skill_count
      FROM job_roles jr
      LEFT JOIN demonstration_job_roles djr ON jr.id = djr.job_role_id
      WHERE jr.department_id = ${departmentId}
      GROUP BY jr.id, jr.title, jr.code, jr.level, jr.description, jr.is_manager, jr.sort_order
      ORDER BY jr.sort_order, jr.title
    `

    return NextResponse.json({ roles, isDemoMode: false })
  } catch (error) {
    console.error("Get department roles error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
