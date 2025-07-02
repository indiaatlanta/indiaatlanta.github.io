import { getCurrentUser } from "@/lib/auth"
import LoginButton from "@/components/login-button"
import { AdminButton } from "@/components/admin-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Target, BarChart3, BookOpen, FileText } from "lucide-react"
import Link from "next/link"

export default async function HomePage() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <header className="flex justify-between items-center mb-12">
            <div className="flex items-center space-x-4">
              <img src="/images/hs1-logo.png" alt="Henry Schein One" className="h-12 w-auto" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">HS1 Careers Matrix</h1>
                <p className="text-gray-600">Professional Development & Skills Assessment</p>
              </div>
            </div>
            <LoginButton user={user} />
          </header>

          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Advance Your Career with Confidence</h2>
              <p className="text-xl text-gray-600 mb-8">
                Discover your skills, explore career paths, and plan your professional development journey.
              </p>
              <Link href="/login">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Get Started
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <CardTitle>Skills Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Evaluate your current skills and identify areas for growth with our comprehensive assessment tools.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <BarChart3 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <CardTitle>Career Mapping</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Explore different career paths and understand the skills required for your next role.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <BookOpen className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <CardTitle>Development Planning</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Create personalized development plans to bridge skill gaps and achieve your career goals.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <img src="/images/hs1-logo.png" alt="Henry Schein One" className="h-12 w-auto" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">HS1 Careers Matrix</h1>
              <p className="text-gray-600">Welcome back, {user.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <AdminButton />
            <LoginButton user={user} />
          </div>
        </header>

        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Career Dashboard</h2>
            <p className="text-gray-600">
              Explore your professional development journey and discover new opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/self-review">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Target className="w-8 h-8 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">Skills Assessment</CardTitle>
                      <CardDescription>Evaluate your current skills</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Take a comprehensive assessment to understand your strengths and identify growth opportunities.
                  </p>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/compare">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-8 h-8 text-green-600" />
                    <div>
                      <CardTitle className="text-lg">Role Comparison</CardTitle>
                      <CardDescription>Compare different career paths</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Compare your skills against different roles to find the best career fit and development path.
                  </p>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/assessments">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-purple-600" />
                    <div>
                      <CardTitle className="text-lg">Saved Assessments</CardTitle>
                      <CardDescription>View your assessment history</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Access your previous assessments, track progress, and export your results.
                  </p>
                </CardContent>
              </Link>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-6 h-6 text-blue-600" />
                  <span>Explore Departments</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Browse different departments and discover the skills and roles available in each area.
                </p>
                <div className="space-y-2">
                  <Link href="/department/engineering">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      Engineering
                    </Button>
                  </Link>
                  <Link href="/department/product">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      Product
                    </Button>
                  </Link>
                  <Link href="/department/design">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      Design
                    </Button>
                  </Link>
                  <Link href="/department/marketing">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      Marketing
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="w-6 h-6 text-green-600" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Jump into your most common tasks and continue your professional development.
                </p>
                <div className="space-y-2">
                  <Link href="/self-review">
                    <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">Start New Assessment</Button>
                  </Link>
                  <Link href="/assessments">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      View Assessment History
                    </Button>
                  </Link>
                  <Link href="/compare">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      Compare Career Paths
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
