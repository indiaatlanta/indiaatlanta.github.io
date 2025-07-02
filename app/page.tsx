import { getCurrentUser } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"
import LoginButton from "@/components/login-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Building2, Target, BarChart3, FileText, Settings, BookOpen, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"

async function getDashboardData() {
  if (!isDatabaseConfigured() || !sql) {
    return {
      departments: [],
      totalUsers: 0,
      totalRoles: 0,
      totalSkills: 0,
      recentActivity: [],
    }
  }

  try {
    const [departments, users, roles, skills] = await Promise.all([
      sql`SELECT id, name, slug, description FROM departments ORDER BY name`,
      sql`SELECT COUNT(*) as count FROM users`,
      sql`SELECT COUNT(*) as count FROM job_roles`,
      sql`SELECT COUNT(*) as count FROM skills_master`,
    ])

    return {
      departments: departments || [],
      totalUsers: users[0]?.count || 0,
      totalRoles: roles[0]?.count || 0,
      totalSkills: skills[0]?.count || 0,
      recentActivity: [],
    }
  } catch (error) {
    console.error("Dashboard data error:", error)
    return {
      departments: [],
      totalUsers: 0,
      totalRoles: 0,
      totalSkills: 0,
      recentActivity: [],
    }
  }
}

export default async function HomePage() {
  const user = await getCurrentUser()
  const dashboardData = await getDashboardData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
              <LoginButton user={user} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome{user ? `, ${user.name}` : " to HS1 Careers Matrix"}
          </h2>
          <p className="text-lg text-gray-600">
            Explore career paths, assess your skills, and plan your professional development journey.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/self-review">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                  Self Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Evaluate your current skills and identify areas for growth</CardDescription>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/compare">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                  Compare Roles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Compare your skills against different job roles and career paths</CardDescription>
              </CardContent>
            </Link>
          </Card>

          {user && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/assessments">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <FileText className="w-5 h-5 mr-2 text-purple-600" />
                    Saved Assessments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>View and manage your completed skill assessments</CardDescription>
                </CardContent>
              </Link>
            </Card>
          )}

          {user?.role === "admin" && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/admin">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <Settings className="w-5 h-5 mr-2 text-red-600" />
                    Admin Panel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Manage users, skills, and system configuration</CardDescription>
                </CardContent>
              </Link>
            </Card>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.totalUsers}</div>
              <p className="text-xs text-muted-foreground">registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Job Roles</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.totalRoles}</div>
              <p className="text-xs text-muted-foreground">available positions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skills</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.totalSkills}</div>
              <p className="text-xs text-muted-foreground">tracked skills</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.departments.length}</div>
              <p className="text-xs text-muted-foreground">active departments</p>
            </CardContent>
          </Card>
        </div>

        {/* Departments Grid */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Explore Departments</h3>
          {dashboardData.departments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardData.departments.map((department) => (
                <Card key={department.id} className="hover:shadow-lg transition-shadow">
                  <Link href={`/department/${department.slug}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                        {department.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{department.description || "Explore career opportunities"}</CardDescription>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Departments Available</h3>
                <p className="text-gray-600">Departments will appear here once they are configured.</p>
                {user?.role === "admin" && (
                  <Button asChild className="mt-4">
                    <Link href="/admin">Configure Departments</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Getting Started */}
        {!user && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-xl text-blue-900">Get Started</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-800 mb-4">
                Sign in to access personalized features like skill assessments, progress tracking, and career planning
                tools.
              </p>
              <Button asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img className="h-6 w-auto" src="/images/hs1-logo.png" alt="Henry Schein One" />
              <span className="ml-2 text-sm text-gray-600">© 2024 Henry Schein One. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Last updated: {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
