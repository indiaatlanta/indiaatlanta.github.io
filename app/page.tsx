import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdminButton } from "@/components/admin-button"
import { LoginButton } from "@/components/login-button"
import {
  Target,
  Users,
  BarChart3,
  FileText,
  Building2,
  UserCheck,
  TrendingUp,
  Clock,
  BookOpen,
  Settings,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function HomePage() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <Image
                src="/images/henry-schein-one-logo.png"
                alt="Henry Schein One"
                width={300}
                height={80}
                className="mx-auto mb-8"
              />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">HS1 Careers Matrix</h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover your career path and develop the skills you need to succeed at Henry Schein One.
            </p>
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Get Started</h2>
              <p className="text-gray-600 mb-6">
                Sign in to access your personalized career development tools and skill assessments.
              </p>
              <LoginButton />
            </div>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card>
                <CardHeader>
                  <Target className="h-8 w-8 text-blue-600 mb-2" />
                  <CardTitle className="text-lg">Skill Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Evaluate your current skills and identify areas for growth.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <BarChart3 className="h-8 w-8 text-green-600 mb-2" />
                  <CardTitle className="text-lg">Career Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Compare your skills with different roles and career paths.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
                  <CardTitle className="text-lg">Development Planning</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Create personalized development plans to reach your goals.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Image src="/images/hs1-logo.png" alt="Henry Schein One" width={120} height={32} className="h-8 w-auto" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-semibold text-gray-900">HS1 Careers Matrix</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <AdminButton />
              <Badge variant="outline">{user.name}</Badge>
              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h2>
          <p className="text-gray-600">Ready to continue your career development journey?</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/self-review">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Target className="h-8 w-8 text-blue-600" />
                  <Badge variant="secondary">New</Badge>
                </div>
                <CardTitle className="text-lg">Self Assessment</CardTitle>
                <CardDescription>Evaluate your current skills and competencies</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/compare">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                  <Badge variant="outline">Popular</Badge>
                </div>
                <CardTitle className="text-lg">Compare Roles</CardTitle>
                <CardDescription>Compare your skills with different career paths</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/assessments">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <FileText className="h-8 w-8 text-purple-600" />
                  <Badge variant="outline">Track</Badge>
                </div>
                <CardTitle className="text-lg">Saved Assessments</CardTitle>
                <CardDescription>View and manage your assessment history</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <Badge variant="secondary">Soon</Badge>
              </div>
              <CardTitle className="text-lg">Development Plan</CardTitle>
              <CardDescription>Create personalized learning paths</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Department Explorer */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Explore Departments</h3>
              <p className="text-gray-600">Discover career opportunities across different departments</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/department/engineering">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Settings className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Engineering</CardTitle>
                      <CardDescription>Software development and technical roles</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>12 roles available</span>
                    <span>45+ skills</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/department/product">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Target className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Product</CardTitle>
                      <CardDescription>Product management and strategy</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>8 roles available</span>
                    <span>30+ skills</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/department/sales">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Sales</CardTitle>
                      <CardDescription>Sales and business development</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>6 roles available</span>
                    <span>25+ skills</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/department/marketing">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Users className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Marketing</CardTitle>
                      <CardDescription>Marketing and communications</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>5 roles available</span>
                    <span>20+ skills</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/department/operations">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Building2 className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Operations</CardTitle>
                      <CardDescription>Operations and process management</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>7 roles available</span>
                    <span>35+ skills</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/department/hr">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <UserCheck className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Human Resources</CardTitle>
                      <CardDescription>People and talent management</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>4 roles available</span>
                    <span>18+ skills</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-gray-600">
                <Clock className="w-4 h-4 inline mr-1" />
                Welcome to HS1 Careers Matrix! Start by taking your first assessment.
              </span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span className="text-gray-600">
                <BookOpen className="w-4 h-4 inline mr-1" />
                Explore different departments to find your ideal career path.
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
