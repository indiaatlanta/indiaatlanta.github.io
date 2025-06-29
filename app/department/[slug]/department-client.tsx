"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Users, Target, Search, Filter, AlertCircle, ArrowLeft, FileText, Table } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Department {
  id: number
  name: string
  slug: string
  description: string
  color: string
}

interface Role {
  id: number
  title: string
  level: string
  description: string
  full_description?: string
  department_name: string
  department_slug: string
  department_color: string
}

interface Skill {
  id: number
  name: string
  category: string
  description: string
  roles?: Record<number, { required_level: number; is_required: boolean }>
}

interface DepartmentClientProps {
  department: Department
}

export default function DepartmentClient({ department }: DepartmentClientProps) {
  const [roles, setRoles] = useState<Role[]>([])
  const [skillsMatrix, setSkillsMatrix] = useState<Record<string, Record<number, Skill>>>({})
  const [rolesData, setRolesData] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [roleSkills, setRoleSkills] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  useEffect(() => {
    fetchData()
  }, [department.slug])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch roles
      const rolesResponse = await fetch(`/api/departments/${department.slug}/roles`)
      if (!rolesResponse.ok) {
        throw new Error("Failed to fetch roles")
      }
      const rolesData = await rolesResponse.json()
      setRoles(rolesData.roles || [])

      // Fetch skills matrix
      const skillsResponse = await fetch(`/api/role-skills?departmentSlug=${department.slug}`)
      if (!skillsResponse.ok) {
        throw new Error("Failed to fetch skills matrix")
      }
      const skillsData = await skillsResponse.json()
      setSkillsMatrix(skillsData.skillsMatrix || {})
      setRolesData(skillsData.roles || [])
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const fetchRoleSkills = async (roleId: number) => {
    try {
      const response = await fetch(`/api/role-skills?roleId=${roleId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch role skills")
      }
      const data = await response.json()
      setRoleSkills(data.roleSkills || [])
    } catch (err) {
      console.error("Error fetching role skills:", err)
      setRoleSkills([])
    }
  }

  const handleRoleClick = (role: Role) => {
    setSelectedRole(role)
    fetchRoleSkills(role.id)
  }

  const exportSkillsMatrix = async (format: "csv" | "pdf") => {
    try {
      const response = await fetch(`/api/skills/export?departmentSlug=${department.slug}&format=${format}`)
      if (!response.ok) {
        throw new Error(`Failed to export ${format.toUpperCase()}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `${department.name}-skills-matrix.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error(`Error exporting ${format}:`, err)
    }
  }

  // Filter skills based on search and category
  const filteredSkillsMatrix = Object.entries(skillsMatrix).reduce(
    (acc, [category, skills]) => {
      if (categoryFilter !== "all" && category !== categoryFilter) {
        return acc
      }

      const filteredSkills = Object.entries(skills).reduce(
        (skillAcc, [skillId, skill]) => {
          if (searchTerm && !skill.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            return skillAcc
          }
          skillAcc[skillId] = skill
          return skillAcc
        },
        {} as Record<string, Skill>,
      )

      if (Object.keys(filteredSkills).length > 0) {
        acc[category] = filteredSkills
      }
      return acc
    },
    {} as Record<string, Record<string, Skill>>,
  )

  const categories = Object.keys(skillsMatrix)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
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
              <Image src="/images/hs1-logo.png" alt="Henry Schein One" width={40} height={40} className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Career Matrix</h1>
                <p className="text-sm text-gray-500">Skills & Career Development</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8 h-12">
            <Link href="/" className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Departments</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Department Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: department.color }} />
            <h1 className="text-3xl font-bold text-gray-900">{department.name}</h1>
          </div>
          <p className="text-gray-600 text-lg">{department.description}</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs defaultValue="roles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="roles" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Roles ({roles.length})</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Skills Matrix</span>
            </TabsTrigger>
          </TabsList>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-6">
            {roles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role) => (
                  <Card
                    key={role.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleRoleClick(role)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {role.level}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{role.title}</CardTitle>
                      <CardDescription className="text-sm">{role.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="ghost" className="w-full justify-between p-0">
                        <span>View Details</span>
                        <span>→</span>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Roles Available</h3>
                <p className="text-gray-600">No roles found for this department.</p>
              </div>
            )}
          </TabsContent>

          {/* Skills Matrix Tab */}
          <TabsContent value="skills" className="space-y-6">
            {/* Filters and Export */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportSkillsMatrix("csv")}
                  className="flex items-center space-x-2"
                >
                  <Table className="w-4 h-4" />
                  <span>Export CSV</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportSkillsMatrix("pdf")}
                  className="flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Export PDF</span>
                </Button>
              </div>
            </div>

            {/* Skills Matrix */}
            {Object.keys(filteredSkillsMatrix).length > 0 ? (
              <div className="space-y-8">
                {Object.entries(filteredSkillsMatrix).map(([category, skills]) => (
                  <div key={category}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{category}</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              Skill
                            </th>
                            {rolesData.map((role) => (
                              <th
                                key={role.id}
                                className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
                              >
                                {role.title}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {Object.values(skills).map((skill) => (
                            <tr key={skill.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r">
                                <div>
                                  <div className="font-medium">{skill.name}</div>
                                  <div className="text-xs text-gray-500">{skill.description}</div>
                                </div>
                              </td>
                              {rolesData.map((role) => {
                                const requirement = skill.roles?.[role.id]
                                return (
                                  <td key={role.id} className="px-4 py-3 text-center">
                                    {requirement ? (
                                      <Badge
                                        variant={requirement.is_required ? "default" : "secondary"}
                                        className="text-xs"
                                      >
                                        Level {requirement.required_level}
                                      </Badge>
                                    ) : (
                                      <span className="text-gray-300">-</span>
                                    )}
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Skills Found</h3>
                <p className="text-gray-600">
                  {searchTerm || categoryFilter !== "all"
                    ? "No skills match your current filters."
                    : "No skills matrix available for this department."}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Role Details Modal */}
        {selectedRole && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedRole.title}</h2>
                    <Badge variant="outline" className="mt-2">
                      {selectedRole.level}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedRole(null)}>
                    ✕
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600">{selectedRole.full_description || selectedRole.description}</p>
                  </div>

                  {roleSkills.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Required Skills</h3>
                      <div className="space-y-2">
                        {roleSkills.map((skill) => (
                          <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900">{skill.skill_name}</div>
                              <div className="text-sm text-gray-500">{skill.skill_description}</div>
                            </div>
                            <Badge variant={skill.is_required ? "default" : "secondary"}>
                              Level {skill.required_level}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
