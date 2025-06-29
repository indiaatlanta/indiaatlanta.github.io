import { Button } from "@/components/ui/button"
import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Users, TrendingUp, Award } from "lucide-react"
import LoginButton from "@/components/login-button"
import AdminButton from "@/components/admin-button"
import { sql, isDatabaseConfigured } from "@/lib/db"

interface Department {
  id: number
  name: string
  slug: string
  description: string
  color: string
  role_count?: number
}

async function getDepartments(): Promise<{ departments: Department[]; isDemoMode: boolean }> {
  if (!isDatabaseConfigured() || !sql) {
    const mockDepartments: Department[] = [
      {
        id: 1,
        name: "Engineering",
        slug: "engineering",
        description: "Software development and technical roles",
        color: "#3B82F6",
        role_count: 8,
      },
      {
        id: 2,
        name: "Product",
        slug: "product",
        description: "Product management and strategy roles",
        color: "#10B981",
        role_count: 5,
      },
      {
        id: 3,
        name: "Design",
        slug: "design",
        description: "User experience and visual design roles",
        color: "#8B5CF6",
        role_count: 4,
      },
      {
        id: 4,
        name: "Marketing",
        slug: "marketing",
        description: "Marketing and growth roles",
        color: "#F59E0B",
        role_count: 6,
      },
      {
        id: 5,
        name: "Sales",
        slug: "sales",
        description: "Sales and business development roles",
        color: "#EF4444",
        role_count: 7,
      },
      {
        id: 6,
        name: "Operations",
        slug: "operations",
        description: "Operations and support roles",
        color: "#6B7280",
        role_count: 5,
      },
    ]
    return { departments: mockDepartments, isDemoMode: true }
  }

  try {
    const departments = await sql`
      SELECT 
        d.id,
        d.name,
        d.slug,
        d.description,
        d.color,
        COUNT(jr.id) as role_count
      FROM departments d
      LEFT JOIN job_roles jr ON d.id = jr.department_id
      GROUP BY d.id, d.name, d.slug, d.description, d.color, d.sort_order
      ORDER BY d.sort_order, d.name
    `

    return { departments, isDemoMode: false }
  } catch (error) {
    console.error("Error fetching departments:", error)

    // Fallback to demo data
    const mockDepartments: Department[] = [
      {
        id: 1,
        name: "Engineering",
        slug: "engineering",
        description: "Software development and technical roles",
        color: "#3B82F6",
        role_count: 8,
      },
      {
        id: 2,
        name: "Product",
        slug: "product",
        description: "Product management and strategy roles",
        color: "#10B981",
        role_count: 5,
      },
    ]
    return { departments: mockDepartments, isDemoMode: true }
  }
}

export default async function HomePage() {
  const { departments, isDemoMode } = await getDepartments()

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
                <p className="text-sm text-gray-500">Henry Schein One</p>
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
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Demo Mode:</strong> Department and role data is simulated for demonstration purposes.
            </AlertDescription>
          </Alert>
        )}

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Career Development Matrix</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Explore career paths, understand skill requirements, and plan your professional growth across different
            departments at Henry Schein One.
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>{departments.reduce((sum, dept) => sum + (dept.role_count || 0), 0)} Roles</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Career Progression</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>Skills Assessment</span>
            </div>
          </div>
        </div>

        {/* Departments Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore Departments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((department) => (
              <Link key={department.id} href={`/department/${department.slug}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{department.name}</CardTitle>
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: department.color }} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{department.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {department.role_count || 0} roles
                      </Badge>
                      <span className="text-sm text-blue-600 font-medium">Explore →</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>Compare Roles</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Compare different roles side-by-side to understand skill requirements and career progression paths.
              </p>
              <Link href="/compare">
                <Button className="w-full">Start Comparison</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-green-600" />
                <span>Self Assessment</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Assess your current skills against role requirements and identify areas for development.
              </p>
              <Link href="/self-review">
                <Button variant="outline" className="w-full bg-transparent">
                  Start Assessment
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
