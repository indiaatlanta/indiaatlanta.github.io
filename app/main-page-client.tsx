"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Settings, BarChart3, Users, BookOpen, LogOut } from "lucide-react"
import type { User as UserType } from "@/lib/auth"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface MainPageClientProps {
  user: UserType
}

export default function MainPageClient({ user }: MainPageClientProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout error:", error)
      setIsLoggingOut(false)
    }
  }

  const departments = [
    {
      name: "Engineering",
      slug: "engineering",
      description: "Software development and technical roles",
      skillCount: 45,
      color: "bg-blue-500",
    },
    {
      name: "Product Management",
      slug: "product-management",
      description: "Product strategy and management roles",
      skillCount: 32,
      color: "bg-green-500",
    },
    {
      name: "Design",
      slug: "design",
      description: "UX/UI design and creative roles",
      skillCount: 28,
      color: "bg-purple-500",
    },
    {
      name: "Data Science",
      slug: "data-science",
      description: "Analytics and data-driven roles",
      skillCount: 38,
      color: "bg-orange-500",
    },
    {
      name: "Marketing",
      slug: "marketing",
      description: "Marketing and growth roles",
      skillCount: 25,
      color: "bg-pink-500",
    },
    {
      name: "Sales",
      slug: "sales",
      description: "Sales and business development roles",
      skillCount: 22,
      color: "bg-indigo-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/images/henry-schein-one-logo.png"
                alt="Henry Schein One"
                width={200}
                height={60}
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">HS1 Careers Matrix</h1>
                <p className="text-sm text-gray-600">Skills assessment and career development</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-2">
                <User className="h-3 w-3" />
                {user.name} ({user.role})
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoggingOut}>
                <LogOut className="h-4 w-4 mr-2" />
                {isLoggingOut ? "Signing out..." : "Sign Out"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h2>
          <p className="text-gray-600 text-lg">
            Explore career paths, assess your skills, and plan your professional development.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/self-review">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Self Assessment</CardTitle>
                    <CardDescription>Evaluate your current skills</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/compare">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Role Comparison</CardTitle>
                    <CardDescription>Compare skills with target roles</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>

          {user.role === "admin" && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/admin">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Settings className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Admin Panel</CardTitle>
                      <CardDescription>Manage skills and system data</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Link>
            </Card>
          )}
        </div>

        {/* Departments */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Explore Departments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <Card key={dept.slug} className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href={`/department/${dept.slug}`}>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${dept.color}`} />
                      <CardTitle className="text-lg">{dept.name}</CardTitle>
                    </div>
                    <CardDescription className="mb-3">{dept.description}</CardDescription>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{dept.skillCount} skills</span>
                    </div>
                  </CardHeader>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Getting Started
            </CardTitle>
            <CardDescription>Tips to make the most of your HS1 Careers Matrix experience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <div>
                  <h4 className="font-medium">Complete your self-assessment</h4>
                  <p className="text-sm text-gray-600">
                    Start by evaluating your current skills to get personalized recommendations.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                <div>
                  <h4 className="font-medium">Explore department skills matrices</h4>
                  <p className="text-sm text-gray-600">
                    Browse different departments to understand skill requirements for various roles.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                <div>
                  <h4 className="font-medium">Compare with target roles</h4>
                  <p className="text-sm text-gray-600">
                    Use the comparison tool to identify skill gaps and create development plans.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
