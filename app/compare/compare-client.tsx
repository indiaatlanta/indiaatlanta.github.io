"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, GitCompare, Users, Target, BookOpen, ArrowRight } from "lucide-react"
import jsPDF from "jspdf"

interface Role {
  id: number
  title: string
  department: string
  level: string
  description: string
}

interface Skill {
  id: number
  name: string
  category: string
  level: number
  description: string
}

interface ComparisonData {
  role1: Role | null
  role2: Role | null
  role1Skills: Skill[]
  role2Skills: Skill[]
}

export default function CompareClient() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [comparison, setComparison] = useState<ComparisonData>({
    role1: null,
    role2: null,
    role1Skills: [],
    role2Skills: [],
  })

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/roles")
      if (response.ok) {
        const data = await response.json()
        setRoles(data)
      } else {
        console.error("Failed to fetch roles")
        // Fallback to mock data
        setRoles([
          {
            id: 1,
            title: "Software Engineer I",
            department: "Engineering",
            level: "Junior",
            description: "Entry-level software development role",
          },
          {
            id: 2,
            title: "Software Engineer II",
            department: "Engineering",
            level: "Mid",
            description: "Mid-level software development role",
          },
          {
            id: 3,
            title: "Senior Software Engineer",
            department: "Engineering",
            level: "Senior",
            description: "Senior software development role",
          },
          {
            id: 4,
            title: "Product Manager",
            department: "Product",
            level: "Mid",
            description: "Product strategy and management role",
          },
          {
            id: 5,
            title: "Senior Product Manager",
            department: "Product",
            level: "Senior",
            description: "Senior product strategy and management role",
          },
        ])
      }
    } catch (error) {
      console.error("Error fetching roles:", error)
      // Fallback to mock data
      setRoles([
        {
          id: 1,
          title: "Software Engineer I",
          department: "Engineering",
          level: "Junior",
          description: "Entry-level software development role",
        },
        {
          id: 2,
          title: "Software Engineer II",
          department: "Engineering",
          level: "Mid",
          description: "Mid-level software development role",
        },
        {
          id: 3,
          title: "Senior Software Engineer",
          department: "Engineering",
          level: "Senior",
          description: "Senior software development role",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchRoleSkills = async (roleId: number) => {
    try {
      const response = await fetch(`/api/role-skills?roleId=${roleId}`)
      if (response.ok) {
        const data = await response.json()
        return data
      } else {
        console.error("Failed to fetch role skills")
        return []
      }
    } catch (error) {
      console.error("Error fetching role skills:", error)
      return []
    }
  }

  const handleRoleSelect = async (roleId: string, position: "role1" | "role2") => {
    const selectedRole = roles.find((role) => role.id === Number.parseInt(roleId))
    if (!selectedRole) return

    const skills = await fetchRoleSkills(selectedRole.id)

    setComparison((prev) => ({
      ...prev,
      [position]: selectedRole,
      [`${position}Skills`]: skills,
    }))
  }

  const exportToPDF = () => {
    const doc = new jsPDF()

    // Header
    doc.setFontSize(20)
    doc.text("Henry Schein One - Role Comparison", 20, 30)

    doc.setFontSize(12)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45)

    let yPosition = 60

    if (comparison.role1 && comparison.role2) {
      // Role 1
      doc.setFontSize(16)
      doc.text(`Role 1: ${comparison.role1.title}`, 20, yPosition)
      yPosition += 10

      doc.setFontSize(12)
      doc.text(`Department: ${comparison.role1.department}`, 20, yPosition)
      yPosition += 8
      doc.text(`Level: ${comparison.role1.level}`, 20, yPosition)
      yPosition += 8
      doc.text(`Description: ${comparison.role1.description}`, 20, yPosition)
      yPosition += 15

      // Role 1 Skills
      doc.setFontSize(14)
      doc.text("Skills:", 20, yPosition)
      yPosition += 10

      comparison.role1Skills.forEach((skill) => {
        doc.setFontSize(10)
        doc.text(`• ${skill.name} (${skill.category}) - Level ${skill.level}`, 25, yPosition)
        yPosition += 6
        if (yPosition > 270) {
          doc.addPage()
          yPosition = 20
        }
      })

      yPosition += 10

      // Role 2
      doc.setFontSize(16)
      doc.text(`Role 2: ${comparison.role2.title}`, 20, yPosition)
      yPosition += 10

      doc.setFontSize(12)
      doc.text(`Department: ${comparison.role2.department}`, 20, yPosition)
      yPosition += 8
      doc.text(`Level: ${comparison.role2.level}`, 20, yPosition)
      yPosition += 8
      doc.text(`Description: ${comparison.role2.description}`, 20, yPosition)
      yPosition += 15

      // Role 2 Skills
      doc.setFontSize(14)
      doc.text("Skills:", 20, yPosition)
      yPosition += 10

      comparison.role2Skills.forEach((skill) => {
        doc.setFontSize(10)
        doc.text(`• ${skill.name} (${skill.category}) - Level ${skill.level}`, 25, yPosition)
        yPosition += 6
        if (yPosition > 270) {
          doc.addPage()
          yPosition = 20
        }
      })
    }

    doc.save("role-comparison.pdf")
  }

  const getUniqueSkills = (skills1: Skill[], skills2: Skill[]) => {
    const allSkills = [...skills1, ...skills2]
    const uniqueSkills = allSkills.reduce((acc, skill) => {
      const existing = acc.find((s) => s.name === skill.name)
      if (!existing) {
        acc.push(skill)
      }
      return acc
    }, [] as Skill[])
    return uniqueSkills.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))
  }

  const getSkillLevel = (skillName: string, skills: Skill[]) => {
    const skill = skills.find((s) => s.name === skillName)
    return skill ? skill.level : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <GitCompare className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Compare Roles</h1>
          </div>
          <p className="text-lg text-gray-600">
            Compare different roles to understand career progression paths and skill requirements.
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Role 1
              </CardTitle>
              <CardDescription>Select the first role to compare</CardDescription>
            </CardHeader>
            <CardContent>
              <Select onValueChange={(value) => handleRoleSelect(value, "role1")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.title} - {role.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {comparison.role1 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-lg">{comparison.role1.title}</h3>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{comparison.role1.department}</Badge>
                    <Badge variant="outline">{comparison.role1.level}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{comparison.role1.description}</p>
                  <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                    <Target className="w-4 h-4" />
                    <span>{comparison.role1Skills.length} skills required</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Role 2
              </CardTitle>
              <CardDescription>Select the second role to compare</CardDescription>
            </CardHeader>
            <CardContent>
              <Select onValueChange={(value) => handleRoleSelect(value, "role2")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.title} - {role.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {comparison.role2 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-lg">{comparison.role2.title}</h3>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{comparison.role2.department}</Badge>
                    <Badge variant="outline">{comparison.role2.level}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{comparison.role2.description}</p>
                  <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                    <Target className="w-4 h-4" />
                    <span>{comparison.role2Skills.length} skills required</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Comparison Results */}
        {comparison.role1 && comparison.role2 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Skills Comparison
                  </CardTitle>
                  <CardDescription>Detailed comparison of skills required for both roles</CardDescription>
                </div>
                <Button onClick={exportToPDF} className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Skills Matrix */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Skill</th>
                        <th className="text-left p-3 font-semibold">Category</th>
                        <th className="text-center p-3 font-semibold">{comparison.role1.title}</th>
                        <th className="text-center p-3 font-semibold">{comparison.role2.title}</th>
                        <th className="text-center p-3 font-semibold">Difference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getUniqueSkills(comparison.role1Skills, comparison.role2Skills).map((skill, index) => {
                        const role1Level = getSkillLevel(skill.name, comparison.role1Skills)
                        const role2Level = getSkillLevel(skill.name, comparison.role2Skills)
                        const difference = role2Level - role1Level

                        return (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{skill.name}</td>
                            <td className="p-3">
                              <Badge variant="outline" className="text-xs">
                                {skill.category}
                              </Badge>
                            </td>
                            <td className="p-3 text-center">
                              {role1Level > 0 ? (
                                <Badge variant="secondary">Level {role1Level}</Badge>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              {role2Level > 0 ? (
                                <Badge variant="secondary">Level {role2Level}</Badge>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              {difference > 0 && (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  +{difference}
                                </Badge>
                              )}
                              {difference < 0 && (
                                <Badge variant="default" className="bg-red-100 text-red-800">
                                  {difference}
                                </Badge>
                              )}
                              {difference === 0 && role1Level > 0 && role2Level > 0 && (
                                <Badge variant="outline">Same</Badge>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{comparison.role1Skills.length}</div>
                    <div className="text-sm text-gray-600">Skills in {comparison.role1.title}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{comparison.role2Skills.length}</div>
                    <div className="text-sm text-gray-600">Skills in {comparison.role2.title}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {getUniqueSkills(comparison.role1Skills, comparison.role2Skills).length}
                    </div>
                    <div className="text-sm text-gray-600">Total Unique Skills</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!comparison.role1 && !comparison.role2 && (
          <Card>
            <CardContent className="text-center py-12">
              <GitCompare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Roles to Compare</h3>
              <p className="text-gray-600 mb-6">
                Choose two roles from the dropdowns above to see a detailed comparison of their skill requirements.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <ArrowRight className="w-4 h-4" />
                <span>Start by selecting your first role</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
