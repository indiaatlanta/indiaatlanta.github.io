import { requireAuth } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Building2, BookOpen, TrendingUp, LogOut, Settings } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

async function getDashboardData() {
  if (!isDatabaseConfigured() || !sql) {
    // Return mock data for demo mode
    return {
      departments: [
        {
          id: 1,
          name: "Engineering",
          slug: "engineering",
          description: "Software development and technical roles",
          role_count: 8,
          skill_count: 45,
        },
        {
          id: 2,
          name: "Product",
          slug: "product",
          description: "Product management and strategy",
          role_count: 5,
          skill_count: 32,
        },
        {
          id: 3,
          name: "Design",
          slug: "design",
          description: "User experience and visual design",
          role_count: 4,
          skill_count: 28,
        },
        {
          id: 4,
          name: "Marketing",
          slug: "marketing",
          description: "Marketing and growth",
          role_count: 6,
          skill_count: 35,
        },
      ],
      totalRoles: 23,
      totalSkills: 140,
      totalUsers: 156,
      isDemoMode: true,
    }
  }

  try {
    // Get departments with role and skill counts
    const departments = await sql`
      SELECT 
        d.id,
        d.name,
        d.slug,
        d.description,
        COUNT(DISTINCT jr.id) as role_count,
        COUNT(DISTINCT COALESCE(sd.id, s.id)) as skill_count
      FROM departments d
      LEFT JOIN job_roles jr ON d.id = jr.department_id
      LEFT JOIN skill_demonstrations sd ON jr.id = sd.job_role_id
      LEFT JOIN skills s ON jr.id = s.job_role_id
      GROUP BY d.id, d.name, d.slug, d.description
      ORDER BY d.name
    `

    // Get total counts
    const totalRoles = await sql`SELECT COUNT(*) as count FROM job_roles`
    const totalSkills = await sql`
      SELECT COUNT(DISTINCT COALESCE(sd.skill_master_id, s.id)) as count 
      FROM skill_demonstrations sd 
      FULL OUTER JOIN skills s ON 1=1
    `
    const totalUsers = await sql`SELECT COUNT(*) as count FROM users WHERE active = true`

    return {
      departments,
      totalRoles: totalRoles[0]?.count || 0,
      totalSkills: totalSkills[0]?.count || 0,
      totalUsers: totalUsers[0]?.count || 0,
      isDemoMode: false,
    }
  } catch (error) {
    console.error("Dashboard data error:", error)
    // Fallback to demo data
    return {
      departments: [
        {
          id: 1,
          name: "Engineering",
          slug: "engineering",
          description: "Software development and technical roles",
          role_count: 8,
          skill_count: 45,
        },
        {
          id: 2,
          name: "Product",
          slug: "product",
          description: "Product management and strategy",
          role_count: 5,
          skill_count: 32,
        },
        {
          id: 3,
          name: "Design",
          slug: "design",
          description: "User experience and visual design",
          role_count: 4,
          skill_count: 28,
        },
        {
          id: 4,
          name: "Marketing",
          slug: "marketing",
          description: "Marketing and growth",
          role_count: 6,
          skill_count: 35,
        },
      ],
      totalRoles: 23,
      totalSkills: 140,
      totalUsers: 156,
      isDemoMode: true,
    }
  }
}

export default async function HomePage() {
  const user = await requireAuth()
  const { departments, totalRoles, totalSkills, totalUsers, isDemoMode } = await getDashboardData()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Image src="/images/hs1-logo.png" alt="Henry Schein One" width={32} height={32} className="h-8 w-auto" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Career Development Matrix</h1>
                {isDemoMode && (
                  <Badge variant="secondary" className="ml-2">
                    Demo Mode
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              {user.role === "admin" && (
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore Your Career Path</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover role requirements, assess your skills, and plan your professional development journey with our
            comprehensive career matrix.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRoles}</div>
              <p className="text-xs text-muted-foreground">Across all departments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skills Tracked</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSkills}</div>
              <p className="text-xs text-muted-foreground">Unique skills and competencies</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">Team members using the platform</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Self Assessment</CardTitle>
              <CardDescription>Evaluate your current skills and identify areas for growth</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/self-review">
                <Button className="w-full">Start Assessment</Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Compare Roles</CardTitle>
              <CardDescription>Compare skill requirements between different positions</CardDescription>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((department) => (
              <Card key={department.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                      {department.name}
                    </CardTitle>
                  </div>
                  <CardDescription>{department.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm text-gray-600 mb-4">
                    <span>{department.role_count} roles</span>
                    <span>{department.skill_count} skills</span>
                  </div>
                  <Link href={`/department/${department.slug}`}>
                    <Button className="w-full bg-transparent" variant="outline">
                      Explore Department
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
