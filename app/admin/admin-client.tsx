"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  Settings,
  Database,
  FileText,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  LogOut,
  ArrowLeft,
} from "lucide-react"
import type { User } from "@/lib/auth"

interface AdminClientProps {
  user: User
}

interface Skill {
  id: number
  name: string
  category: string
  description: string
  level: string
}

export default function AdminClient({ user }: AdminClientProps) {
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Form states
  const [newSkill, setNewSkill] = useState({
    name: "",
    category: "",
    description: "",
    level: "beginner",
  })

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/skills")
      if (response.ok) {
        const data = await response.json()
        setSkills(data)
      } else {
        setError("Failed to fetch skills")
      }
    } catch (error) {
      console.error("Error fetching skills:", error)
      setError("Error fetching skills")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSkill),
      })

      if (response.ok) {
        setSuccess("Skill created successfully")
        setNewSkill({ name: "", category: "", description: "", level: "beginner" })
        fetchSkills()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create skill")
      }
    } catch (error) {
      console.error("Error creating skill:", error)
      setError("Error creating skill")
    }
  }

  const handleDeleteSkill = async (id: number) => {
    if (!confirm("Are you sure you want to delete this skill?")) return

    try {
      const response = await fetch(`/api/skills/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSuccess("Skill deleted successfully")
        fetchSkills()
      } else {
        setError("Failed to delete skill")
      }
    } catch (error) {
      console.error("Error deleting skill:", error)
      setError("Error deleting skill")
    }
  }

  const handleExportSkills = async () => {
    try {
      const response = await fetch("/api/skills/export")
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "skills-export.csv"
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        setSuccess("Skills exported successfully")
      } else {
        setError("Failed to export skills")
      }
    } catch (error) {
      console.error("Error exporting skills:", error)
      setError("Error exporting skills")
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
      console.error("Logout error:", error)
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
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-white hover:bg-brand-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <Image src="/images/hs1-logo.png" alt="Henry Schein One" width={32} height={32} className="h-8 w-auto" />
              <span className="text-white text-lg font-semibold">Admin Panel</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-white text-sm">
                <span>{user.name}</span>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  Admin
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage skills, users, and system configuration.</p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Admin Tabs */}
        <Tabs defaultValue="skills" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="skills">Skills Management</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Skills Management */}
          <TabsContent value="skills" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create New Skill */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Create New Skill
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateSkill} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Skill Name</label>
                      <Input
                        value={newSkill.name}
                        onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                        placeholder="Enter skill name"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <Input
                        value={newSkill.category}
                        onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                        placeholder="Enter category"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={newSkill.description}
                        onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                        placeholder="Enter description"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Level</label>
                      <Select
                        value={newSkill.level}
                        onValueChange={(value) => setNewSkill({ ...newSkill, level: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full">
                      Create Skill
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Skills Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Skills Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={handleExportSkills} variant="outline" className="w-full bg-transparent">
                    <Download className="w-4 h-4 mr-2" />
                    Export Skills (CSV)
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Skills
                  </Button>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">Total Skills: {skills.length}</p>
                    <p className="text-sm text-gray-600">Categories: {new Set(skills.map((s) => s.category)).size}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Skills List */}
            <Card>
              <CardHeader>
                <CardTitle>All Skills</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p>Loading skills...</p>
                ) : (
                  <div className="space-y-4">
                    {skills.map((skill) => (
                      <div key={skill.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{skill.name}</h3>
                          <p className="text-sm text-gray-600">{skill.category}</p>
                          <p className="text-sm text-gray-500">{skill.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{skill.level}</Badge>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteSkill(skill.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">User management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">System configuration options coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Reports & Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Reports and analytics coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
