import { Suspense } from "react"
import { getSession } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Target, BookOpen, TrendingUp, LogOut, Settings, Building2 } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

async function getDashboardStats() {
  if (!isDatabaseConfigured() || !sql) {
    // Return mock data for demo mode
    return {
      totalRoles: 12,
      totalSkills: 45,
      totalUsers: 5,
      departments: [
        { name: "Engineering", slug: "engineering", roleCount: 4 },
        { name: "Product", slug: "product", roleCount: 3 },
        { name: "Design", slug: "design", roleCount: 2 },
        { name: "Marketing", slug: "marketing", roleCount: 3 },
      ],
      isDemoMode: true,
    }
  }

  try {
    // Get total counts - fixed the column name issue
    const [rolesResult, skillsResult, usersResult] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM job_roles`,
      sql`SELECT COUNT(*) as count FROM skills_master`, // Fixed: removed DISTINCT skill_name
      sql`SELECT COUNT(*) as count FROM users`,
    ])

    // Get departments with role counts
    const departmentsResult = await sql`
      SELECT 
        d.name,
        d.slug,
        COUNT(jr.id) as role_count
      FROM departments d
      LEFT JOIN job_roles jr ON d.id = jr.department_id
      GROUP BY d.id, d.name, d.slug
      ORDER BY d.name
    `

    return {
      totalRoles: Number.parseInt(rolesResult[0].count),
      totalSkills: Number.parseInt(skillsResult[0].count),
      totalUsers: Number.parseInt(usersResult[0].count),
      departments: departmentsResult.map((dept: any) => ({
        name: dept.name,
        slug: dept.slug,
        roleCount: Number.parseInt(dept.role_count),
      })),
      isDemoMode: false,
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    // Return mock data on error
    return {
      totalRoles: 12,
      totalSkills: 45,
      totalUsers: 5,
      departments: [
        { name: "Engineering", slug: "engineering", roleCount: 4 },
        { name: "Product", slug: "product", roleCount: 3 },
        { name: "Design", slug: "design", roleCount: 2 },
        { name: "Marketing", slug: "marketing", roleCount: 3 },
      ],
      isDemoMode: true,
    }
  }
}

async function LogoutButton() {
  async function handleLogout() {
    "use server"
    const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/logout`, {
      method: "POST",
    })
    redirect("/login")
  }

  return (
    <form action={handleLogout}>
      <Button variant="outline" size="sm" type="submit">
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </form>
  )
}

export default async function HomePage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const stats = await getDashboardStats()

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
                {stats.isDemoMode && (
                  <Badge variant="secondary" className="text-xs">
                    Demo Mode
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{session.user.name}</span>
              </div>
              {session.user.role === "admin" && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin Panel
                  </Button>
                </Link>
              )}
              <Suspense
                fallback={
                  <Button variant="outline" size="sm" disabled>
                    Logout
                  </Button>
                }
              >
                <LogoutButton />
              </Suspense>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Accelerate Your Career Development</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore career paths, assess your skills, and compare roles to find your next opportunity within Henry
            Schein One.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRoles}</div>
              <p className="text-xs text-muted-foreground">Career opportunities available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skills Tracked</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSkills}</div>
              <p className="text-xs text-muted-foreground">Skills in our matrix</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Team members using the matrix</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Self Assessment
              </CardTitle>
              <CardDescription>
                Evaluate your current skills and identify areas for growth based on your target role.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/self-review">
                <Button className="w-full">Start Assessment</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-green-600" />
                Role Comparison
              </CardTitle>
              <CardDescription>
                Compare different roles to understand skill requirements and career progression paths.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/compare">
                <Button className="w-full bg-transparent" variant="outline">
                  Compare Roles
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Departments Grid */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Explore by Department</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.departments.map((department) => (
              <Link key={department.slug} href={`/department/${department.slug}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building2 className="h-5 w-5 mr-2" />
                      {department.name}
                    </CardTitle>
                    <CardDescription>
                      {department.roleCount} role{department.roleCount !== 1 ? "s" : ""} available
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="w-full justify-start p-0">
                      Explore Roles →
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Advance Your Career?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Take control of your professional development. Start with a self-assessment to understand where you stand
            and where you want to go.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/self-review">
              <Button size="lg">Begin Self Assessment</Button>
            </Link>
            <Link href="/compare">
              <Button size="lg" variant="outline">
                Explore Career Paths
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
