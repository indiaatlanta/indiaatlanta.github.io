import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, Target, FileText, BarChart3 } from "lucide-react"
import Link from "next/link"
import LoginButton from "@/components/login-button"
import { AdminButton } from "@/components/admin-button"

export default async function HomePage() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">HS1 Careers Matrix</h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover your career path and assess your skills across different roles
            </p>
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">HS1 Careers Matrix</h1>
                <p className="text-sm text-gray-500">Skills Assessment & Career Development</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user.role === "admin" && <AdminButton />}
              <LoginButton user={user} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h2>
          <p className="text-gray-600">
            Explore career opportunities and assess your skills across different departments and roles.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/self-review">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Self Assessment</CardTitle>
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <CardDescription>Evaluate your skills against specific job roles</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full bg-transparent">
                  Start Assessment
                </Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/compare">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Compare Roles</CardTitle>
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                <CardDescription>Compare your skills across different job roles</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full bg-transparent">
                  Compare Now
                </Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/assessments">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Saved Assessments</CardTitle>
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <CardDescription>View and manage your completed assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full bg-transparent">
                  View Assessments
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Departments Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Explore Departments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <Link href="/department/engineering">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Engineering</CardTitle>
                    <Badge variant="secondary">12 Roles</Badge>
                  </div>
                  <CardDescription className="text-sm">
                    Software development, DevOps, and technical leadership roles
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <Link href="/department/product">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Product</CardTitle>
                    <Badge variant="secondary">8 Roles</Badge>
                  </div>
                  <CardDescription className="text-sm">Product management, design, and strategy roles</CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <Link href="/department/sales">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Sales</CardTitle>
                    <Badge variant="secondary">6 Roles</Badge>
                  </div>
                  <CardDescription className="text-sm">
                    Sales development, account management, and business development
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <Link href="/department/marketing">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Marketing</CardTitle>
                    <Badge variant="secondary">7 Roles</Badge>
                  </div>
                  <CardDescription className="text-sm">
                    Digital marketing, content creation, and brand management
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <Link href="/department/operations">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Operations</CardTitle>
                    <Badge variant="secondary">5 Roles</Badge>
                  </div>
                  <CardDescription className="text-sm">
                    Business operations, process improvement, and analytics
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <Link href="/department/hr">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Human Resources</CardTitle>
                    <Badge variant="secondary">4 Roles</Badge>
                  </div>
                  <CardDescription className="text-sm">
                    Talent acquisition, employee development, and HR operations
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Getting Started
            </CardTitle>
            <CardDescription>Here are some ways to make the most of the HS1 Careers Matrix</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-blue-600">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Complete a Self Assessment</h4>
                  <p className="text-sm text-gray-600">
                    Start by assessing your current skills against a specific job role to understand your strengths and
                    areas for development.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-green-600">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Explore Different Departments</h4>
                  <p className="text-sm text-gray-600">
                    Browse through various departments to discover new career opportunities and understand the skills
                    required for different roles.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-purple-600">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Compare Your Skills</h4>
                  <p className="text-sm text-gray-600">
                    Use the comparison tool to see how your skills align with multiple roles and identify the best
                    career paths for your development.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
