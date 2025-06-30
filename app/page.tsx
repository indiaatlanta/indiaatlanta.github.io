import { requireAuth } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Users, Briefcase, Target, TrendingUp, BookOpen, Award, Building2, UserCheck, LogOut } from "lucide-react"

// Mock data for demo mode
const mockStats = {
  totalRoles: 45,
  totalSkills: 127,
  totalUsers: 8,
  departments: [
    {
      name: "Engineering",
      slug: "engineering",
      roleCount: 12,
      description: "Software development and technical roles",
    },
    { name: "Product", slug: "product", roleCount: 8, description: "Product management and strategy" },
    { name: "Design", slug: "design", roleCount: 6, description: "UX/UI design and research" },
    { name: "Marketing", slug: "marketing", roleCount: 7, description: "Marketing and growth" },
    { name: "Sales", slug: "sales", roleCount: 9, description: "Sales and business development" },
    { name: "Operations", slug: "operations", roleCount: 3, description: "Operations and support" },
  ],
}

async function getDashboardData() {
  if (!isDatabaseConfigured() || !sql) {
    return {
      stats: mockStats,
      isDemoMode: true,
    }
  }

  try {
    // Get role count
    const roleCount = await sql`SELECT COUNT(*) as count FROM job_roles`

    // Get skill count
    const skillCount = await sql`SELECT COUNT(*) as count FROM skills_master`

    // Get user count
    const userCount = await sql`SELECT COUNT(*) as count FROM users`

    // Get departments with role counts
    const departments = await sql`
      SELECT 
        d.name,
        d.slug,
        d.description,
        COUNT(jr.id) as role_count
      FROM departments d
      LEFT JOIN job_roles jr ON d.id = jr.department_id
      GROUP BY d.id, d.name, d.slug, d.description
      ORDER BY d.name
    `

    return {
      stats: {
        totalRoles: Number.parseInt(roleCount[0].count),
        totalSkills: Number.parseInt(skillCount[0].count),
        totalUsers: Number.parseInt(userCount[0].count),
        departments: departments.map((dept) => ({
          name: dept.name,
          slug: dept.slug,
          roleCount: Number.parseInt(dept.role_count),
          description: dept.description || `${dept.name} department roles and responsibilities`,
        })),
      },
      isDemoMode: false,
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return {
      stats: mockStats,
      isDemoMode: true,
    }
  }
}

export default async function HomePage() {
  const user = await requireAuth()
  const { stats, isDemoMode } = await getDashboardData()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img src="/images/hs1-logo.png" alt="Henry Schein One" className="h-8 w-auto" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Career Development Matrix</h1>
                {isDemoMode && (
                  <Badge variant="secondary" className="text-xs">
                    Demo Mode
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{user.name}</span>
              </div>
              {user.role === "admin" && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Admin Panel
                  </Button>
                </Link>
              )}
              <form action="/api/auth/logout" method="POST">
                <Button variant="ghost" size="sm" type="submit">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Your Career Development Hub</h2>
          <p className="text-gray-600">
            Explore career paths, assess your skills, and plan your professional growth within Henry Schein One.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRoles}</div>
              <p className="text-xs text-muted-foreground">Career opportunities available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skills Tracked</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSkills}</div>
              <p className="text-xs text-muted-foreground">Skills in our competency framework</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Team members using the platform</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Self Assessment
              </CardTitle>
              <CardDescription>Evaluate your current skills and identify areas for growth</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/self-review">
                <Button className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Start Assessment
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Role Comparison
              </CardTitle>
              <CardDescription>Compare different roles and their skill requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/compare">
                <Button className="w-full bg-transparent" variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Compare Roles
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Departments Grid */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Explore by Department</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.departments.map((dept) => (
              <Card key={dept.slug} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Building2 className="h-5 w-5 mr-2" />
                      {dept.name}
                    </span>
                    <Badge variant="secondary">{dept.roleCount} roles</Badge>
                  </CardTitle>
                  <CardDescription>{dept.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/department/${dept.slug}`}>
                    <Button variant="outline" className="w-full bg-transparent">
                      View Roles
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
