import { sql, isDatabaseConfigured } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Target, BookOpen, LogOut } from "lucide-react"
import Image from "next/image"
import { AdminButton } from "@/components/admin-button"

// Mock data for demo mode
const mockDashboardStats = {
  totalRoles: 5,
  totalSkills: 45,
  totalUsers: 12,
}

const mockDepartments = [
  { slug: "engineering", name: "Engineering", roleCount: 5, description: "Software development roles" },
  { slug: "product", name: "Product", roleCount: 3, description: "Product management roles" },
  { slug: "design", name: "Design", roleCount: 2, description: "UX/UI design roles" },
  { slug: "data", name: "Data", roleCount: 2, description: "Data science and analytics roles" },
]

async function getDashboardStats() {
  if (!isDatabaseConfigured() || !sql) {
    return mockDashboardStats
  }

  try {
    const [rolesResult, skillsResult, usersResult] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM job_roles`,
      sql`SELECT COUNT(*) as count FROM skills_master`,
      sql`SELECT COUNT(*) as count FROM users`,
    ])

    return {
      totalRoles: Number.parseInt(rolesResult[0]?.count || "0"),
      totalSkills: Number.parseInt(skillsResult[0]?.count || "0"),
      totalUsers: Number.parseInt(usersResult[0]?.count || "0"),
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return mockDashboardStats
  }
}

async function getDepartments() {
  if (!isDatabaseConfigured() || !sql) {
    return mockDepartments
  }

  try {
    const departments = await sql`
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
      roleCount: Number.parseInt(dept.role_count || "0"),
      description: dept.description || "",
    }))
  } catch (error) {
    console.error("Error fetching departments:", error)
    return mockDepartments
  }
}

async function logout() {
  "use server"
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/logout`, {
      method: "POST",
    })
    if (response.ok) {
      redirect("/login")
    }
  } catch (error) {
    console.error("Logout error:", error)
    redirect("/login")
  }
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
              <span className="text-white text-sm">Careers Matrix</span>
              {isDemoMode && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-900">
                  Demo Mode
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white text-sm">Welcome, {user.name}</span>
              <Badge variant="secondary" className="bg-brand-100 text-brand-800">
                {user.role}
              </Badge>
              <form action={logout}>
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
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRoles}</div>
              <p className="text-xs text-muted-foreground">Across all departments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Skills</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSkills}</div>
              <p className="text-xs text-muted-foreground">Skills in the matrix</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Self Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Evaluate your current skills and identify areas for growth.</p>
              <Link href="/self-review">
                <Button className="w-full bg-brand-600 hover:bg-brand-700">Start Self Assessment</Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Role Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Compare different roles to understand career progression paths.</p>
              <Link href="/compare">
                <Button className="w-full bg-brand-600 hover:bg-brand-700">Compare Roles</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Departments */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Browse by Department</h2>
            <AdminButton />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map((department) => (
              <Link key={department.slug} href={`/department/${department.slug}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{department.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-3">{department.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{department.roleCount} roles</span>
                      <Badge variant="outline">{department.roleCount}</Badge>
                    </div>
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
