import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import LoginButton from "@/components/login-button"
import { AdminButton } from "@/components/admin-button"
import { Target, Users, Building2, FileText, BarChart3, TrendingUp } from "lucide-react"
import Link from "next/link"

export default async function HomePage() {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img src="/images/hs1-logo.png" alt="Henry Schein One" className="h-8 w-auto" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">HS1 Careers Matrix</h1>
                <p className="text-sm text-gray-500">Professional Development Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <AdminButton />
              <LoginButton user={user} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {user ? (
          <>
            {/* Welcome Section */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome back, {user.name}!</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Continue your professional development journey with our comprehensive skills assessment and career
                planning tools.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href="/self-review">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Target className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Self Assessment</CardTitle>
                        <CardDescription>Evaluate your current skills</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Take a comprehensive assessment to understand your current skill level and identify areas for
                      growth.
                    </p>
                    <Button className="w-full">Start Assessment</Button>
                  </CardContent>
                </Link>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href="/assessments">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FileText className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Saved Assessments</CardTitle>
                        <CardDescription>Review your assessment history</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Access and manage your completed assessments, track progress, and export results.
                    </p>
                    <Button variant="outline" className="w-full bg-transparent">
                      View Assessments
                    </Button>
                  </CardContent>
                </Link>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href="/compare">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Compare Roles</CardTitle>
                        <CardDescription>Compare different career paths</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Compare skill requirements across different roles to plan your career progression.
                    </p>
                    <Button variant="outline" className="w-full bg-transparent">
                      Compare Roles
                    </Button>
                  </CardContent>
                </Link>
              </Card>
            </div>

            {/* Department Links */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Explore Career Paths</h3>
                <p className="text-gray-600">
                  Discover opportunities across different departments and understand the skills needed for each role.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-md transition-shadow">
                  <Link href="/department/engineering">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <CardTitle className="text-base">Engineering</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        Software development, architecture, and technical leadership roles.
                      </p>
                    </CardContent>
                  </Link>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <Link href="/department/product">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                        <CardTitle className="text-base">Product</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">Product management, strategy, and user experience roles.</p>
                    </CardContent>
                  </Link>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <Link href="/department/design">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Users className="h-5 w-5 text-purple-600" />
                        </div>
                        <CardTitle className="text-base">Design</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">User interface, user experience, and visual design roles.</p>
                    </CardContent>
                  </Link>
                </Card>
              </div>
            </div>
          </>
        ) : (
          /* Not Logged In */
          <div className="text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Welcome to HS1 Careers Matrix</h2>
              <p className="text-xl text-gray-600 mb-8">
                Your comprehensive platform for professional development, skills assessment, and career planning.
              </p>
              <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                <Link href="/login">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started
                  </Button>
                </Link>
                <Link href="/department/engineering">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                    Explore Careers
                  </Button>
                </Link>
              </div>
            </div>

            {/* Features Preview */}
            <div className="mt-16 grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills Assessment</h3>
                <p className="text-gray-600">
                  Comprehensive evaluation tools to understand your current capabilities and growth areas.
                </p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Career Planning</h3>
                <p className="text-gray-600">
                  Compare roles, understand requirements, and plan your professional development journey.
                </p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Progress Tracking</h3>
                <p className="text-gray-600">
                  Monitor your growth over time and celebrate your professional development milestones.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
