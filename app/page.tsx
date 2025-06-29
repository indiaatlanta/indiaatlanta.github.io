import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Users, BarChart3, FileText, Settings } from "lucide-react"
import LoginButton from "@/components/login-button"
import AdminButton from "@/components/admin-button"

async function getDepartments() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/departments`, {
      cache: "no-store",
    })
    if (!response.ok) {
      throw new Error("Failed to fetch departments")
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching departments:", error)
    // Return demo data for preview
    return [
      {
        id: 1,
        name: "Engineering",
        slug: "engineering",
        description: "Software development and technical roles",
        role_count: 8,
      },
      {
        id: 2,
        name: "Product",
        slug: "product",
        description: "Product management and strategy roles",
        role_count: 5,
      },
      {
        id: 3,
        name: "Design",
        slug: "design",
        description: "User experience and visual design roles",
        role_count: 4,
      },
      {
        id: 4,
        name: "Marketing",
        slug: "marketing",
        description: "Marketing and growth roles",
        role_count: 6,
      },
    ]
  }
}

export default async function HomePage() {
  const departments = await getDepartments()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-4">
                <Image
                  src="/images/hs1-logo.png"
                  alt="Henry Schein One"
                  width={40}
                  height={40}
                  className="h-10 w-auto"
                />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Career Matrix</h1>
                  <p className="text-sm text-gray-500">Skills & Development Framework</p>
                </div>
              </Link>
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
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Henry Schein One Career Matrix</h1>
            <p className="text-xl mb-8 text-blue-100">
              Explore career paths, assess your skills, and plan your professional development
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Link href="/self-review">
                  <FileText className="w-5 h-5 mr-2" />
                  Start Self Assessment
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                <Link href="/compare">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Compare Roles
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Actions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Self Assessment
                </CardTitle>
                <CardDescription>Evaluate your skills against specific role requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/self-review">
                    Start Assessment
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  Role Comparison
                </CardTitle>
                <CardDescription>Compare skills and requirements between different roles</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/compare">
                    Compare Roles
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Browse Departments
                </CardTitle>
                <CardDescription>Explore roles and career paths by department</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="#departments">
                    View Departments
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Departments */}
        <section id="departments">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Departments</h2>
            <Badge variant="secondary">{departments.length} departments</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((department: any) => (
              <Card key={department.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {department.name}
                    <Badge variant="outline">{department.role_count} roles</Badge>
                  </CardTitle>
                  <CardDescription>{department.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href={`/department/${department.slug}`}>
                      Explore {department.name}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Self Assessment</h3>
              <p className="text-sm text-gray-600">Evaluate your current skills against role requirements</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Role Comparison</h3>
              <p className="text-sm text-gray-600">Compare skills between different career paths</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Career Paths</h3>
              <p className="text-sm text-gray-600">Explore progression opportunities within departments</p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Settings className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Skills Matrix</h3>
              <p className="text-sm text-gray-600">Detailed breakdown of skills by category and level</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Henry Schein One. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
