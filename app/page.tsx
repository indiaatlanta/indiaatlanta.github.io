import { Suspense } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Target, Building2, ArrowRight, BookOpen, UserCheck, GitCompare } from "lucide-react"
import { sql } from "@vercel/postgres"

interface Department {
  id: number
  name: string
  slug: string
  description: string
  role_count: number
  skill_count: number
}

async function getDepartments(): Promise<{ departments: Department[]; isDemoMode: boolean }> {
  try {
    const result = await sql`
      SELECT 
        d.id,
        d.name,
        d.slug,
        d.description,
        COUNT(DISTINCT jr.id) as role_count,
        COUNT(DISTINCT dt.skill_master_id) as skill_count
      FROM departments d
      LEFT JOIN job_roles jr ON d.id = jr.department_id
      LEFT JOIN demonstration_job_roles djr ON jr.id = djr.job_role_id
      LEFT JOIN demonstration_templates dt ON djr.demonstration_template_id = dt.id
      GROUP BY d.id, d.name, d.slug, d.description
      ORDER BY d.name
    `

    const departments = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      role_count: Number.parseInt(row.role_count) || 0,
      skill_count: Number.parseInt(row.skill_count) || 0,
    }))

    return { departments, isDemoMode: false }
  } catch (error) {
    console.error("Error fetching departments:", error)

    // Fallback to mock data
    const mockDepartments: Department[] = [
      {
        id: 1,
        name: "Engineering",
        slug: "engineering",
        description: "Software development, DevOps, and technical architecture roles",
        role_count: 8,
        skill_count: 25,
      },
      {
        id: 2,
        name: "Product",
        slug: "product",
        description: "Product management, design, and user experience roles",
        role_count: 5,
        skill_count: 18,
      },
      {
        id: 3,
        name: "Sales",
        slug: "sales",
        description: "Sales, business development, and customer success roles",
        role_count: 6,
        skill_count: 15,
      },
      {
        id: 4,
        name: "Marketing",
        slug: "marketing",
        description: "Digital marketing, content, and brand management roles",
        role_count: 4,
        skill_count: 12,
      },
    ]

    return { departments: mockDepartments, isDemoMode: true }
  }
}

export default async function Home() {
  const { departments, isDemoMode } = await getDepartments()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Henry Schein One</span>{" "}
                  <span className="block text-blue-600 xl:inline">Careers Matrix</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Explore career paths, understand role requirements, and develop the skills needed to advance your
                  career at Henry Schein One.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      href="/self-review"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                    >
                      Start Self Assessment
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      href="/compare"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10"
                    >
                      Compare Roles
                      <GitCompare className="ml-2 w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-gradient-to-r from-blue-500 to-indigo-600 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
            <div className="text-center text-white">
              <Building2 className="w-24 h-24 mx-auto mb-4 opacity-80" />
              <h2 className="text-2xl font-bold mb-2">Build Your Career</h2>
              <p className="text-lg opacity-90">Discover opportunities and grow with us</p>
            </div>
          </div>
        </div>
      </div>

      {/* Database Status Banner */}
      {isDemoMode && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-center">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-blue-800 text-sm font-medium">Demo Mode</span>
                <span className="text-blue-700 text-sm ml-2">
                  - Database connection unavailable, showing sample data
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Career Development</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to grow your career
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our comprehensive career matrix helps you understand role requirements, assess your skills, and plan your
              professional development.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <UserCheck className="w-6 h-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Self Assessment</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Evaluate your current skills against role requirements and identify areas for development.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <GitCompare className="w-6 h-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Role Comparison</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Compare different roles to understand career progression paths and skill requirements.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <BookOpen className="w-6 h-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Skills Matrix</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Explore comprehensive skills matrices for each department and understand what's needed to excel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Departments Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Departments</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Explore Career Opportunities
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Discover roles and career paths across different departments at Henry Schein One.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            }
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {departments.map((department) => (
                <Card key={department.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{department.name}</span>
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </CardTitle>
                    <CardDescription>{department.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 text-gray-500 mr-1" />
                          <span className="text-sm text-gray-600">{department.role_count} Roles</span>
                        </div>
                        <div className="flex items-center">
                          <Target className="w-4 h-4 text-gray-500 mr-1" />
                          <span className="text-sm text-gray-600">{department.skill_count} Skills</span>
                        </div>
                      </div>
                    </div>
                    <Link href={`/department/${department.slug}`}>
                      <Button className="w-full bg-transparent" variant="outline">
                        Explore Department
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Suspense>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to advance your career?</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-blue-200">
            Start by assessing your current skills or exploring different career paths within Henry Schein One.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/self-review"
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
            >
              Start Self Assessment
            </Link>
            <Link
              href="/compare"
              className="inline-flex items-center justify-center px-5 py-3 border border-white text-base font-medium rounded-md text-white bg-transparent hover:bg-blue-700"
            >
              Compare Roles
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
