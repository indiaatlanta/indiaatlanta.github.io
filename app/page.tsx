import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import LoginButton from "@/components/login-button"
import AdminButton from "@/components/admin-button"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { Users, Building2, Target, TrendingUp, AlertCircle } from "lucide-react"

interface Department {
  id: number
  name: string
  slug: string
  description: string
  color?: string
}

interface Stats {
  totalRoles: number
  totalSkills: number
  totalDepartments: number
  totalUsers: number
}

const departmentColors = ["blue", "green", "purple", "orange", "indigo", "pink"]

async function getStats(): Promise<{ stats: Stats; isDemoMode: boolean }> {
  if (!isDatabaseConfigured() || !sql) {
    return {
      stats: {
        totalRoles: 15,
        totalSkills: 120,
        totalDepartments: 4,
        totalUsers: 45,
      },
      isDemoMode: true,
    }
  }

  try {
    // Try new structure first, fallback to old structure
    let skillCount = 0
    try {
      const skillResult = await sql`SELECT COUNT(*) as count FROM skill_demonstrations`
      skillCount = skillResult[0]?.count || 0
    } catch (error) {
      try {
        const fallbackSkillResult = await sql`SELECT COUNT(*) as count FROM skills`
        skillCount = fallbackSkillResult[0]?.count || 0
      } catch (fallbackError) {
        console.error("Error counting skills:", fallbackError)
        skillCount = 0
      }
    }

    const [roleResult, deptResult, userResult] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM job_roles`,
      sql`SELECT COUNT(*) as count FROM departments`,
      sql`SELECT COUNT(*) as count FROM users`,
    ])

    return {
      stats: {
        totalRoles: Number(roleResult[0]?.count) || 0,
        totalSkills: Number(skillCount) || 0,
        totalDepartments: Number(deptResult[0]?.count) || 0,
        totalUsers: Number(userResult[0]?.count) || 0,
      },
      isDemoMode: false,
    }
  } catch (error) {
    console.error("Error fetching stats:", error)
    return {
      stats: {
        totalRoles: 15,
        totalSkills: 120,
        totalDepartments: 4,
        totalUsers: 45,
      },
      isDemoMode: true,
    }
  }
}

async function getDepartments(): Promise<{ departments: Department[]; isDemoMode: boolean }> {
  if (!isDatabaseConfigured() || !sql) {
    return {
      departments: [
        { id: 1, name: "Engineering", slug: "engineering", description: "Software development and technical roles" },
        { id: 2, name: "Product", slug: "product", description: "Product management and design roles" },
        { id: 3, name: "Sales", slug: "sales", description: "Sales and business development roles" },
        { id: 4, name: "Marketing", slug: "marketing", description: "Marketing and communications roles" },
      ],
      isDemoMode: true,
    }
  }

  try {
    const departments = await sql`
      SELECT id, name, slug, description
      FROM departments
      ORDER BY name
    `

    return {
      departments: departments.map((dept, index) => ({
        ...dept,
        color: departmentColors[index % departmentColors.length],
      })),
      isDemoMode: false,
    }
  } catch (error) {
    console.error("Error fetching departments:", error)
    return {
      departments: [
        { id: 1, name: "Engineering", slug: "engineering", description: "Software development and technical roles" },
        { id: 2, name: "Product", slug: "product", description: "Product management and design roles" },
        { id: 3, name: "Sales", slug: "sales", description: "Sales and business development roles" },
        { id: 4, name: "Marketing", slug: "marketing", description: "Marketing and communications roles" },
      ],
      isDemoMode: true,
    }
  }
}

export default async function HomePage() {
  const [{ stats, isDemoMode: statsDemo }, { departments, isDemoMode: deptDemo }] = await Promise.all([
    getStats(),
    getDepartments(),
  ])

  const isDemoMode = statsDemo || deptDemo

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Image src="/images/hs1-logo.png" alt="Henry Schein One" width={40} height={40} className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Career Matrix</h1>
                <p className="text-sm text-gray-500">Skills & Career Development</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Suspense fallback={<div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />}>
                <LoginButton />
              </Suspense>
              <Suspense fallback={<div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />}>
                <AdminButton />
              </Suspense>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8 h-12">
            <div className="flex space-x-6">
              <Link href="/compare" className="text-sm text-gray-600 hover:text-gray-900">
                Compare Roles
              </Link>
              <Link href="/self-review" className="text-sm text-gray-600 hover:text-gray-900">
                Self Assessment
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Mode Alert */}
        {isDemoMode && (
          <Alert className="mb-8 border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Demo Mode:</strong> This is a demonstration with sample data. Connect to a database to see real
              information.
            </AlertDescription>
          </Alert>
        )}

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome to the Career Matrix</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore career paths, understand skill requirements, and plan your professional development journey with our
            comprehensive skills matrix.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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
              <CardTitle className="text-sm font-medium">Skills Tracked</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSkills}</div>
              <p className="text-xs text-muted-foreground">Unique skill demonstrations</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDepartments}</div>
              <p className="text-xs text-muted-foreground">Active departments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>
        </div>

        {/* Departments Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Explore Departments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((department, index) => {
              const colorClass = departmentColors[index % departmentColors.length]
              return (
                <Link key={department.id} href={`/department/${department.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{department.name}</CardTitle>
                        <Badge
                          variant="outline"
                          className={`bg-${colorClass}-50 text-${colorClass}-700 border-${colorClass}-200`}
                        >
                          Department
                        </Badge>
                      </div>
                      <CardDescription>{department.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">Click to explore roles and skills in {department.name}</p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Skills Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Compare skills across different roles and levels to understand career progression paths.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                Role Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Side-by-side comparison of different roles to help you understand the differences and similarities.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                Self Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Evaluate your current skills against role requirements and identify areas for development.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
