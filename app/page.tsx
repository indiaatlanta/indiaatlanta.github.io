import { getSession } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Users, Building2, Target, TrendingUp, BookOpen, Award, BarChart3, UserCheck, LogOut } from "lucide-react"

async function getStats() {
  if (!isDatabaseConfigured() || !sql) {
    return {
      totalRoles: 12,
      totalSkills: 45,
      totalUsers: 8,
      isDemoMode: true,
    }
  }

  try {
    const [roles, skills, users] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM job_roles`,
      sql`SELECT COUNT(*) as count FROM skills_master`,
      sql`SELECT COUNT(*) as count FROM users`,
    ])

    return {
      totalRoles: Number(roles[0]?.count || 0),
      totalSkills: Number(skills[0]?.count || 0),
      totalUsers: Number(users[0]?.count || 0),
      isDemoMode: false,
    }
  } catch (error) {
    console.error("Error fetching stats:", error)
    return {
      totalRoles: 0,
      totalSkills: 0,
      totalUsers: 0,
      isDemoMode: true,
    }
  }
}

async function getDepartments() {
  if (!isDatabaseConfigured() || !sql) {
    return [
      { name: "Engineering", slug: "engineering", role_count: 4 },
      { name: "Product", slug: "product", role_count: 3 },
      { name: "Design", slug: "design", role_count: 2 },
      { name: "Marketing", slug: "marketing", role_count: 3 },
    ]
  }

  try {
    const departments = await sql`
      SELECT 
        department as name,
        LOWER(REPLACE(department, ' ', '-')) as slug,
        COUNT(*) as role_count
      FROM job_roles 
      GROUP BY department 
      ORDER BY department
    `
    return departments
  } catch (error) {
    console.error("Error fetching departments:", error)
    return []
  }
}

export default async function HomePage() {
  const session = await getSession()
  const stats = await getStats()
  const departments = await getDepartments()

  if (!session) {
    return null // This should be handled by middleware
  }

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
              {stats.isDemoMode && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Demo Mode
                </Badge>
              )}
              <span className="text-sm text-gray-600">Welcome, {session.user.name}</span>
              {session.user.role === "admin" && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    Admin Panel
                  </Button>
                </Link>
              )}
              <form action="/api/auth/logout" method="post">
                <Button variant="ghost" size="sm" type="submit">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Accelerate Your Career Growth</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore career paths, assess your skills, and identify development opportunities across Henry Schein One.
            Take control of your professional journey.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRoles}</div>
              <p className="text-xs text-muted-foreground">Across all departments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skills Tracked</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSkills}</div>
              <p className="text-xs text-muted-foreground">Technical and soft skills</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="h-5 w-5 mr-2 text-blue-600" />
                Self Assessment
              </CardTitle>
              <CardDescription>
                Evaluate your current skills against role requirements and identify growth areas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/self-review">
                <Button className="w-full">
                  Start Assessment
                  <TrendingUp className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                Role Comparison
              </CardTitle>
              <CardDescription>
                Compare different roles to understand career progression paths and requirements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/compare">
                <Button className="w-full bg-transparent" variant="outline">
                  Compare Roles
                  <Award className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Departments Grid */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Explore by Department</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map((dept) => (
              <Link key={dept.slug} href={`/department/${dept.slug}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{dept.name}</span>
                      <Building2 className="h-5 w-5 text-gray-400" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{dept.role_count} roles</span>
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="text-center py-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Take the Next Step?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Whether you're looking to advance in your current role or explore new opportunities, our career matrix
              provides the insights you need to make informed decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/self-review">
                <Button size="lg">
                  Start Your Assessment
                  <TrendingUp className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/compare">
                <Button size="lg" variant="outline">
                  Explore Roles
                  <BookOpen className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
