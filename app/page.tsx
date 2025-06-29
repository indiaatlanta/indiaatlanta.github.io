import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Target, BarChart3, ArrowRight, Building2, Briefcase } from "lucide-react"
import { neon } from "@neondatabase/serverless"

interface Department {
  id: number
  name: string
  description: string
  color: string
  role_count: number
  skill_count: number
}

async function getDepartments(): Promise<Department[]> {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    const departments = await sql`
      SELECT 
        d.id,
        d.name,
        d.description,
        d.color,
        COUNT(DISTINCT jr.id) as role_count,
        COUNT(DISTINCT dt.skill_master_id) as skill_count
      FROM departments d
      LEFT JOIN job_roles jr ON d.id = jr.department_id
      LEFT JOIN demonstration_job_roles djr ON jr.id = djr.job_role_id
      LEFT JOIN demonstration_templates dt ON djr.demonstration_template_id = dt.id
      GROUP BY d.id, d.name, d.description, d.color
      ORDER BY d.sort_order, d.name
    `

    return departments.map((dept) => ({
      id: dept.id,
      name: dept.name,
      description: dept.description || "",
      color: dept.color || "blue",
      role_count: Number(dept.role_count) || 0,
      skill_count: Number(dept.skill_count) || 0,
    }))
  } catch (error) {
    console.error("Error fetching departments:", error)
    // Return fallback data
    return [
      {
        id: 1,
        name: "Engineering",
        description: "Software development and technical roles",
        color: "blue",
        role_count: 5,
        skill_count: 12,
      },
      {
        id: 2,
        name: "Product",
        description: "Product management and strategy roles",
        color: "green",
        role_count: 3,
        skill_count: 8,
      },
      {
        id: 3,
        name: "Design",
        description: "User experience and visual design roles",
        color: "purple",
        role_count: 4,
        skill_count: 10,
      },
    ]
  }
}

export default async function Home() {
  const departments = await getDepartments()

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-50 text-blue-700 border-blue-200",
      green: "bg-green-50 text-green-700 border-green-200",
      purple: "bg-purple-50 text-purple-700 border-purple-200",
      indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
      orange: "bg-orange-50 text-orange-700 border-orange-200",
      red: "bg-red-50 text-red-700 border-red-200",
    }
    return colorMap[color] || "bg-gray-50 text-gray-700 border-gray-200"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-brand-800 px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Image src="/images/hs1-logo.png" alt="Henry Schein One" width={48} height={48} className="h-12 w-auto" />
            <div>
              <h1 className="text-2xl font-bold text-white">Career Matrix</h1>
              <p className="text-brand-100">Professional Development Framework</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-brand-200" />
              <div>
                <div className="font-semibold">Skills-Based Growth</div>
                <div className="text-sm text-brand-200">Clear development paths</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-brand-200" />
              <div>
                <div className="font-semibold">Self Assessment</div>
                <div className="text-sm text-brand-200">Track your progress</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-brand-200" />
              <div>
                <div className="font-semibold">Role Comparison</div>
                <div className="text-sm text-brand-200">Explore career options</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Self Assessment
              </CardTitle>
              <CardDescription>
                Evaluate your current skills against specific role requirements and identify development opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/self-review">
                <Button className="w-full">
                  Start Self Assessment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                Compare Roles
              </CardTitle>
              <CardDescription>
                Compare skills and requirements between different roles to plan your career progression.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/compare">
                <Button variant="outline" className="w-full bg-transparent">
                  Compare Roles
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Departments */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Explore by Department</h2>
          <p className="text-gray-600 mb-6">
            Browse roles and skills organized by department to understand career paths and requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department) => (
            <Link key={department.id} href={`/department/${department.name.toLowerCase()}`}>
              <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      {department.name}
                    </CardTitle>
                    <Badge className={getColorClasses(department.color)}>{department.role_count} roles</Badge>
                  </div>
                  <CardDescription className="min-h-[3rem]">{department.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{department.role_count} Roles</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      <span>{department.skill_count} Skills</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-brand-600 text-sm font-medium">
                    Explore Department
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="text-center text-gray-500 text-sm">
            <p className="mb-2">Henry Schein One Career Development Framework</p>
            <p>Empowering professional growth through skills-based career planning</p>
          </div>
        </div>
      </div>
    </div>
  )
}
