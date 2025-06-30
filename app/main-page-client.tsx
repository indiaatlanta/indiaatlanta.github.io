"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  BookOpen,
  Building2,
  TrendingUp,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Star,
  Clock,
  Award,
  Target,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { User as UserType } from "@/lib/auth"

interface MainPageClientProps {
  user: UserType
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

export default function MainPageClient({ user }: MainPageClientProps) {
  const [departments, setDepartments] = useState<Department[]>([])
  const [recentSkills, setRecentSkills] = useState<Skill[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSkills: 0,
    totalDepartments: 0,
    totalAssessments: 0,
  })

  useEffect(() => {
    // Fetch departments
    fetch("/api/departments")
      .then((res) => res.json())
      .then((data) => {
        if (data.departments) {
          setDepartments(data.departments)
          setStats((prev) => ({ ...prev, totalDepartments: data.departments.length }))
        }
      })
      .catch((error) => {
        console.error("Failed to fetch departments:", error)
        // Fallback data
        setDepartments([
          {
            id: 1,
            name: "Engineering",
            slug: "engineering",
            description: "Software development and technical roles",
            skillCount: 45,
            roleCount: 12,
          },
          {
            id: 2,
            name: "Product",
            slug: "product",
            description: "Product management and strategy",
            skillCount: 32,
            roleCount: 8,
          },
          {
            id: 3,
            name: "Design",
            slug: "design",
            description: "UX/UI and visual design",
            skillCount: 28,
            roleCount: 6,
          },
          {
            id: 4,
            name: "Marketing",
            slug: "marketing",
            description: "Digital marketing and growth",
            skillCount: 35,
            roleCount: 10,
          },
          {
            id: 5,
            name: "Sales",
            slug: "sales",
            description: "Sales and business development",
            skillCount: 25,
            roleCount: 7,
          },
          {
            id: 6,
            name: "Operations",
            slug: "operations",
            description: "Business operations and support",
            skillCount: 30,
            roleCount: 9,
          },
        ])
        setStats((prev) => ({ ...prev, totalDepartments: 6 }))
      })

    // Fetch recent skills
    fetch("/api/skills?limit=5")
      .then((res) => res.json())
      .then((data) => {
        if (data.skills) {
          setRecentSkills(data.skills)
          setStats((prev) => ({ ...prev, totalSkills: data.total || data.skills.length }))
        }
      })
      .catch((error) => {
        console.error("Failed to fetch skills:", error)
        // Fallback data
        setRecentSkills([
          {
            id: 1,
            name: "React Development",
            category: "Frontend",
            level: 4,
            description: "Building user interfaces with React",
          },
          { id: 2, name: "API Design", category: "Backend", level: 3, description: "Designing RESTful APIs" },
          {
            id: 3,
            name: "User Research",
            category: "Design",
            level: 5,
            description: "Conducting user interviews and surveys",
          },
          { id: 4, name: "Data Analysis", category: "Analytics", level: 4, description: "Analyzing business metrics" },
          {
            id: 5,
            name: "Project Management",
            category: "Leadership",
            level: 3,
            description: "Managing cross-functional projects",
          },
        ])
        setStats((prev) => ({ ...prev, totalSkills: 195 }))
      })

    // Set demo stats
    setStats((prev) => ({
      ...prev,
      totalUsers: 1247,
      totalAssessments: 3891,
    }))
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout error:", error)
      window.location.href = "/login"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image
                src="/images/henry-schein-one-logo.png"
                alt="Henry Schein One"
                width={150}
                height={40}
                className="h-8 w-auto"
              />
              <div className="ml-4 text-xl font-semibold text-gray-900">Careers Matrix</div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h1>
          <p className="text-lg text-gray-600">
            Explore career paths, assess your skills, and plan your professional development.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Active platform users</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skills</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSkills}</div>
              <p className="text-xs text-muted-foreground">Available skills</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDepartments}</div>
              <p className="text-xs text-muted-foreground">Career departments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assessments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAssessments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Completed assessments</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/self-review">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-600" />
                  Self Assessment
                </CardTitle>
                <CardDescription>Evaluate your current skills and identify areas for growth</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  Start Assessment
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/compare">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-green-600" />
                  Compare Roles
                </CardTitle>
                <CardDescription>Compare your skills against different job roles and requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-transparent" variant="outline">
                  Compare Now
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
                Learning Paths
              </CardTitle>
              <CardDescription>Discover personalized learning recommendations for your career goals</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-transparent" variant="outline">
                Explore Paths
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="departments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="skills">Recent Skills</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="departments" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((dept) => (
                <Link key={dept.id} href={`/department/${dept.slug}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {dept.name}
                        <ChevronRight className="h-4 w-4" />
                      </CardTitle>
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
              ))}
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4">
            <div className="space-y-4">
              {recentSkills.map((skill) => (
                <Card key={skill.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{skill.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{skill.description}</p>
                        <div className="flex items-center mt-2 space-x-2">
                          <Badge variant="secondary">{skill.category}</Badge>
                          <div className="flex items-center">
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">Completed self-assessment for Frontend Development</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">Updated skill rating for React Development</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">Compared skills with Senior Developer role</p>
                      <p className="text-xs text-gray-500">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
