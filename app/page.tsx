import { requireAuth } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { Users, Target, TrendingUp, Award } from "lucide-react"

// Mock data for when database is not available
const mockDepartments = [
  {
    id: 1,
    name: "Engineering",
    slug: "engineering",
    description: "Software development and technical roles",
    color: "bg-blue-500",
    role_count: 8,
    skill_count: 45,
  },
  {
    id: 2,
    name: "Product",
    slug: "product",
    description: "Product management and strategy roles",
    color: "bg-green-500",
    role_count: 5,
    skill_count: 32,
  },
  {
    id: 3,
    name: "Design",
    slug: "design",
    description: "User experience and visual design roles",
    color: "bg-purple-500",
    role_count: 4,
    skill_count: 28,
  },
  {
    id: 4,
    name: "Sales",
    slug: "sales",
    description: "Sales and business development roles",
    color: "bg-orange-500",
    role_count: 6,
    skill_count: 35,
  },
]

async function getDepartments() {
  if (!isDatabaseConfigured() || !sql) {
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
        COUNT(DISTINCT jr.id) as role_count,
        COUNT(DISTINCT sm.id) as skill_count
      FROM departments d
      LEFT JOIN job_roles jr ON d.id = jr.department_id
      LEFT JOIN skills_master sm ON d.id = sm.department_id
      GROUP BY d.id, d.name, d.slug, d.description, d.color
      ORDER BY d.name
    `
    return { departments, isDemoMode: false }
  } catch (error) {
    console.error("Error fetching departments:", error)
    return { departments: mockDepartments, isDemoMode: true }
  }
}

export default async function HomePage() {
  const user = await requireAuth()
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
              <span className="text-sm text-gray-700">Welcome, {user.name}</span>
              {user.role === "admin" && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    Admin Panel
                  </Button>
                </Link>
              )}
              <form action="/api/auth/logout" method="POST">
                <Button type="submit" variant="outline" size="sm">
                  Logout
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Database Status Banner */}
      {isDemoMode && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-center space-x-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-sm font-medium">
                Demo Mode
              </Badge>
              <span className="text-blue-800 text-sm">Database not configured - showing sample data</span>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Your Career Path</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover roles, assess your skills, and plan your professional development journey at Henry Schein One.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/self-review">
              <Button size="lg" className="bg-brand-600 hover:bg-brand-700">
                Start Self Assessment
              </Button>
            </Link>
            <Link href="/compare">
              <Button size="lg" variant="outline">
                Compare Roles
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Target className="h-12 w-12 text-brand-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Skill Assessment</h3>
              <p className="text-gray-600 text-sm">Evaluate your current skills and identify areas for growth</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-brand-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Role Comparison</h3>
              <p className="text-gray-600 text-sm">Compare different roles to understand career progression paths</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-12 w-12 text-brand-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Career Planning</h3>
              <p className="text-gray-600 text-sm">Plan your development journey with clear skill requirements</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Award className="h-12 w-12 text-brand-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-600 text-sm">Monitor your skill development and career advancement</p>
            </CardContent>
          </Card>
        </div>

        {/* Departments Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore by Department</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map((dept) => (
              <Link key={dept.id} href={`/department/${dept.slug}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className={`w-12 h-12 rounded-lg ${dept.color} flex items-center justify-center mb-3`}>
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{dept.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">{dept.description}</p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{dept.role_count} roles</span>
                      <span>{dept.skill_count} skills</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-brand-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Your Journey?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Take control of your career development. Assess your skills, explore new roles, and create a personalized
            development plan.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/self-review">
              <Button size="lg" className="bg-brand-600 hover:bg-brand-700">
                Begin Assessment
              </Button>
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
