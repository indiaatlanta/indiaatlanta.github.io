import { getCurrentUser } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Target, BookOpen, Building2, User, Shield, LogOut, FileText } from 'lucide-react'
import Link from "next/link"
import { redirect } from "next/navigation"
import LoginButton from "@/components/login-button"

// Demo data for when database is not available
const demoStats = {
  totalRoles: 15,
  totalSkills: 45,
  totalUsers: 5,
  departments: [
    { name: "Engineering", slug: "engineering", roleCount: 5 },
    { name: "Product Management", slug: "product-management", roleCount: 3 },
    { name: "Sales", slug: "sales", roleCount: 4 },
    { name: "Marketing", slug: "marketing", roleCount: 3 },
  ],
}

async function getDashboardStats() {
  if (!isDatabaseConfigured() || !sql) {
    console.log("Database not configured, using demo stats")
    return demoStats
  }

  try {
    // Get total counts
    const [rolesResult, skillsResult, usersResult] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM job_roles`,
      sql`SELECT COUNT(*) as count FROM skills_master`,
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
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    // Fallback to demo data if database query fails
    return demoStats
  }
}

async function logoutAction() {
  "use server"

  const { cookies } = await import("next/headers")
  const cookieStore = await cookies()

  // Clear the session cookie
  cookieStore.delete("session")

  // Redirect to login page
  redirect("/login")
}

export default async function HomePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const stats = await getDashboardStats()
  const isDemoMode = !isDatabaseConfigured()

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
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isDemoMode && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Demo Mode
                </Badge>
              )}
              <div className="flex items-center space-x-2">
                {user.role === "admin" ? (
                  <Shield className="h-4 w-4 text-blue-600" />
                ) : (
                  <User className="h-4 w-4 text-gray-600" />
                )}
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
                <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
              </div>
              <LoginButton user={user} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h2>
          <p className="text-gray-600">
            Track your career development and explore growth opportunities within Henry Schein One.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Job Roles</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRoles}</div>
              <p className="text-xs text-muted-foreground">Across all departments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skills Tracked</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSkills}</div>
              <p className="text-xs text-muted-foreground">Available for assessment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Using the platform</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Self Assessment</CardTitle>
              <CardDescription>Evaluate your current skills and identify areas for growth</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/self-review">
                <Button className="w-full">
                  <User className="mr-2 h-4 w-4" />
                  Start Self Assessment
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compare Roles</CardTitle>
              <CardDescription>Compare your skills against different job roles and career paths</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/compare">
                <Button className="w-full bg-transparent" variant="outline">
                  <Target className="mr-2 h-4 w-4" />
                  Compare Roles
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saved Assessments</CardTitle>
              <CardDescription>View and manage your previously saved skill assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/assessments">
                <Button className="w-full bg-transparent" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  View Assessments
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Departments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2 h-5 w-5" />
              Browse by Department
            </CardTitle>
            <CardDescription>Explore career paths and roles within each department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.departments.map((dept) => (
                <Link key={dept.slug} href={`/department/${dept.slug}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm mb-2">{dept.name}</h3>
                      <p className="text-xs text-gray-600">
                        {dept.roleCount} {dept.roleCount === 1 ? "role" : "roles"}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Admin Panel Link */}
        {user.role === "admin" && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-blue-600">
                  <Shield className="mr-2 h-5 w-5" />
                  Admin Panel
                </CardTitle>
                <CardDescription>Manage users, roles, skills, and system configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin">
                  <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent">
                    <Shield className="mr-2 h-4 w-4" />
                    Access Admin Panel
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
