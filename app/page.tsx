import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Target,
  Users,
  BarChart3,
  FileText,
  Settings,
  Building2,
  BookOpen,
  TrendingUp,
  Clock,
  Award,
} from "lucide-react"
import Link from "next/link"
import LoginButton from "@/components/login-button"

export default async function HomePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
            <p className="text-gray-600 mt-1">Track your skills and advance your career with Henry Schein One</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="px-3 py-1">
              {user.role === "admin" ? "Administrator" : "Team Member"}
            </Badge>
            <LoginButton user={user} />
          </div>
        </header>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/self-review">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span>Self Assessment</span>
                </CardTitle>
                <CardDescription>
                  Evaluate your skills against role requirements and identify development areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Start Assessment</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/assessments">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span>Saved Assessments</span>
                </CardTitle>
                <CardDescription>
                  View and manage your completed skill assessments and track progress over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
                >
                  View Assessments
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/compare">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <span>Compare Skills</span>
                </CardTitle>
                <CardDescription>
                  Compare your skills across different roles and identify career advancement opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 bg-transparent"
                >
                  Compare Roles
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Department Links */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Explore Departments
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/department/engineering">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Engineering</h3>
                      <p className="text-sm text-gray-600">Technical roles</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/department/product">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Product</h3>
                      <p className="text-sm text-gray-600">Product management</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/department/design">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Design</h3>
                      <p className="text-sm text-gray-600">UX/UI design</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/department/operations">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Operations</h3>
                      <p className="text-sm text-gray-600">Business operations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Admin Section */}
        {user.role === "admin" && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Administration
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/admin">
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-red-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-red-600" />
                      <span>Admin Panel</span>
                    </CardTitle>
                    <CardDescription>Manage users, skills, job roles, and system configuration</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full border-red-600 text-red-600 hover:bg-red-50 bg-transparent"
                    >
                      Open Admin Panel
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm mt-12">
          <p>© 2024 Henry Schein One. Empowering careers through skills development.</p>
        </footer>
      </div>
    </div>
  )
}
