import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Rocket, Settings } from "lucide-react"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { DepartmentClient } from "./department-client"

async function getDepartmentData(slug: string) {
  if (!isDatabaseConfigured() || !sql) {
    // Return mock data for demo mode
    return {
      department: {
        id: 1,
        name: "Engineering",
        slug: "engineering",
        description: "Software development and technical roles",
      },
      roles: [
        { id: 1, name: "Junior Engineer", code: "E1", level: 1, skill_count: 25 },
        { id: 2, name: "Software Engineer", code: "E2", level: 2, skill_count: 30 },
        { id: 3, name: "Senior Engineer", code: "E3", level: 3, skill_count: 35 },
      ],
    }
  }

  try {
    // Get department
    const departments = await sql`
      SELECT id, name, slug, description
      FROM departments
      WHERE slug = ${slug}
    `

    if (departments.length === 0) {
      return null
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
        COUNT(s.id) as skill_count
      FROM job_roles jr
      LEFT JOIN skills s ON jr.id = s.job_role_id
      WHERE jr.department_id = ${department.id}
      GROUP BY jr.id, jr.name, jr.code, jr.level, jr.salary_min, jr.salary_max, jr.location_type
      ORDER BY jr.level, jr.name
    `

    return { department, roles }
  } catch (error) {
    console.error("Error fetching department data:", error)
    return null
  }
}

async function getRoleSkills(roleId: number) {
  if (!isDatabaseConfigured() || !sql) {
    // Return mock skills for demo mode
    return [
      {
        id: 1,
        name: "Security",
        level: "L1",
        description: "Understands the importance of security.",
        full_description:
          "Security is a fundamental aspect of software engineering that encompasses understanding and implementing measures to protect systems, data, and users from various threats and vulnerabilities.\n\nAt the L1 level, engineers should understand basic security principles, common vulnerabilities, and secure coding practices. This includes awareness of authentication, authorization, data encryption, and when to escalate security concerns.",
        category_name: "Technical Skills",
        category_color: "blue",
      },
      {
        id: 2,
        name: "Work Breakdown",
        level: "L1",
        description: "Understands value of rightsizing pieces of work to enable continuous deployment.",
        full_description:
          "Work Breakdown is the practice of decomposing large, complex work items into smaller, manageable pieces that can be delivered incrementally and continuously deployed.\n\nAt the L1 level, engineers should understand the value of small, independent work items for faster feedback cycles, reduced risk, and better estimation. This includes understanding how proper work breakdown enables continuous deployment and incremental delivery of business value.",
        category_name: "Delivery",
        category_color: "green",
      },
    ]
  }

  try {
    const skills = await sql`
      SELECT 
        s.id,
        s.name,
        s.level,
        s.description,
        s.full_description,
        sc.name as category_name,
        sc.color as category_color
      FROM skills s
      JOIN skill_categories sc ON s.category_id = sc.id
      WHERE s.job_role_id = ${roleId}
      ORDER BY sc.sort_order, s.sort_order, s.name
    `

    return skills
  } catch (error) {
    console.error("Error fetching role skills:", error)
    return []
  }
}

interface PageProps {
  params: {
    slug: string
  }
}

export default async function DepartmentPage({ params }: PageProps) {
  const data = await getDepartmentData(params.slug)

  if (!data) {
    notFound()
  }

  const { department, roles } = data
  const session = await getSession()
  const isAdmin = session?.user?.role === "admin"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-amber-900 px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-amber-900 font-bold text-xs">HS1</span>
              </div>
              <Rocket className="w-4 h-4 text-white" />
              <span className="text-white text-sm">/ {department.name}</span>
            </div>
            {isAdmin && (
              <Link
                href="/admin"
                className="ml-auto bg-amber-100 text-amber-900 px-3 py-1 rounded-md text-sm font-medium hover:bg-amber-200 transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-6 py-3">
            <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </div>

      {/* Pass data to client component */}
      <DepartmentClient
        department={department}
        roles={roles}
        getRoleSkills={getRoleSkills}
        isDemoMode={!isDatabaseConfigured()}
      />
    </div>
  )
}
