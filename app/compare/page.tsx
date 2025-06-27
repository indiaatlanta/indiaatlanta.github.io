import Link from "next/link"
import { ArrowLeft, Rocket, Settings } from "lucide-react"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { CompareClient } from "./compare-client"
import Image from "next/image"

async function getAllRoles() {
  if (!isDatabaseConfigured() || !sql) {
    // Return mock data for demo mode
    return [
      { id: 1, name: "Junior Engineer", code: "E1", level: 1, department_name: "Engineering" },
      { id: 2, name: "Software Engineer", code: "E2", level: 2, department_name: "Engineering" },
      { id: 3, name: "Senior Engineer", code: "E3", level: 3, department_name: "Engineering" },
      { id: 4, name: "Lead Engineer", code: "E4", level: 4, department_name: "Engineering" },
      { id: 5, name: "Principal Engineer", code: "E5", level: 5, department_name: "Engineering" },
    ]
  }

  try {
    // Get all roles that have skill demonstrations
    const roles = await sql`
    SELECT 
      jr.id,
      jr.name,
      jr.code,
      jr.level,
      jr.salary_min,
      jr.salary_max,
      jr.location_type,
      d.name as department_name,
      COUNT(sd.id) as skill_count
    FROM job_roles jr
    JOIN departments d ON jr.department_id = d.id
    LEFT JOIN skill_demonstrations sd ON jr.id = sd.job_role_id
    GROUP BY jr.id, jr.name, jr.code, jr.level, jr.salary_min, jr.salary_max, jr.location_type, d.name
    HAVING COUNT(sd.id) > 0
    ORDER BY d.name, jr.level, jr.name
  `
    return roles
  } catch (error) {
    console.error("Error fetching roles:", error)
    // Fallback to old structure
    try {
      const fallbackRoles = await sql`
      SELECT 
        jr.id,
        jr.name,
        jr.code,
        jr.level,
        jr.salary_min,
        jr.salary_max,
        jr.location_type,
        d.name as department_name,
        COUNT(s.id) as skill_count
      FROM job_roles jr
      JOIN departments d ON jr.department_id = d.id
      LEFT JOIN skills s ON jr.id = s.job_role_id
      GROUP BY jr.id, jr.name, jr.code, jr.level, jr.salary_min, jr.salary_max, jr.location_type, d.name
      HAVING COUNT(s.id) > 0
      ORDER BY d.name, jr.level, jr.name
    `
      return fallbackRoles
    } catch (fallbackError) {
      console.error("Error with fallback query:", fallbackError)
      return []
    }
  }
}

async function getRoleSkills(roleId: number) {
  if (!isDatabaseConfigured() || !sql) {
    // Return mock skills for demo mode
    const mockSkills = [
      {
        id: 1,
        skill_name: "Security",
        level: "L1",
        demonstration_description: "Understands the importance of security.",
        skill_description: "Security is a fundamental aspect of software engineering...",
        category_name: "Technical Skills",
        category_color: "blue",
      },
      {
        id: 2,
        skill_name: "Work Breakdown",
        level: "L1",
        demonstration_description: "Understands value of rightsizing pieces of work.",
        skill_description: "Work Breakdown is the practice of decomposing large, complex work items...",
        category_name: "Delivery",
        category_color: "green",
      },
    ]

    // Return different levels based on role ID for demo
    return mockSkills.map((skill) => ({
      ...skill,
      level: roleId === 1 ? "L1" : roleId === 2 ? "L2" : "L3",
      demonstration_description:
        roleId === 1
          ? skill.demonstration_description
          : roleId === 2
            ? skill.demonstration_description.replace("Understands", "Implements")
            : skill.demonstration_description.replace("Understands", "Designs and leads"),
    }))
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
    // Fallback to old structure
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
      return []
    }
  }
}

export default async function ComparePage() {
  const roles = await getAllRoles()
  const session = await getSession()
  const isAdmin = session?.user?.role === "admin"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-brand-800 px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/images/hs1-logo.png" alt="Henry Schein One" width={32} height={32} className="h-8 w-auto" />
              <Rocket className="w-4 h-4 text-white" />
              <span className="text-white text-sm">/ Compare Roles</span>
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
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Pass data to client component */}
      <CompareClient roles={roles} getRoleSkills={getRoleSkills} isDemoMode={!isDatabaseConfigured()} />
    </div>
  )
}
