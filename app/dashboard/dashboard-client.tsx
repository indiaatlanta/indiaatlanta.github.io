"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Target, BookOpen, Building2, User, LogOut, Settings, BarChart3 } from "lucide-react"
import { AdminButton } from "@/components/admin-button"
import type { User as UserType } from "@/lib/auth"

interface DashboardStats {
  totalRoles: number
  totalSkills: number
  totalUsers: number
}

interface Department {
  slug: string
  name: string
  description: string
  roleCount: number
}

interface DashboardClientProps {
  user: UserType
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalRoles: 0,
    totalSkills: 0,
    totalUsers: 0,
  })
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Mock data for now - in a real app, you'd fetch from APIs
        const mockStats = {
          totalRoles: 15,
          totalSkills: 85,
          totalUsers: 24,
        }

        const mockDepartments = [
          {
            slug: "engineering",
            name: "Engineering",
            description: "Software development and technical roles",
            roleCount: 6,
          },
          {
            slug: "product",
            name: "Product Management",
            description: "Product strategy and management roles",
            roleCount: 4,
          },
          {
            slug: "design",
            name: "Design",
            description: "UX/UI design and creative roles",
            roleCount: 3,
          },
          {
            slug: "data",
            name: "Data & Analytics",
            description: "Data science and analytics roles",
            roleCount: 2,
          },
        ]

        setStats(mockStats)
        setDepartments(mockDepartments)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

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
      console.error("Logout error:", error)
      // Force redirect even if logout fails
      window.location.href = "/login"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-brand-800 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/images/hs1-logo.png" alt="Henry Schein One" width={32} height={32} className="h-8 w-auto" />
              <span className="text-white text-lg font-semibold">HS1 Careers Matrix</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-white text-sm">
                <User className="w-4 h-4" />
                <span>{user.name}</span>
                <Badge variant="secondary" className="bg-brand-100 text-brand-800">
                  {user.role}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-brand-700">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h1>
          <p className="text-gray-600">
            Explore career paths, assess your skills, and plan your professional development journey.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Career Roles</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRoles}</div>
              <p className="text-xs text-muted-foreground">Available career paths</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skills Tracked</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSkills}</div>
              <p className="text-xs text-muted-foreground">Across all departments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Using the platform</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Self Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Evaluate your current skills and identify growth opportunities.</p>
              <Link href="/self-review">
                <Button className="w-full bg-brand-600 hover:bg-brand-700">Start Assessment</Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Role Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Compare different roles to understand career progression paths.</p>
              <Link href="/compare">
                <Button variant="outline" className="w-full bg-transparent">
                  Compare Roles
                </Button>
              </Link>
            </CardContent>
          </Card>
          {user.role === "admin" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Admin Panel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Manage skills, roles, and system configuration.</p>
                <Link href="/admin">
                  <Button variant="outline" className="w-full bg-transparent">
                    Open Admin Panel
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Departments */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Browse by Department</h2>
            {user.role === "admin" && <AdminButton />}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map((dept) => (
              <Link key={dept.slug} href={`/department/${dept.slug}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      {dept.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-3">{dept.description}</p>
                    <Badge variant="secondary">
                      {dept.roleCount} {dept.roleCount === 1 ? "role" : "roles"}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Welcome to HS1 Careers Matrix!</p>
                  <p className="text-xs text-gray-500">Get started by taking a self-assessment</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Explore career paths in your department</p>
                  <p className="text-xs text-gray-500">Discover new opportunities for growth</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
