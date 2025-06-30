import Link from "next/link"
import { ArrowRight, Users, Target, TrendingUp, Rocket, Settings } from "lucide-react"
import { getSession } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"
import Image from "next/image"

// Force dynamic rendering since we use cookies and database
export const dynamic = "force-dynamic"

async function getDepartments() {
  if (!isDatabaseConfigured() || !sql) {
    // Return mock data for demo mode
    return [
      {
        id: 1,
        name: "Engineering",
        slug: "engineering",
        description: "Software development and technical innovation",
        role_count: 5,
        skill_count: 45,
      },
      {
        id: 2,
        name: "Product",
        slug: "product",
        description: "Product strategy and user experience",
        role_count: 4,
        skill_count: 32,
      },
      {
        id: 3,
        name: "Design",
        slug: "design",
        description: "User interface and experience design",
        role_count: 3,
        skill_count: 28,
      },
    ]
  }

  try {
    const departments = await sql`
    SELECT 
      d.id,
      d.name,
      d.slug,
      d.description,
      COUNT(DISTINCT jr.id) as role_count,
      COUNT(DISTINCT sm.id) as skill_count
    FROM departments d
    LEFT JOIN job_roles jr ON d.id = jr.department_id
    LEFT JOIN demonstration_job_roles djr ON jr.id = djr.job_role_id
    LEFT JOIN demonstration_templates dt ON djr.demonstration_template_id = dt.id
    LEFT JOIN skills_master sm ON dt.skill_master_id = sm.id
    GROUP BY d.id, d.name, d.slug, d.description
    ORDER BY d.name
  `

    return departments.map((dept: any) => ({
      ...dept,
      role_count: Number(dept.role_count),
      skill_count: Number(dept.skill_count),
    }))
  } catch (error) {
    console.error("Error fetching departments:", error)
    // Return mock data as fallback
    return [
      {
        id: 1,
        name: "Engineering",
        slug: "engineering",
        description: "Software development and technical innovation",
        role_count: 5,
        skill_count: 45,
      },
      {
        id: 2,
        name: "Product",
        slug: "product",
        description: "Product strategy and user experience",
        role_count: 4,
        skill_count: 32,
      },
      {
        id: 3,
        name: "Design",
        slug: "design",
        description: "User interface and experience design",
        role_count: 3,
        skill_count: 28,
      },
    ]
  }
}

export default async function Home() {
  let session = null
  let isAdmin = false

  try {
    session = await getSession()
    isAdmin = session?.user?.role === "admin"
  } catch (error) {
    console.error("Error getting session:", error)
    // Continue without session
  }

  const departments = await getDepartments()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-brand-800 px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/images/hs1-logo.png" alt="Henry Schein One" width={32} height={32} className="h-8 w-auto" />
              <Rocket className="w-4 h-4 text-white" />
              <span className="text-white text-sm">Career Matrix</span>
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

      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Henry Schein One Career Matrix</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Explore career paths, understand skill requirements, and plan your professional development journey with
              our comprehensive career framework.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/self-review"
                className="bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700 transition-colors flex items-center gap-2"
              >
                <Target className="w-5 h-5" />
                Start Self Assessment
              </Link>
              <Link
                href="/compare"
                className="bg-white text-brand-600 border border-brand-600 px-6 py-3 rounded-lg font-medium hover:bg-brand-50 transition-colors flex items-center gap-2"
              >
                <TrendingUp className="w-5 h-5" />
                Compare Roles
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore by Department</h2>
          <p className="text-lg text-gray-600">
            Browse career paths and skill requirements across different departments
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {departments.map((department) => (
            <Link
              key={department.id}
              href={`/department/${department.slug}`}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-6 group"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                  {department.name}
                </h3>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-brand-600 transition-colors" />
              </div>
              <p className="text-gray-600 mb-6">{department.description}</p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>{department.role_count} Roles</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <Target className="w-4 h-4" />
                  <span>{department.skill_count} Skills</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Career Development Tools</h2>
            <p className="text-lg text-gray-600">Everything you need to plan and track your career growth</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-brand-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-brand-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Self Assessment</h3>
              <p className="text-gray-600">
                Evaluate your current skills against role requirements and identify areas for development.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-brand-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-brand-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Role Comparison</h3>
              <p className="text-gray-600">
                Compare different roles to understand career progression paths and skill requirements.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-brand-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-brand-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Skills Matrix</h3>
              <p className="text-gray-600">
                Explore comprehensive skill frameworks for each department and role level.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
