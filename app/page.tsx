import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Target, BookOpen, Building2, User, LogOut } from "lucide-react"
import { AdminButton } from "@/components/admin-button"

// Mock data for demo mode
const mockStats = {
  totalRoles: 5,
  totalSkills: 45,
  totalUsers: 12,
}

const mockDepartments = [
  { slug: "engineering", name: "Engineering", description: "Software development roles", roleCount: 5 },
  { slug: "product", name: "Product", description: "Product management roles", roleCount: 3 },
  { slug: "design", name: "Design", description: "UX/UI design roles", roleCount: 2 },
  { slug: "data", name: "Data", description: "Data science and analytics", roleCount: 2 },
]

async function getDashboardStats() {
  if (!isDatabaseConfigured()) {
    console.log("Database not configured, using mock data")
    return mockStats
  }

  try {
    const [rolesResult, skillsResult, usersResult] = await Promise.all([
      sql!`SELECT COUNT(*) as count FROM job_roles`,
      sql!`SELECT COUNT(DISTINCT sm.id) as count FROM skills_master sm`,
      sql!`SELECT COUNT(*) as count FROM users`,
    ])

    return {
      totalRoles: Number.parseInt(rolesResult[0].count),
      totalSkills: Number.parseInt(skillsResult[0].count),
      totalUsers: Number.parseInt(usersResult[0].count),
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return mockStats
  }
}

async function getDepartments() {
  if (!isDatabaseConfigured()) {
    console.log("Database not configured, using mock departments")
    return mockDepartments
  }

  try {
    const departments = await sql!`
      SELECT 
        d.slug,
        d.name,
        d.description,
        COUNT(jr.id) as role_count
      FROM departments d
      LEFT JOIN job_roles jr ON d.id = jr.department_id
      GROUP BY d.id, d.slug, d.name, d.description
      ORDER BY d.name
    `

    return departments.map((dept) => ({
      slug: dept.slug,
      name: dept.name,
      description: dept.description,
      roleCount: Number.parseInt(dept.role_count),
    }))
  } catch (error) {
    console.error("Error fetching departments:", error)
    return mockDepartments
  }
}

async function logoutAction() {
  "use server"

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/auth/logout`, {
      method: "POST",
    })

    if (response.ok) {
      redirect("/login")
    }
  } catch (error) {
    console.error("Logout error:", error)
  }

  redirect("/login")
}

export default async function HomePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const [stats, departments] = await Promise.all([getDashboardStats(), getDepartments()])

  const isDemoMode = !isDatabaseConfigured()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-brand-800 px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/images/hs1-logo.png" alt="Henry Schein One" width={32} height={32} className="h-8 w-auto" />
              <span className="text-white text-sm">HS1 Careers Matrix</span>
              {isDemoMode && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-900">
                  Demo Mode
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-white text-sm">
                <User className="w-4 h-4" />
                <span>{user.name}</span>
                <Badge variant="secondary" className="bg-brand-100 text-brand-800">
                  {user.role}
                </Badge>
              </div>
              <form action={logoutAction}>
                <Button variant="ghost" size="sm" type="submit" className="text-white hover:bg-brand-700">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h1>
          <p className="text-gray-600">
            Explore career paths, assess your skills, and plan your professional development.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRoles}</div>
              <p className="text-xs text-muted-foreground">Career paths available</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skills Tracked</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSkills}</div>
              <p className="text-xs text-muted-foreground">Across all roles</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Using the platform</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Self Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Evaluate your current skills and identify areas for growth.</p>
              <Link href="/self-review">
                <Button className="w-full bg-brand-600 hover:bg-brand-700">Start Assessment</Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Role Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Compare different roles to understand career progression paths.</p>
              <Link href="/compare">
                <Button variant="outline" className="w-full bg-transparent">
                  Compare Roles
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Departments */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Browse by Department</h2>
            {user.role === "admin" && <AdminButton />}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map((dept) => (
              <Link key={dept.slug} href={`/department/${dept.slug}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      {dept.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-3">{dept.description}</p>
                    <Badge variant="secondary">
                      {dept.roleCount} {dept.roleCount === 1 ? "role" : "roles"}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
