"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, FileText } from "lucide-react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface Role {
  id: number
  name: string
  code: string
  level: number
  department_name: string
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
  isDemoMode: boolean
}

export function CompareClient({ isDemoMode }: Props) {
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole1, setSelectedRole1] = useState<Role | null>(null)
  const [selectedRole2, setSelectedRole2] = useState<Role | null>(null)
  const [role1Skills, setRole1Skills] = useState<Skill[]>([])
  const [role2Skills, setRole2Skills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isLoadingRoles, setIsLoadingRoles] = useState(true)

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    setIsLoadingRoles(true)
    try {
      const response = await fetch("/api/roles")
      if (response.ok) {
        const data = await response.json()
        setRoles(data.roles || [])
      } else {
        console.error("Failed to fetch roles")
        setRoles([])
      }
    } catch (error) {
      console.error("Error fetching roles:", error)
      setRoles([])
    } finally {
      setIsLoadingRoles(false)
    }
  }

  const fetchSkills = async (roleId: number) => {
    try {
      const response = await fetch(`/api/role-skills?roleId=${roleId}`)
      if (response.ok) {
        return await response.json()
      }
      return []
    } catch (error) {
      console.error("Error fetching skills:", error)
      return []
    }
  }

  const handleRole1Change = async (roleId: string) => {
    const role = roles.find((r) => r.id === Number.parseInt(roleId))
    if (role) {
      setSelectedRole1(role)
      setIsLoading(true)
      const skills = await fetchSkills(role.id)
      setRole1Skills(skills)
      setIsLoading(false)
    }
  }

  const handleRole2Change = async (roleId: string) => {
    const role = roles.find((r) => r.id === Number.parseInt(roleId))
    if (role) {
      setSelectedRole2(role)
      setIsLoading(true)
      const skills = await fetchSkills(role.id)
      setRole2Skills(skills)
      setIsLoading(false)
    }
  }

  const generatePDF = async () => {
    if (!selectedRole1 || !selectedRole2) return

    setIsGeneratingPDF(true)
    try {
      const element = document.getElementById("comparison-content")
      if (!element) return

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")

      // Add logo with correct aspect ratio (1384x216 = 6.4:1)
      const logoImg = new Image()
      logoImg.crossOrigin = "anonymous"
      logoImg.onload = () => {
        pdf.addImage(logoImg, "PNG", 10, 10, 64, 10) // 64px width, 10px height maintains 6.4:1 ratio

        // Add title
        pdf.setFontSize(16)
        pdf.text(`Role Comparison: ${selectedRole1.name} vs ${selectedRole2.name}`, 10, 30)

        // Add comparison content
        const imgWidth = 190
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        pdf.addImage(imgData, "PNG", 10, 40, imgWidth, imgHeight)

        pdf.save(`role-comparison-${selectedRole1.code}-vs-${selectedRole2.code}.pdf`)
        setIsGeneratingPDF(false)
      }
      logoImg.src = "/images/hs1-logo.png"
    } catch (error) {
      console.error("Error generating PDF:", error)
      setIsGeneratingPDF(false)
    }
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

  // Get all unique skills from both roles
  const allSkills = new Map<string, { skill: Skill; inRole1: boolean; inRole2: boolean }>()

  role1Skills.forEach((skill) => {
    allSkills.set(skill.skill_name, {
      skill,
      inRole1: true,
      inRole2: false,
    })
  })

  role2Skills.forEach((skill) => {
    const existing = allSkills.get(skill.skill_name)
    if (existing) {
      existing.inRole2 = true
      // Use the skill from role2 if it has more complete data
      if (skill.skill_description && !existing.skill.skill_description) {
        existing.skill = skill
      }
    } else {
      allSkills.set(skill.skill_name, {
        skill,
        inRole1: false,
        inRole2: true,
      })
    }
  })

  // Group skills by category
  const skillsByCategory = Array.from(allSkills.values()).reduce(
    (acc, { skill, inRole1, inRole2 }) => {
      if (!acc[skill.category_name]) {
        acc[skill.category_name] = {
          color: skill.category_color,
          skills: [],
        }
      }
      acc[skill.category_name].skills.push({ skill, inRole1, inRole2 })
      return acc
    },
    {} as Record<string, { color: string; skills: Array<{ skill: Skill; inRole1: boolean; inRole2: boolean }> }>,
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Database Status Banner */}
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

      {/* Role Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Role 1</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={handleRole1Change}>
              <SelectTrigger>
                <SelectValue placeholder="Select first role" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingRoles ? (
                  <SelectItem value="" disabled>
                    Loading roles...
                  </SelectItem>
                ) : roles.length > 0 ? (
                  roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.department_name} - {role.name} ({role.code})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    No roles available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {selectedRole1 && (
              <div className="mt-4">
                <Badge variant="outline">{selectedRole1.code}</Badge>
                <h3 className="font-semibold mt-2">{selectedRole1.name}</h3>
                <p className="text-sm text-gray-600">Level {selectedRole1.level}</p>
                <p className="text-sm text-gray-600">{selectedRole1.department_name}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role 2</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={handleRole2Change}>
              <SelectTrigger>
                <SelectValue placeholder="Select second role" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingRoles ? (
                  <SelectItem value="" disabled>
                    Loading roles...
                  </SelectItem>
                ) : roles.length > 0 ? (
                  roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.department_name} - {role.name} ({role.code})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    No roles available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {selectedRole2 && (
              <div className="mt-4">
                <Badge variant="outline">{selectedRole2.code}</Badge>
                <h3 className="font-semibold mt-2">{selectedRole2.name}</h3>
                <p className="text-sm text-gray-600">Level {selectedRole2.level}</p>
                <p className="text-sm text-gray-600">{selectedRole2.department_name}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Export Button */}
      {selectedRole1 && selectedRole2 && (
        <div className="mb-6 flex justify-end">
          <Button onClick={generatePDF} disabled={isGeneratingPDF} className="flex items-center gap-2">
            {isGeneratingPDF ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export PDF
              </>
            )}
          </Button>
        </div>
      )}

      {/* Comparison Content */}
      {selectedRole1 && selectedRole2 && (
        <div id="comparison-content">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading comparison...</div>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(skillsByCategory).map(([categoryName, categoryData]) => (
                <Card key={categoryName}>
                  <CardHeader>
                    <CardTitle className={`text-${categoryData.color}-700`}>{categoryName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {categoryData.skills.map(({ skill, inRole1, inRole2 }) => (
                        <div key={skill.skill_name} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">{skill.skill_name}</h4>
                            <div className="flex gap-2">
                              {inRole1 && (
                                <Badge variant="outline" className="text-xs">
                                  {selectedRole1.code}
                                </Badge>
                              )}
                              {inRole2 && (
                                <Badge variant="outline" className="text-xs">
                                  {selectedRole2.code}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                              className={`p-3 rounded ${inRole1 ? getColorClasses(categoryData.color) : "bg-gray-50"}`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-sm">{selectedRole1.name}</span>
                                {inRole1 && (
                                  <Badge variant="outline" className="text-xs">
                                    {role1Skills.find((s) => s.skill_name === skill.skill_name)?.level || "N/A"}
                                  </Badge>
                                )}
                              </div>
                              {inRole1 ? (
                                <p className="text-sm">
                                  {role1Skills.find((s) => s.skill_name === skill.skill_name)
                                    ?.demonstration_description || "No description available"}
                                </p>
                              ) : (
                                <p className="text-sm text-gray-400 italic">Not required for this role</p>
                              )}
                            </div>

                            <div
                              className={`p-3 rounded ${inRole2 ? getColorClasses(categoryData.color) : "bg-gray-50"}`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-sm">{selectedRole2.name}</span>
                                {inRole2 && (
                                  <Badge variant="outline" className="text-xs">
                                    {role2Skills.find((s) => s.skill_name === skill.skill_name)?.level || "N/A"}
                                  </Badge>
                                )}
                              </div>
                              {inRole2 ? (
                                <p className="text-sm">
                                  {role2Skills.find((s) => s.skill_name === skill.skill_name)
                                    ?.demonstration_description || "No description available"}
                                </p>
                              ) : (
                                <p className="text-sm text-gray-400 italic">Not required for this role</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No Selection Message */}
      {(!selectedRole1 || !selectedRole2) && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-400 text-lg mb-2">Select two roles to compare</div>
          <div className="text-gray-500 text-sm">
            Choose roles from the dropdowns above to see their skill comparison.
          </div>
        </div>
      )}
    </div>
  )
}
