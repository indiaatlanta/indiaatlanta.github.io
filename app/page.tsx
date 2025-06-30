import { requireAuth } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Users, Target, BookOpen, Building2, LogOut, Settings } from "lucide-react"
import Image from "next/image"

// Mock data for demo mode
const mockDepartments = [
  {
    id: 1,
    name: "Engineering",
    slug: "engineering",
    description: "Software development and technical roles",
    role_count: 8,
  },
  { id: 2, name: "Product", slug: "product", description: "Product management and strategy", role_count: 5 },
  { id: 3, name: "Design", slug: "design", description: "User experience and visual design", role_count: 4 },
  { id: 4, name: "Marketing", slug: "marketing", description: "Marketing and growth", role_count: 6 },
  { id: 5, name: "Sales", slug: "sales", description: "Sales and business development", role_count: 7 },
  { id: 6, name: "Operations", slug: "operations", description: "Operations and support", role_count: 5 },
]

const mockStats = {
  totalRoles: 35,
  totalSkills: 120,
  totalUsers: 1,
}

async function getDashboardData() {
  if (!isDatabaseConfigured() || !sql) {
    return {
      departments: mockDepartments,
      stats: mockStats,
      isDemoMode: true,
    }
  }

  try {
    // Get departments with role counts
    const departments = await sql`
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
    `

    // Get stats
    const roleCount = await sql`SELECT COUNT(*) as count FROM job_roles`
    const skillCount = await sql`SELECT COUNT(*) as count FROM skills_master`
    const userCount = await sql`SELECT COUNT(*) as count FROM users`

    return {
      departments: departments.map((dept) => ({
        ...dept,
        role_count: Number(dept.role_count),
      })),
      stats: {
        totalRoles: Number(roleCount[0].count),
        totalSkills: Number(skillCount[0].count),
        totalUsers: Number(userCount[0].count),
      },
      isDemoMode: false,
    }
  } catch (error) {
    console.error("Database error, falling back to demo data:", error)
    return {
      departments: mockDepartments,
      stats: mockStats,
      isDemoMode: true,
    }
  }
}

export default async function HomePage() {
  const user = await requireAuth()
  const { departments, stats, isDemoMode } = await getDashboardData()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Image src="/images/hs1-logo.png" alt="Henry Schein One" width={40} height={40} className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Career Development Matrix</h1>
                <p className="text-sm text-gray-600">Welcome back, {user.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isDemoMode && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Demo Mode
                </Badge>
              )}
              {user.role === "admin" && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin Panel
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
            Discover roles, assess your skills, and plan your professional development journey with our comprehensive
            career matrix.
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
              <p className="text-xs text-muted-foreground">Using the platform</p>
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
              <CardTitle>Role Comparison</CardTitle>
              <CardDescription>Compare different roles and their skill requirements</CardDescription>
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
              <Link key={department.id} href={`/department/${department.slug}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <Building2 className="h-5 w-5 mr-2" />
                        {department.name}
                      </CardTitle>
                      <Badge variant="secondary">{department.role_count} roles</Badge>
                    </div>
                    <CardDescription>{department.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-lg p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Advance Your Career?</h3>
          <p className="text-gray-600 mb-6">
            Take control of your professional development with our comprehensive career planning tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/self-review">
              <Button size="lg">Start Your Assessment</Button>
            </Link>
            <Link href="/compare">
              <Button size="lg" variant="outline">
                Explore Roles
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
