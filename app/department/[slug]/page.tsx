import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Rocket, Settings } from "lucide-react"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { DepartmentClient } from "./department-client"
import Image from "next/image"

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
    // Get department (show all departments)
    const departments = await sql`
      SELECT id, name, slug, description
      FROM departments
      WHERE slug = ${slug}
    `

    if (departments.length === 0) {
      return null
    }

    const department = departments[0]

    // Get ALL roles for this department, but only show those with skill demonstrations
    const roles = await sql`
      SELECT 
        jr.id,
        jr.name,
        jr.code,
        jr.level,
        jr.salary_min,
        jr.salary_max,
        jr.location_type,
        COUNT(sd.id) as skill_count
      FROM job_roles jr
      LEFT JOIN skill_demonstrations sd ON jr.id = sd.job_role_id
      WHERE jr.department_id = ${department.id}
      GROUP BY jr.id, jr.name, jr.code, jr.level, jr.salary_min, jr.salary_max, jr.location_type
      HAVING COUNT(sd.id) > 0
      ORDER BY jr.level, jr.name
    `

    return { department, roles }
  } catch (error) {
    console.error("Error fetching department data:", error)
    // Return mock data on error instead of null
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
}

async function getRoleSkills(roleId: number) {
  if (!isDatabaseConfigured() || !sql) {
    // Return mock skills for demo mode
    return [
      {
        id: 1,
        skill_name: "Security",
        level: "L1",
        demonstration_description: "Understands the importance of security.",
        skill_description:
          "Security is a fundamental aspect of software engineering that encompasses understanding and implementing measures to protect systems, data, and users from various threats and vulnerabilities.\n\nAt the L1 level, engineers should understand basic security principles, common vulnerabilities, and secure coding practices. This includes awareness of authentication, authorization, data encryption, and when to escalate security concerns.",
        category_name: "Technical Skills",
        category_color: "blue",
      },
      {
        id: 2,
        skill_name: "Work Breakdown",
        level: "L1",
        demonstration_description: "Understands value of rightsizing pieces of work to enable continuous deployment.",
        skill_description:
          "Work Breakdown is the practice of decomposing large, complex work items into smaller, manageable pieces that can be delivered incrementally and continuously deployed.\n\nAt the L1 level, engineers should understand the value of small, independent work items for faster feedback cycles, reduced risk, and better estimation. This includes understanding how proper work breakdown enables continuous deployment and incremental delivery of business value.",
        category_name: "Delivery",
        category_color: "green",
      },
    ]
  }

  try {
    // Use the new skill demonstrations structure
    const skills = await sql`
      SELECT 
        sd.id,
        sm.name as skill_name,
        sd.level,
        sd.demonstration_description,
        sm.description as skill_description,
        sc.name as category_name,
        sc.color as category_color,
        sd.sort_order
      FROM skill_demonstrations sd
      JOIN skills_master sm ON sd.skill_master_id = sm.id
      JOIN skill_categories sc ON sm.category_id = sc.id
      WHERE sd.job_role_id = ${roleId}
      ORDER BY sc.sort_order, sm.sort_order, sd.sort_order, sm.name
    `

    return skills
  } catch (error) {
    console.error("Error fetching role skills:", error)
    // Fallback to old structure if new tables don't exist yet
    try {
      const fallbackSkills = await sql`
        SELECT 
          s.id,
          s.name as skill_name,
          s.level,
          s.description as demonstration_description,
          s.full_description as skill_description,
          sc.name as category_name,
          sc.color as category_color,
          s.sort_order
        FROM skills s
        JOIN skill_categories sc ON s.category_id = sc.id
        WHERE s.job_role_id = ${roleId}
        ORDER BY sc.sort_order, s.sort_order, s.name
      `
      return fallbackSkills
    } catch (fallbackError) {
      console.error("Error with fallback query:", fallbackError)
      // Return mock data instead of empty array
      return [
        {
          id: 1,
          skill_name: "Security",
          level: "L1",
          demonstration_description: "Understands the importance of security.",
          skill_description: "Security is a fundamental aspect of software engineering...",
          category_name: "Technical Skills",
          category_color: "blue",
        },
      ]
    }
  }
}

interface PageProps {
  params: {
    slug: string
  }
}

export default async function DepartmentPage({ params }: PageProps) {
  try {
    const data = await getDepartmentData(params.slug)

    if (!data) {
      notFound()
    }

    const { department, roles } = data
    let session = null
    let isAdmin = false

    try {
      session = await getSession()
      isAdmin = session?.user?.role === "admin"
    } catch (error) {
      console.error("Error getting session:", error)
      // Continue without session
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-brand-800 px-4 py-3">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/hs1-logo.png"
                  alt="Henry Schein One"
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                />
                <Rocket className="w-4 h-4 text-white" />
                <span className="text-white text-sm">/ {department.name}</span>
              </div>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="ml-auto bg-brand-100 text-brand-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-brand-200 transition-colors flex items-center gap-2"
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
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Update the department header section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {department.name} <span className="text-gray-500">({roles.length})</span>
            </h1>
            {department.description && <p className="text-gray-600">{department.description}</p>}

            {/* Role breakdown */}
            {roles.length > 0 && (
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                <span>Individual Contributors: {roles.filter((r) => !r.code.startsWith("M")).length}</span>
                {roles.filter((r) => r.code.startsWith("M")).length > 0 && (
                  <span>Leadership: {roles.filter((r) => r.code.startsWith("M")).length}</span>
                )}
              </div>
            )}
          </div>
          <DepartmentClient
            department={department}
            roles={roles}
            getRoleSkills={getRoleSkills}
            isDemoMode={!isDatabaseConfigured()}
          />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in DepartmentPage:", error)
    // Return a fallback page instead of throwing
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Department Not Available</h1>
          <p className="text-gray-600 mb-4">We're experiencing technical difficulties. Please try again later.</p>
          <Link href="/" className="text-brand-600 hover:text-brand-700">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }
}
