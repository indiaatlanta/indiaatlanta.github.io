"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, FileText, CheckCircle, XCircle } from "lucide-react"
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
  isDemoMode?: boolean
}

export default function CompareClient({ isDemoMode = false }: Props) {
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole1, setSelectedRole1] = useState<Role | null>(null)
  const [selectedRole2, setSelectedRole2] = useState<Role | null>(null)
  const [skills1, setSkills1] = useState<Skill[]>([])
  const [skills2, setSkills2] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/roles")
      if (response.ok) {
        const data = await response.json()
        // Ensure we always have an array
        if (data && Array.isArray(data.roles)) {
          setRoles(data.roles)
        } else if (Array.isArray(data)) {
          setRoles(data)
        } else {
          // Fallback to demo data
          setRoles([
            { id: 1, name: "Junior Engineer", code: "E1", level: 1, department_name: "Engineering" },
            { id: 2, name: "Software Engineer", code: "E2", level: 2, department_name: "Engineering" },
            { id: 3, name: "Senior Engineer", code: "E3", level: 3, department_name: "Engineering" },
            { id: 4, name: "Lead Engineer", code: "E4", level: 4, department_name: "Engineering" },
            { id: 5, name: "Principal Engineer", code: "E5", level: 5, department_name: "Engineering" },
          ])
        }
      } else {
        // Fallback to demo data on error
        setRoles([
          { id: 1, name: "Junior Engineer", code: "E1", level: 1, department_name: "Engineering" },
          { id: 2, name: "Software Engineer", code: "E2", level: 2, department_name: "Engineering" },
          { id: 3, name: "Senior Engineer", code: "E3", level: 3, department_name: "Engineering" },
          { id: 4, name: "Lead Engineer", code: "E4", level: 4, department_name: "Engineering" },
          { id: 5, name: "Principal Engineer", code: "E5", level: 5, department_name: "Engineering" },
        ])
      }
    } catch (error) {
      console.error("Error fetching roles:", error)
      // Fallback to demo data on error
      setRoles([
        { id: 1, name: "Junior Engineer", code: "E1", level: 1, department_name: "Engineering" },
        { id: 2, name: "Software Engineer", code: "E2", level: 2, department_name: "Engineering" },
        { id: 3, name: "Senior Engineer", code: "E3", level: 3, department_name: "Engineering" },
        { id: 4, name: "Lead Engineer", code: "E4", level: 4, department_name: "Engineering" },
        { id: 5, name: "Principal Engineer", code: "E5", level: 5, department_name: "Engineering" },
      ])
    }
  }

  const fetchSkills = async (roleId: number) => {
    try {
      const response = await fetch(`/api/role-skills?roleId=${roleId}`)
      if (response.ok) {
        const data = await response.json()
        return Array.isArray(data) ? data : []
      }
      // Return demo skills for demo mode
      return [
        {
          id: 1,
          skill_name: "JavaScript Programming",
          level: "Intermediate",
          demonstration_description:
            "Demonstrate ability to write clean, maintainable JavaScript code with ES6+ features",
          skill_description: "Core programming language for web development",
          category_name: "Technical Skills",
          category_color: "blue",
        },
        {
          id: 2,
          skill_name: "React Development",
          level: "Intermediate",
          demonstration_description: "Build responsive web applications using React hooks and component patterns",
          skill_description: "Modern frontend framework for building user interfaces",
          category_name: "Technical Skills",
          category_color: "blue",
        },
        {
          id: 3,
          skill_name: "Problem Solving",
          level: "Advanced",
          demonstration_description: "Analyze complex problems and develop effective solutions",
          skill_description: "Critical thinking and analytical skills",
          category_name: "Soft Skills",
          category_color: "green",
        },
      ]
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
      const roleSkills = await fetchSkills(role.id)
      setSkills1(roleSkills)
      setIsLoading(false)
    }
  }

  const handleRole2Change = async (roleId: string) => {
    const role = roles.find((r) => r.id === Number.parseInt(roleId))
    if (role) {
      setSelectedRole2(role)
      setIsLoading(true)
      const roleSkills = await fetchSkills(role.id)
      setSkills2(roleSkills)
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
        pdf.text(`Role Comparison: ${selectedRole1.code} vs ${selectedRole2.code}`, 10, 30)

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

  // Get all unique skills from both roles
  const allSkills = [...skills1, ...skills2].reduce((acc, skill) => {
    if (!acc.find((s) => s.skill_name === skill.skill_name)) {
      acc.push(skill)
    }
    return acc
  }, [] as Skill[])

  // Group skills by category
  const skillsByCategory = allSkills.reduce(
    (acc, skill) => {
      if (!acc[skill.category_name]) {
        acc[skill.category_name] = {
          color: skill.category_color,
          skills: [],
        }
      }
      acc[skill.category_name].skills.push(skill)
      return acc
    },
    {} as Record<string, { color: string; skills: Skill[] }>,
  )

  const getSkillStatus = (skillName: string, roleSkills: Skill[]) => {
    return roleSkills.find((s) => s.skill_name === skillName)
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Role Comparison</h1>
        <p className="text-gray-600">Compare skills and requirements between different job roles.</p>
      </div>

      {/* Role Selection */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>First Role</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={handleRole1Change}>
              <SelectTrigger>
                <SelectValue placeholder="Choose first role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.department_name} - {role.name} ({role.code})
                  </SelectItem>
                ))}
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
            <CardTitle>Second Role</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={handleRole2Change}>
              <SelectTrigger>
                <SelectValue placeholder="Choose second role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.department_name} - {role.name} ({role.code})
                  </SelectItem>
                ))}
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
      {selectedRole1 && selectedRole2 && allSkills.length > 0 && (
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
          ) : allSkills.length > 0 ? (
            <div className="space-y-8">
              {Object.entries(skillsByCategory).map(([categoryName, categoryData]) => (
                <Card key={categoryName}>
                  <CardHeader>
                    <CardTitle className={`text-${categoryData.color}-700`}>{categoryName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {categoryData.skills.map((skill) => {
                        const skill1 = getSkillStatus(skill.skill_name, skills1)
                        const skill2 = getSkillStatus(skill.skill_name, skills2)

                        return (
                          <div
                            key={skill.skill_name}
                            className={`p-4 rounded-lg border ${getColorClasses(categoryData.color)}`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold">{skill.skill_name}</h4>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600">{selectedRole1.code}</span>
                                  {skill1 ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                  ) : (
                                    <XCircle className="w-5 h-5 text-red-500" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600">{selectedRole2.code}</span>
                                  {skill2 ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                  ) : (
                                    <XCircle className="w-5 h-5 text-red-500" />
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2">
                                  {selectedRole1.name} ({selectedRole1.code})
                                </h5>
                                {skill1 ? (
                                  <div>
                                    <Badge variant="outline" className="text-xs mb-2">
                                      {skill1.level}
                                    </Badge>
                                    <p className="text-sm text-gray-600">{skill1.demonstration_description}</p>
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500 italic">Not required for this role</p>
                                )}
                              </div>

                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2">
                                  {selectedRole2.name} ({selectedRole2.code})
                                </h5>
                                {skill2 ? (
                                  <div>
                                    <Badge variant="outline" className="text-xs mb-2">
                                      {skill2.level}
                                    </Badge>
                                    <p className="text-sm text-gray-600">{skill2.demonstration_description}</p>
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500 italic">Not required for this role</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg mb-2">No skills to compare</div>
              <div className="text-gray-500 text-sm">These roles currently have no skills defined.</div>
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
            Choose roles from the dropdowns above to see their skill differences.
          </div>
        </div>
      )}
    </div>
  )
}
