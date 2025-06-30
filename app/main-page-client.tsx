"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  Building2,
  TrendingUp,
  Award,
  BookOpen,
  Target,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  Star,
  Clock,
  CheckCircle,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Department {
  id: number
  name: string
  slug: string
  description: string
  total_roles: number
  total_skills: number
}

interface Skill {
  id: number
  name: string
  category: string
  level: number
  description: string
}

interface AppUser {
  id: number
  email: string
  name: string
  role: string
}

export default function MainPageClient() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [recentSkills, setRecentSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchUserData()
    fetchDepartments()
    fetchRecentSkills()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/auth/session")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments")
      if (response.ok) {
        const data = await response.json()
        setDepartments(data.slice(0, 6)) // Show first 6 departments
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error)
    }
  }

  const fetchRecentSkills = async () => {
    try {
      const response = await fetch("/api/skills?limit=5")
      if (response.ok) {
        const data = await response.json()
        setRecentSkills(data.slice(0, 5))
      }
    } catch (error) {
      console.error("Failed to fetch recent skills:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      if (response.ok) {
        window.location.href = "/login"
      }
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
              <Image
                src="/images/henry-schein-one-logo.png"
                alt="Henry Schein One"
                width={150}
                height={40}
                className="h-8 w-auto"
              />
              <div className="hidden md:block">
                <h1 className="text-xl font-semibold text-gray-900">Careers Matrix</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                    <Badge variant={user.role === "admin" ? "destructive" : "secondary"}>{user.role}</Badge>
                  </div>
                  {user.role === "admin" && (
                    <Link href="/admin">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to HS1 Careers Matrix</h1>
          <p className="text-lg text-gray-600">
            Explore career paths, assess your skills, and plan your professional development journey.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/self-review">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
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
                <p className="text-sm text-gray-600">
                  Take a comprehensive assessment to understand your skill levels and identify areas for growth.
                </p>
                <div className="flex items-center mt-3 text-blue-600">
                  <span className="text-sm font-medium">Start Assessment</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/compare">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Role Comparison</CardTitle>
                    <CardDescription>Compare skills across roles</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Compare your skills against different job roles to find the best career fit.
                </p>
                <div className="flex items-center mt-3 text-green-600">
                  <span className="text-sm font-medium">Compare Roles</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Learning Path</CardTitle>
                  <CardDescription>Personalized development plan</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Get personalized learning recommendations based on your career goals.
              </p>
              <div className="flex items-center mt-3 text-purple-600">
                <span className="text-sm font-medium">Coming Soon</span>
                <Clock className="h-4 w-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="departments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="skills">Recent Skills</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="departments" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Explore Departments</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map((dept) => (
                  <Link key={dept.id} href={`/department/${dept.slug}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Building2 className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{dept.name}</CardTitle>
                            <CardDescription className="line-clamp-2">{dept.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">{dept.total_roles}</div>
                              <div className="text-xs text-gray-500">Roles</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">{dept.total_skills}</div>
                              <div className="text-xs text-gray-500">Skills</div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Skills</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentSkills.map((skill) => (
                  <Card key={skill.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{skill.name}</h3>
                          <Badge variant="outline" className="mb-2">
                            {skill.category}
                          </Badge>
                          <p className="text-sm text-gray-600 line-clamp-2">{skill.description}</p>
                        </div>
                        <div className="flex items-center space-x-1 ml-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < skill.level ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Platform Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{departments.length}</div>
                        <div className="text-sm text-gray-500">Departments</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {departments.reduce((sum, dept) => sum + dept.total_roles, 0)}
                        </div>
                        <div className="text-sm text-gray-500">Total Roles</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Award className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {departments.reduce((sum, dept) => sum + dept.total_skills, 0)}
                        </div>
                        <div className="text-sm text-gray-500">Total Skills</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">100%</div>
                        <div className="text-sm text-gray-500">Platform Ready</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>System Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Database Connection</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Authentication System</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Operational
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Skills Matrix</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Ready
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Assessment Tools</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Available
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
