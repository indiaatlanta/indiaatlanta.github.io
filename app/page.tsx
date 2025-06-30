"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Target, TrendingUp, BookOpen, ArrowRight, Database, UserIcon, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface DepartmentStats {
  name: string
  slug: string
  roleCount: number
  skillCount: number
  description: string
}

interface UserData {
  id: string
  name: string
  email: string
  role: string
}

export default function HomePage() {
  const [departments, setDepartments] = useState<DepartmentStats[]>([])
  const [loading, setLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchData()
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/session")
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        router.push("/login")
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      router.push("/login")
    }
  }

  const fetchData = async () => {
    try {
      const response = await fetch("/api/skills")
      const data = await response.json()

      if (data.isDemoMode) {
        setIsDemoMode(true)
        setDepartments(mockDepartments)
      } else {
        setDepartments(data.departments || [])
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
      setIsDemoMode(true)
      setDepartments(mockDepartments)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const mockDepartments: DepartmentStats[] = [
    {
      name: "Engineering",
      slug: "engineering",
      roleCount: 8,
      skillCount: 45,
      description: "Software development, DevOps, and technical architecture roles",
    },
    {
      name: "Product",
      slug: "product",
      roleCount: 5,
      skillCount: 28,
      description: "Product management, design, and strategy roles",
    },
    {
      name: "Sales",
      slug: "sales",
      roleCount: 6,
      skillCount: 32,
      description: "Sales, business development, and customer success roles",
    },
    {
      name: "Marketing",
      slug: "marketing",
      roleCount: 4,
      skillCount: 25,
      description: "Digital marketing, content, and brand management roles",
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading career matrix...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Database Status Banner */}
      {isDemoMode && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-center space-x-2">
              <Database className="h-4 w-4 text-blue-600" />
              <span className="text-blue-800 text-sm font-medium">Demo Mode</span>
              <span className="text-blue-600 text-sm">- Using sample data</span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img src="/images/hs1-logo.png" alt="Henry Schein One" className="h-8 w-auto" />
              <h1 className="text-2xl font-bold text-gray-900">Career Development Matrix</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Welcome, {user.name}</span>
                  </div>
                  {user.role === "admin" && (
                    <Link href="/admin">
                      <Button variant="outline" size="sm">
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center space-x-1 bg-transparent"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Accelerate Your Career Growth</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover career paths, assess your skills, and identify development opportunities across Henry Schein One's
            diverse departments and roles.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/self-review">
              <Button size="lg" className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Start Self Assessment</span>
              </Button>
            </Link>
            <Link href="/compare">
              <Button variant="outline" size="lg" className="flex items-center space-x-2 bg-transparent">
                <TrendingUp className="h-5 w-5" />
                <span>Compare Roles</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Target className="h-6 w-6 text-blue-600" />
                <CardTitle>Self Assessment</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Evaluate your current skills against role requirements and identify areas for growth.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
                <CardTitle>Role Comparison</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Compare different roles side-by-side to understand career progression paths.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-purple-600" />
                <CardTitle>Skills Matrix</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Explore comprehensive skills frameworks organized by department and expertise level.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Departments Grid */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Explore Departments</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map((dept) => (
              <Card key={dept.slug} className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href={`/department/${dept.slug}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{dept.name}</CardTitle>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">{dept.description}</CardDescription>
                    <div className="flex space-x-4">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-600">{dept.roleCount} roles</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-600">{dept.skillCount} skills</span>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Ready to Advance Your Career?</h3>
          <p className="text-lg mb-6 opacity-90">Take the first step towards your professional development goals.</p>
          <Link href="/self-review">
            <Button size="lg" variant="secondary" className="text-blue-600">
              Begin Your Assessment
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
