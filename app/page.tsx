import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Building2, Award, TrendingUp, ArrowRight, Target, BookOpen, BarChart3 } from "lucide-react"
import Link from "next/link"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

// Demo data for when database is not configured
const DEMO_DEPARTMENTS = [
  { id: 1, name: "Engineering", description: "Software development and technical innovation", employee_count: 45 },
  { id: 2, name: "Product Management", description: "Product strategy and roadmap planning", employee_count: 12 },
  { id: 3, name: "Design", description: "User experience and visual design", employee_count: 8 },
  { id: 4, name: "Marketing", description: "Brand management and customer acquisition", employee_count: 15 },
  { id: 5, name: "Sales", description: "Revenue generation and client relationships", employee_count: 22 },
  { id: 6, name: "Customer Success", description: "Client support and satisfaction", employee_count: 18 },
]

const DEMO_STATS = {
  totalEmployees: 120,
  totalSkills: 85,
  totalDepartments: 6,
  completedReviews: 78,
}

const DEPARTMENT_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-red-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-pink-500",
]

async function getDepartments() {
  if (!isDatabaseConfigured() || !sql) {
    return DEMO_DEPARTMENTS.map((dept, index) => ({
      ...dept,
      color: DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length],
    }))
  }

  try {
    const departments = await sql`
      SELECT 
        d.id,
        d.name,
        d.description,
        COUNT(DISTINCT u.id) as employee_count
      FROM departments d
      LEFT JOIN users u ON u.department = d.name AND u.active = true
      GROUP BY d.id, d.name, d.description
      ORDER BY d.name
    `

    return departments.map((dept: any, index: number) => ({
      id: dept.id,
      name: dept.name,
      description: dept.description,
      employee_count: Number(dept.employee_count) || 0,
      color: DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length],
    }))
  } catch (error) {
    console.error("Error fetching departments:", error)
    return DEMO_DEPARTMENTS.map((dept, index) => ({
      ...dept,
      color: DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length],
    }))
  }
}

async function getStats() {
  if (!isDatabaseConfigured() || !sql) {
    return DEMO_STATS
  }

  try {
    const [employeeCount, skillCount, departmentCount, reviewCount] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM users WHERE active = true`,
      sql`SELECT COUNT(DISTINCT name) as count FROM skills_master`,
      sql`SELECT COUNT(*) as count FROM departments`,
      sql`SELECT COUNT(*) as count FROM saved_self_reviews`,
    ])

    return {
      totalEmployees: Number(employeeCount[0]?.count) || 0,
      totalSkills: Number(skillCount[0]?.count) || 0,
      totalDepartments: Number(departmentCount[0]?.count) || 0,
      completedReviews: Number(reviewCount[0]?.count) || 0,
    }
  } catch (error) {
    console.error("Error fetching stats:", error)
    return DEMO_STATS
  }
}

export default async function HomePage() {
  const [departments, stats, currentUser] = await Promise.all([getDepartments(), getStats(), getCurrentUser()])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">HS1 Careers Matrix</h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Empower your career growth with comprehensive skills assessment, role comparison, and professional
              development tracking.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              {currentUser ? (
                <Link href="/self-review">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Start Self Review
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
              <Link href="/compare">
                <Button variant="outline" size="lg">
                  Compare Roles
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">Active team members</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skills Tracked</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSkills}</div>
              <p className="text-xs text-muted-foreground">Across all departments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDepartments}</div>
              <p className="text-xs text-muted-foreground">Organizational units</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviews Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedReviews}</div>
              <p className="text-xs text-muted-foreground">Self-assessments done</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Departments Section */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Explore Departments</h2>
          <p className="mt-4 text-lg text-gray-600">
            Discover career opportunities and skill requirements across our organization
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((department) => (
            <Link key={department.id} href={`/department/${department.name.toLowerCase().replace(/\s+/g, "-")}`}>
              <Card className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`h-12 w-12 rounded-lg ${department.color} flex items-center justify-center`}>
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="secondary">{department.employee_count} employees</Badge>
                  </div>
                  <CardTitle className="group-hover:text-blue-600 transition-colors">{department.name}</CardTitle>
                  <CardDescription>{department.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    View skills matrix
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Powerful Career Development Tools
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Everything you need to assess, compare, and grow your professional skills
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-blue-500 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Self Assessment</CardTitle>
              <CardDescription>
                Evaluate your current skills and identify areas for improvement with our comprehensive self-review tool.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/self-review">
                <Button variant="outline" className="w-full bg-transparent">
                  Start Assessment
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-green-500 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Role Comparison</CardTitle>
              <CardDescription>
                Compare your skills against different roles to understand career progression paths and requirements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/compare">
                <Button variant="outline" className="w-full bg-transparent">
                  Compare Roles
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-purple-500 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Skills Matrix</CardTitle>
              <CardDescription>
                Explore detailed skills matrices for each department to understand competency requirements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full bg-transparent" disabled>
                Browse Matrix
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to advance your career?</h2>
            <p className="mt-4 text-lg text-blue-100">
              Join thousands of professionals using HS1 Careers Matrix to accelerate their growth.
            </p>
            <div className="mt-8">
              {currentUser ? (
                <Link href="/profile">
                  <Button size="lg" variant="secondary">
                    View Your Profile
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button size="lg" variant="secondary">
                    Get Started Today
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
