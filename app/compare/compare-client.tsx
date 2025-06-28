"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Download } from "lucide-react"
import jsPDF from "jspdf"

interface Department {
  id: number
  name: string
  slug: string
}

interface Role {
  id: number
  name: string
  code: string
  level: number
  department_id: number
}

interface Skill {
  id: number
  skill_name: string
  level: string
  demonstration_description: string
  skill_description: string
  category_name: string
  category_color: string
}

interface Props {
  departments: Department[]
  roles: Role[]
  isDemoMode: boolean
}

export function CompareClient({ departments, roles, isDemoMode }: Props) {
  const [selectedRole1, setSelectedRole1] = useState<string>("")
  const [selectedRole2, setSelectedRole2] = useState<string>("")
  const [role1Skills, setRole1Skills] = useState<Skill[]>([])
  const [role2Skills, setRole2Skills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [comparisonData, setComparisonData] = useState<any[]>([])

  const role1 = roles.find((r) => r.id.toString() === selectedRole1)
  const role2 = roles.find((r) => r.id.toString() === selectedRole2)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const role1Param = urlParams.get("role1")
    const role2Param = urlParams.get("role2")

    if (role1Param) setSelectedRole1(role1Param)
    if (role2Param) setSelectedRole2(role2Param)
  }, [])

  const fetchSkills = async (roleId: string) => {
    try {
      const response = await fetch(`/api/role-skills?roleId=${roleId}`)
      return response.ok ? await response.json() : []
    } catch (error) {
      console.error("Error fetching skills:", error)
      return []
    }
  }

  const handleCompare = async () => {
    if (!selectedRole1 || !selectedRole2) return

    setIsLoading(true)
    try {
      const [skills1, skills2] = await Promise.all([fetchSkills(selectedRole1), fetchSkills(selectedRole2)])

      setRole1Skills(skills1)
      setRole2Skills(skills2)

      // Create comparison data
      const skillsMap = new Map()

      skills1.forEach((skill: Skill) => {
        skillsMap.set(skill.skill_name, {
          skill_name: skill.skill_name,
          category_name: skill.category_name,
          category_color: skill.category_color,
          skill_description: skill.skill_description,
          role1: {
            level: skill.level,
            description: skill.demonstration_description,
          },
          role2: null,
        })
      })

      skills2.forEach((skill: Skill) => {
        if (skillsMap.has(skill.skill_name)) {
          skillsMap.get(skill.skill_name).role2 = {
            level: skill.level,
            description: skill.demonstration_description,
          }
        } else {
          skillsMap.set(skill.skill_name, {
            skill_name: skill.skill_name,
            category_name: skill.category_name,
            category_color: skill.category_color,
            skill_description: skill.skill_description,
            role1: null,
            role2: {
              level: skill.level,
              description: skill.demonstration_description,
            },
          })
        }
      })

      const sortedComparison = Array.from(skillsMap.values()).sort((a, b) => {
        if (a.category_name !== b.category_name) {
          return a.category_name.localeCompare(b.category_name)
        }
        return a.skill_name.localeCompare(b.skill_name)
      })

      setComparisonData(sortedComparison)
    } catch (error) {
      console.error("Error comparing roles:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generatePDF = () => {
    if (!role1 || !role2 || comparisonData.length === 0) return

    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 20

    // Add logo with correct aspect ratio (1384x216 = 6.4:1)
    const logoWidth = 64
    const logoHeight = 10
    pdf.addImage("/images/hs1-logo.png", "PNG", margin, 10, logoWidth, logoHeight)

    // Title
    pdf.setFontSize(18)
    pdf.setFont("helvetica", "bold")
    pdf.text("Role Comparison Report", margin, 35)

    // Role information
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "normal")
    pdf.text(`${role1.name} (${role1.code}) vs ${role2.name} (${role2.code})`, margin, 45)

    let yPosition = 60

    // Group by category
    const skillsByCategory = comparisonData.reduce(
      (acc, skill) => {
        if (!acc[skill.category_name]) {
          acc[skill.category_name] = []
        }
        acc[skill.category_name].push(skill)
        return acc
      },
      {} as Record<string, any[]>,
    )

    Object.entries(skillsByCategory).forEach(([categoryName, skills]) => {
      // Category header
      pdf.setFontSize(14)
      pdf.setFont("helvetica", "bold")
      pdf.text(categoryName, margin, yPosition)
      yPosition += 10

      skills.forEach((skill) => {
        // Check if we need a new page
        if (yPosition > 250) {
          pdf.addPage()
          yPosition = 20
        }

        // Skill name
        pdf.setFontSize(11)
        pdf.setFont("helvetica", "bold")
        pdf.text(skill.skill_name, margin, yPosition)
        yPosition += 8

        // Role 1
        pdf.setFontSize(9)
        pdf.setFont("helvetica", "normal")
        if (skill.role1) {
          pdf.text(`${role1.code}: ${skill.role1.level} - ${skill.role1.description}`, margin + 5, yPosition)
        } else {
          pdf.text(`${role1.code}: Not required`, margin + 5, yPosition)
        }
        yPosition += 6

        // Role 2
        if (skill.role2) {
          pdf.text(`${role2.code}: ${skill.role2.level} - ${skill.role2.description}`, margin + 5, yPosition)
        } else {
          pdf.text(`${role2.code}: Not required`, margin + 5, yPosition)
        }
        yPosition += 10
      })

      yPosition += 5
    })

    pdf.save(`role-comparison-${role1.code}-vs-${role2.code}.pdf`)
  }

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-50 text-blue-900 border-blue-200",
      green: "bg-green-50 text-green-900 border-green-200",
      purple: "bg-purple-50 text-purple-900 border-purple-200",
      indigo: "bg-indigo-50 text-indigo-900 border-indigo-200",
      orange: "bg-orange-50 text-orange-900 border-orange-200",
    }
    return colorMap[color] || "bg-gray-50 text-gray-900 border-gray-200"
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {isDemoMode && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-blue-800 text-sm font-medium">Demo Mode</span>
          </div>
          <p className="text-blue-700 text-sm mt-1">
            Running in preview mode. Database features are simulated for demonstration purposes.
          </p>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Compare Roles</h1>
        <p className="text-gray-600">Compare skills and requirements between different roles.</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select Roles to Compare</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Role</label>
              <Select value={selectedRole1} onValueChange={setSelectedRole1}>
                <SelectTrigger>
                  <SelectValue placeholder="Select first role" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => {
                    const deptRoles = roles.filter((role) => role.department_id === dept.id)
                    if (deptRoles.length === 0) return null

                    return (
                      <div key={dept.id}>
                        <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          {dept.name}
                        </div>
                        {deptRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.name} ({role.code})
                          </SelectItem>
                        ))}
                      </div>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Second Role</label>
              <Select value={selectedRole2} onValueChange={setSelectedRole2}>
                <SelectTrigger>
                  <SelectValue placeholder="Select second role" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => {
                    const deptRoles = roles.filter((role) => role.department_id === dept.id)
                    if (deptRoles.length === 0) return null

                    return (
                      <div key={dept.id}>
                        <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          {dept.name}
                        </div>
                        {deptRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.name} ({role.code})
                          </SelectItem>
                        ))}
                      </div>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleCompare} disabled={!selectedRole1 || !selectedRole2 || isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Comparing...
              </>
            ) : (
              "Compare Roles"
            )}
          </Button>
        </CardContent>
      </Card>

      {comparisonData.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Comparison: {role1?.name} vs {role2?.name}
            </CardTitle>
            <Button onClick={generatePDF} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(
                comparisonData.reduce(
                  (acc, skill) => {
                    if (!acc[skill.category_name]) {
                      acc[skill.category_name] = { color: skill.category_color, skills: [] }
                    }
                    acc[skill.category_name].skills.push(skill)
                    return acc
                  },
                  {} as Record<string, { color: string; skills: any[] }>,
                ),
              ).map(([categoryName, categoryData]) => (
                <div key={categoryName}>
                  <h3 className={`text-lg font-semibold mb-4 border-b pb-2 text-${categoryData.color}-700`}>
                    {categoryName}
                  </h3>
                  <div className="space-y-4">
                    {categoryData.skills.map((skill) => (
                      <div key={skill.skill_name} className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">{skill.skill_name}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className={`p-3 rounded border ${getColorClasses(skill.category_color)}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">{role1?.code}</span>
                              {skill.role1 && (
                                <Badge variant="outline" className="text-xs">
                                  {skill.role1.level}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm">
                              {skill.role1 ? skill.role1.description : "This skill is not required for this role"}
                            </p>
                          </div>
                          <div className={`p-3 rounded border ${getColorClasses(skill.category_color)}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">{role2?.code}</span>
                              {skill.role2 && (
                                <Badge variant="outline" className="text-xs">
                                  {skill.role2.level}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm">
                              {skill.role2 ? skill.role2.description : "This skill is not required for this role"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
