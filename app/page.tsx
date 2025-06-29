import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Users, BarChart3, FileText, Building2, Target, TrendingUp } from "lucide-react"
import { Suspense } from "react"
import LoginButton from "@/components/login-button"
import AdminButton from "@/components/admin-button"

export default function HomePage() {
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
                <p className="text-sm text-gray-500">Professional Development Platform</p>
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

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Navigate Your Career Journey</h1>
            <p className="text-xl mb-8 text-blue-100">
              Discover skills, compare roles, and plan your professional development with our comprehensive career
              matrix.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Link href="/self-review">
                  Start Self Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                <Link href="/compare">Compare Roles</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Self Assessment
                </CardTitle>
                <CardDescription>Evaluate your current skills and identify areas for growth</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/self-review">Start Assessment</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                  Role Comparison
                </CardTitle>
                <CardDescription>Compare different roles to understand career progression paths</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/compare">Compare Roles</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-purple-600" />
                  Department Matrix
                </CardTitle>
                <CardDescription>Explore skills and roles within specific departments</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-transparent" variant="outline">
                  <Link href="/department/engineering">View Departments</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Explore Departments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Engineering</CardTitle>
                <CardDescription>Software development and technical roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">12 Roles</Badge>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/department/engineering">
                      View <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Product</CardTitle>
                <CardDescription>Product management and strategy roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">8 Roles</Badge>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/department/product">
                      View <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Design</CardTitle>
                <CardDescription>UX/UI design and creative roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">6 Roles</Badge>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/department/design">
                      View <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Marketing</CardTitle>
                <CardDescription>Marketing and growth roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">7 Roles</Badge>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/department/marketing">
                      View <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Skill Assessment</h3>
              <p className="text-gray-600">
                Comprehensive skill evaluation with detailed feedback and improvement recommendations.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Career Progression</h3>
              <p className="text-gray-600">
                Clear pathways for advancement with role comparisons and skill gap analysis.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Team Management</h3>
              <p className="text-gray-600">
                Manager tools for tracking team development and identifying training needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <Image src="/images/hs1-logo.png" alt="Henry Schein One" width={32} height={32} className="h-8 w-auto" />
              <div>
                <p className="font-semibold">Henry Schein One</p>
                <p className="text-sm text-gray-400">Career Development Platform</p>
              </div>
            </div>
            <div className="text-sm text-gray-400">© 2024 Henry Schein One. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
