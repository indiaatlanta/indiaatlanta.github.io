import { getCurrentUser } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"
import LoginButton from "@/components/login-button"
import { AdminButton } from "@/components/admin-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, Target, FileText, BarChart3, Settings, BookOpen } from "lucide-react"
import Link from "next/link"

async function getDashboardData() {
  if (!isDatabaseConfigured() || !sql) {
    return {
      departments: [
        {
          id: 1,
          name: "Engineering",
          slug: "engineering",
          description: "Software development and technical roles",
          role_count: 5,
        },
        { id: 2, name: "Product", slug: "product", description: "Product management and design", role_count: 3 },
        { id: 3, name: "Marketing", slug: "marketing", description: "Marketing and growth", role_count: 4 },
      ],
      totalRoles: 12,
      totalSkills: 45,
      isDemoMode: true,
    }
  }

  try {
    const [departments, roleCount, skillCount] = await Promise.all([
      sql`
        SELECT 
          d.id,
          d.name,
          d.slug,
          d.description,
          COUNT(jr.id) as role_count
        FROM departments d
        LEFT JOIN job_roles jr ON d.id = jr.department_id
        GROUP BY d.id, d.name, d.slug, d.description
        ORDER BY d.name
      `,
      sql`SELECT COUNT(*) as count FROM job_roles`,
      sql`SELECT COUNT(*) as count FROM skills_master`,
    ])

    return {
      departments,
      totalRoles: roleCount[0]?.count || 0,
      totalSkills: skillCount[0]?.count || 0,
      isDemoMode: false,
    }
  } catch (error) {
    console.error("Dashboard data error:", error)
    return {
      departments: [],
      totalRoles: 0,
      totalSkills: 0,
      isDemoMode: false,
    }
  }
}

export default async function HomePage() {
  const user = await getCurrentUser()
  const { departments, totalRoles, totalSkills, isDemoMode } = await getDashboardData()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img src="/images/hs1-logo.png" alt="Henry Schein One" className="h-8 w-auto" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">HS1 Careers Matrix</h1>
                  <p className="text-sm text-gray-500">Skills Assessment & Career Development</p>
                </div>
              </div>
              {isDemoMode && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  Demo Mode
                </Badge>
              )}
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
          <p className="text-lg text-gray-600 max-w-3xl">
            Explore career paths, assess your skills, and plan your professional development journey within Henry Schein
            One. Discover opportunities across departments and understand the skills needed for your next role.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departments.length}</div>
              <p className="text-xs text-muted-foreground">Active departments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Job Roles</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRoles}</div>
              <p className="text-xs text-muted-foreground">Available positions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skills</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSkills}</div>
              <p className="text-xs text-muted-foreground">Tracked competencies</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <Link href="/self-review">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-base">Self Assessment</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>Evaluate your current skills and identify areas for growth</CardDescription>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <Link href="/compare">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-base">Compare Roles</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>Compare your skills against different job roles</CardDescription>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <Link href="/assessments">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-base">Saved Assessments</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>View and manage your saved skill assessments</CardDescription>
                </CardContent>
              </Link>
            </Card>

            {user?.role === "admin" && (
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <Link href="/admin">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <Settings className="h-5 w-5 text-red-600" />
                      <CardTitle className="text-base">Admin Panel</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>Manage users, skills, and job roles</CardDescription>
                  </CardContent>
                </Link>
              </Card>
            )}
          </div>
        </div>

        {/* Departments */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Explore Departments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((department) => (
              <Card key={department.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{department.name}</CardTitle>
                    <Badge variant="secondary">
                      {department.role_count} {department.role_count === 1 ? "role" : "roles"}
                    </Badge>
                  </div>
                  <CardDescription>{department.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/department/${department.slug}`}>
                    <Button className="w-full">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Explore Department
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {departments.length === 0 && !isDemoMode && (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No departments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first department in the admin panel.
            </p>
            {user?.role === "admin" && (
              <div className="mt-6">
                <Link href="/admin">
                  <Button>
                    <Settings className="w-4 h-4 mr-2" />
                    Go to Admin Panel
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
