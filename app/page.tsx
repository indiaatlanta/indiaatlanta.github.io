import { getCurrentUser } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import LoginButton from "@/components/login-button"
import { AdminButton } from "@/components/admin-button"
import {
  Users,
  Building2,
  Target,
  TrendingUp,
  FileText,
  UserCheck,
  ArrowRight,
  BarChart3,
  BookOpen,
} from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalUsers: number
  totalDepartments: number
  totalSkills: number
  totalRoles: number
}

async function getDashboardStats(): Promise<DashboardStats> {
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
      totalUsers: Number.parseInt(users[0]?.count || "0"),
      totalDepartments: Number.parseInt(departments[0]?.count || "0"),
      totalSkills: Number.parseInt(skills[0]?.count || "0"),
      totalRoles: Number.parseInt(roles[0]?.count || "0"),
    }
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error)
    return {
      totalUsers: 0,
      totalDepartments: 0,
      totalSkills: 0,
      totalRoles: 0,
    }
  }
}

async function getDepartments() {
  if (!isDatabaseConfigured() || !sql) {
    return [
      { id: 1, name: "Engineering", slug: "engineering", description: "Software development and technical roles" },
      { id: 2, name: "Product", slug: "product", description: "Product management and strategy" },
      { id: 3, name: "Design", slug: "design", description: "User experience and visual design" },
      { id: 4, name: "Marketing", slug: "marketing", description: "Marketing and growth initiatives" },
    ]
  }

  try {
    const departments = await sql`
      SELECT id, name, slug, description 
      FROM departments 
      ORDER BY name
    `
    return departments
  } catch (error) {
    console.error("Failed to fetch departments:", error)
    return []
  }
}

export default async function HomePage() {
  const user = await getCurrentUser()
  const stats = await getDashboardStats()
  const departments = await getDepartments()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img className="h-8 w-auto" src="/images/hs1-logo.png" alt="Henry Schein One" />
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">HS1 Careers Matrix</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <AdminButton />
              <LoginButton user={user} />
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

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDepartments}</div>
              <p className="text-xs text-muted-foreground">active departments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skills</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSkills}</div>
              <p className="text-xs text-muted-foreground">tracked skills</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Job Roles</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRoles}</div>
              <p className="text-xs text-muted-foreground">available roles</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/self-review">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                  Self Assessment
                </CardTitle>
                <CardDescription>Evaluate your current skills and identify areas for growth</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  Start Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/compare">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Compare Roles
                </CardTitle>
                <CardDescription>Compare your skills against different job roles and career paths</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full bg-transparent">
                  Compare Skills
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/assessments">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Saved Assessments
                </CardTitle>
                <CardDescription>View and manage your completed skill assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full bg-transparent">
                  View Assessments
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Departments */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Explore Departments</h3>
            <Badge variant="secondary">{departments.length} departments</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {departments.map((department) => (
              <Card key={department.id} className="hover:shadow-lg transition-shadow">
                <Link href={`/department/${department.slug}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      {department.name}
                    </CardTitle>
                    <CardDescription>{department.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="w-full justify-between">
                      Explore Career Paths
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
