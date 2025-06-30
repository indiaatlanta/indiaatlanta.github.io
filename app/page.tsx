import { getSession } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Target, BookOpen, TrendingUp, LogOut, Settings } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

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
    const [rolesResult, skillsResult, usersResult] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM job_roles`,
      sql`SELECT COUNT(*) as count FROM skills_master`,
      sql`SELECT COUNT(*) as count FROM users`,
    ])

    return {
      totalRoles: Number(rolesResult[0].count),
      totalSkills: Number(skillsResult[0].count),
      totalUsers: Number(usersResult[0].count),
      isDemoMode: false,
    }
  } catch (error) {
    console.error("Error fetching stats:", error)
    return {
      totalRoles: 12,
      totalSkills: 45,
      totalUsers: 8,
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
        d.name,
        d.slug,
        COUNT(jr.id) as role_count
      FROM departments d
      LEFT JOIN job_roles jr ON d.id = jr.department_id
      GROUP BY d.id, d.name, d.slug
      ORDER BY d.name
    `

    return departments.map((dept) => ({
      name: dept.name,
      slug: dept.slug,
      role_count: Number(dept.role_count),
    }))
  } catch (error) {
    console.error("Error fetching departments:", error)
    return [
      { name: "Engineering", slug: "engineering", role_count: 4 },
      { name: "Product", slug: "product", role_count: 3 },
      { name: "Design", slug: "design", role_count: 2 },
      { name: "Marketing", slug: "marketing", role_count: 3 },
    ]
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
              <Image src="/images/hs1-logo.png" alt="Henry Schein One" width={32} height={32} className="h-8 w-8" />
              <h1 className="text-xl font-semibold text-gray-900">Career Development Matrix</h1>
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
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <form action="/api/auth/logout" method="POST">
                <Button variant="outline" size="sm" type="submit">
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
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore Your Career Development Path</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover role requirements, assess your skills, and plan your career progression with our comprehensive
            development matrix.
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
              <p className="text-xs text-muted-foreground">Team members enrolled</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Self Assessment
              </CardTitle>
              <CardDescription>
                Evaluate your current skills against role requirements and identify areas for growth.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/self-review">
                <Button className="w-full">Start Assessment</Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Role Comparison
              </CardTitle>
              <CardDescription>
                Compare different roles to understand career progression paths and skill requirements.
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
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Explore by Department</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map((department) => (
              <Link key={department.slug} href={`/department/${department.slug}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{department.name}</CardTitle>
                    <CardDescription>
                      {department.role_count} role{department.role_count !== 1 ? "s" : ""} available
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
