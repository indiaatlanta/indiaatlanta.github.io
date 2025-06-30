"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  BookOpen,
  TrendingUp,
  Award,
  Building2,
  LogOut,
  Settings,
  BarChart3,
  Target,
  Clock,
  Star,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { User as AuthUser } from "@/lib/auth"

interface MainPageClientProps {
  user: AuthUser
}

interface Department {
  id: number
  name: string
  slug: string
  description: string
  skillCount: number
  roleCount: number
}

interface Skill {
  id: number
  name: string
  category: string
  level: number
  description: string
}

interface Stats {
  totalUsers: number
  totalSkills: number
  totalDepartments: number
  totalAssessments: number
}

export default function MainPageClient({ user }: MainPageClientProps) {
  const [departments, setDepartments] = useState<Department[]>([])
  const [recentSkills, setRecentSkills] = useState<Skill[]>([])
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalSkills: 0,
    totalDepartments: 0,
    totalAssessments: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch departments
        const deptResponse = await fetch("/api/departments")
        if (deptResponse.ok) {
          const deptData = await deptResponse.json()
          setDepartments(deptData)
        }

        // Fetch recent skills
        const skillsResponse = await fetch("/api/skills?limit=5")
        if (skillsResponse.ok) {
          const skillsData = await skillsResponse.json()
          setRecentSkills(skillsData)
        }

        // Set demo stats
        setStats({
          totalUsers: 156,
          totalSkills: 89,
          totalDepartments: departments.length || 8,
          totalAssessments: 234,
        })
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [departments.length])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
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
              <div className="flex items-center space-x-2">
                <LogOut className="h-5 w-5 text-gray-400" />
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name.split(" ")[0]}!</h2>
          <p className="text-gray-600">Explore career paths, assess your skills, and discover growth opportunities.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Skills Tracked</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSkills}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Departments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDepartments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Assessments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAssessments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/self-review">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Target className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900">Self Assessment</h4>
                      <p className="text-sm text-gray-600">Evaluate your current skills</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/compare">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900">Compare Roles</h4>
                      <p className="text-sm text-gray-600">Find your ideal career path</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">Learning Paths</h4>
                    <p className="text-sm text-gray-600">Discover skill development</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="departments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="skills">Recent Skills</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="departments" className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Department Explorer</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.length > 0 ? (
                  departments.map((dept) => (
                    <Link key={dept.id} href={`/department/${dept.slug}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader>
                          <CardTitle className="text-lg">{dept.name}</CardTitle>
                          <CardDescription>{dept.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>{dept.skillCount} skills</span>
                            <span>{dept.roleCount} roles</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No departments available</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recently Added Skills</h3>
              <div className="space-y-4">
                {recentSkills.length > 0 ? (
                  recentSkills.map((skill) => (
                    <Card key={skill.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                            <p className="text-sm text-gray-600">{skill.description}</p>
                            <Badge variant="outline" className="mt-2">
                              {skill.category}
                            </Badge>
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-sm font-medium">{skill.level}/5</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent skills to display</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">System initialized</p>
                        <p className="text-xs text-gray-600">Welcome to the HS1 Careers Matrix</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <LogOut className="h-5 w-5 text-blue-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Profile created</p>
                        <p className="text-xs text-gray-600">Your account is ready to use</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
