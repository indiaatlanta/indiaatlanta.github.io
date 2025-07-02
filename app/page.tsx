import { getCurrentUser } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import LoginButton from "@/components/login-button"
import AdminButton from "@/components/admin-button"
import { Users, Building2, Target, BarChart3, FileText, ArrowRight, TrendingUp, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"

interface Department {
  id: number
  name: string
  slug: string
  description: string
  job_role_count: number
}

interface Stats {
  totalUsers: number
  totalDepartments: number
  totalSkills: number
  totalRoles: number
}

async function getStats(): Promise<Stats> {
  if (!isDatabaseConfigured() || !sql) {
    return {
      totalUsers: 12,
      totalDepartments: 4,
      totalSkills: 45,
      totalRoles: 8,
    }
  }

  try {
    const [users, departments, skills, roles] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM users`,
      sql`SELECT COUNT(*) as count FROM departments`,
      sql`SELECT COUNT(*) as count FROM skills_master`,
      sql`SELECT COUNT(*) as count FROM job_roles`,
    ])

    return {
      totalUsers: Number(users[0]?.count || 0),
      totalDepartments: Number(departments[0]?.count || 0),
      totalSkills: Number(skills[0]?.count || 0),
      totalRoles: Number(roles[0]?.count || 0),
    }
  } catch (error) {
    console.error("Failed to fetch stats:", error)
    return {
      totalUsers: 0,
      totalDepartments: 0,
      totalSkills: 0,
      totalRoles: 0,
    }
  }
}

async function getDepartments(): Promise<Department[]> {
  if (!isDatabaseConfigured() || !sql) {
    return [
      {
        id: 1,
        name: "Engineering",
        slug: "engineering",
        description: "Software development and technical roles",
        job_role_count: 5,
      },
      { id: 2, name: "Product", slug: "product", description: "Product management and strategy", job_role_count: 3 },
      { id: 3, name: "Design", slug: "design", description: "User experience and visual design", job_role_count: 2 },
      {
        id: 4,
        name: "Marketing",
        slug: "marketing",
        description: "Marketing and growth initiatives",
        job_role_count: 4,
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
        COUNT(jr.id) as job_role_count
      FROM departments d
      LEFT JOIN job_roles jr ON d.id = jr.department_id
      GROUP BY d.id, d.name, d.slug, d.description
      ORDER BY d.name
    `

    return departments.map((dept) => ({
      ...dept,
      job_role_count: Number(dept.job_role_count),
    }))
  } catch (error) {
    console.error("Failed to fetch departments:", error)
    return []
  }
}

export default async function HomePage() {
  const user = await getCurrentUser()
  const [stats, departments] = await Promise.all([getStats(), getDepartments()])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/images/hs1-logo.png" alt="Henry Schein One" className="h-8 w-auto" />
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">HS1 Careers Matrix</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LoginButton user={user} />
              <AdminButton user={user} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to the HS1 Careers Matrix</h2>
          <p className="text-lg text-gray-600">
            Explore career paths, assess your skills, and plan your professional development journey.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Active platform users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDepartments}</div>
              <p className="text-xs text-muted-foreground">Career departments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skills</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSkills}</div>
              <p className="text-xs text-muted-foreground">Tracked skills</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Job Roles</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRoles}</div>
              <p className="text-xs text-muted-foreground">Available positions</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Target className="h-8 w-8 text-blue-600" />
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </div>
              <CardTitle>Self Assessment</CardTitle>
              <CardDescription>Evaluate your current skills and identify areas for growth</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/self-review">Start Assessment</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <BarChart3 className="h-8 w-8 text-green-600" />
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </div>
              <CardTitle>Compare Roles</CardTitle>
              <CardDescription>Compare your skills against different job roles and career paths</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/compare">Compare Skills</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <FileText className="h-8 w-8 text-purple-600" />
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </div>
              <CardTitle>Saved Assessments</CardTitle>
              <CardDescription>View and manage your completed skill assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/assessments">View Assessments</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Departments Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Explore Departments</h3>
            <Badge variant="secondary">{departments.length} departments</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {departments.map((department) => (
              <Card key={department.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      {department.name}
                    </CardTitle>
                    <Badge variant="outline">
                      {department.job_role_count} {department.job_role_count === 1 ? "role" : "roles"}
                    </Badge>
                  </div>
                  <CardDescription>{department.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href={`/department/${department.slug}`}>
                      View Skills Matrix
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Platform Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">Skill Assessment</h4>
                <p className="text-sm text-gray-600">
                  Comprehensive self-evaluation tools to assess your current skill levels
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <TrendingUp className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">Career Progression</h4>
                <p className="text-sm text-gray-600">Clear pathways and requirements for advancing in your career</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="h-6 w-6 text-purple-600 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">Progress Tracking</h4>
                <p className="text-sm text-gray-600">Monitor your skill development over time with saved assessments</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
