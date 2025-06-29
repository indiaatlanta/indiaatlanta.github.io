import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import LoginButton from "@/components/login-button"
import AdminButton from "@/components/admin-button"
import { sql, isDatabaseConfigured, DEMO_DEPARTMENTS } from "@/lib/db"
import { Users, Building2, Target, TrendingUp } from "lucide-react"

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
    return { departments: DEMO_DEPARTMENTS, isDemoMode: true }
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
    return { departments: DEMO_DEPARTMENTS, isDemoMode: true }
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

      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Your Career Path at Henry Schein One</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover roles, understand skill requirements, and plan your professional development across our
              departments.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5" />
                <span>{departments.length} Departments</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>{departments.reduce((sum, dept) => sum + (dept.role_count || 0), 0)} Roles</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Skills Matrix</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Career Growth</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose Your Department</h2>
          <p className="text-gray-600">
            Select a department to explore career paths, role requirements, and skills matrices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department) => (
            <Link key={department.id} href={`/department/${department.slug}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: department.color }} />
                    <Badge variant="outline" className="text-xs">
                      {department.role_count || 0} roles
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{department.name}</CardTitle>
                  <CardDescription className="text-sm">{department.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full justify-between p-0">
                    <span>Explore Roles</span>
                    <span>→</span>
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Demo Mode Notice */}
        {isDemoMode && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <p className="text-blue-800 text-sm">
                <strong>Demo Mode:</strong> Showing sample departments and roles for demonstration purposes.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
