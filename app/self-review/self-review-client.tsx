"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Download, FileText, Star } from "lucide-react"
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

interface SelfAssessment {
  skillId: number
  rating: number
  notes: string
}

interface Props {
  isDemoMode: boolean
}

export function SelfReviewClient({ isDemoMode }: Props) {
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [assessments, setAssessments] = useState<Record<number, SelfAssessment>>({})
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
        setRoles(data)
      }
    } catch (error) {
      console.error("Error fetching roles:", error)
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

  const handleRoleChange = async (roleId: string) => {
    const role = roles.find((r) => r.id === Number.parseInt(roleId))
    if (role) {
      setSelectedRole(role)
      setIsLoading(true)
      const roleSkills = await fetchSkills(role.id)
      setSkills(roleSkills)
      setIsLoading(false)
    }
  }

  const updateAssessment = (skillId: number, field: "rating" | "notes", value: number | string) => {
    setAssessments((prev) => ({
      ...prev,
      [skillId]: {
        ...prev[skillId],
        skillId,
        [field]: value,
        rating: field === "rating" ? (value as number) : prev[skillId]?.rating || 0,
        notes: field === "notes" ? (value as string) : prev[skillId]?.notes || "",
      },
    }))
  }

  const generatePDF = async () => {
    if (!selectedRole) return

    setIsGeneratingPDF(true)
    try {
      const element = document.getElementById("self-review-content")
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
        pdf.text(`Self Review: ${selectedRole.name} (${selectedRole.code})`, 10, 30)

        // Add review content
        const imgWidth = 190
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        pdf.addImage(imgData, "PNG", 10, 40, imgWidth, imgHeight)

        pdf.save(`self-review-${selectedRole.code}.pdf`)
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

  const renderStars = (skillId: number, currentRating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => updateAssessment(skillId, "rating", star)}
            className={`w-6 h-6 ${
              star <= currentRating ? "text-yellow-400" : "text-gray-300"
            } hover:text-yellow-400 transition-colors`}
          >
            <Star className="w-full h-full fill-current" />
          </button>
        ))}
      </div>
    )
  }

  // Group skills by category
  const skillsByCategory = skills.reduce(
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Self Review</h1>
        <p className="text-gray-600">Assess your skills against a specific role's requirements.</p>
      </div>

      {/* Role Selection */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select Role</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleRoleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a role to review against" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id.toString()}>
                  {role.department_name} - {role.name} ({role.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedRole && (
            <div className="mt-4">
              <Badge variant="outline">{selectedRole.code}</Badge>
              <h3 className="font-semibold mt-2">{selectedRole.name}</h3>
              <p className="text-sm text-gray-600">Level {selectedRole.level}</p>
              <p className="text-sm text-gray-600">{selectedRole.department_name}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Button */}
      {selectedRole && skills.length > 0 && (
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

      {/* Self Review Content */}
      {selectedRole && (
        <div id="self-review-content">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading skills...</div>
            </div>
          ) : skills.length > 0 ? (
            <div className="space-y-8">
              {Object.entries(skillsByCategory).map(([categoryName, categoryData]) => (
                <Card key={categoryName}>
                  <CardHeader>
                    <CardTitle className={`text-${categoryData.color}-700`}>{categoryName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {categoryData.skills.map((skill) => {
                        const assessment = assessments[skill.id]
                        return (
                          <div
                            key={skill.id}
                            className={`p-4 rounded-lg border ${getColorClasses(categoryData.color)}`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-semibold">{skill.skill_name}</h4>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {skill.level}
                                </Badge>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-600 mb-1">Your Rating</div>
                                {renderStars(skill.id, assessment?.rating || 0)}
                              </div>
                            </div>

                            <div className="mb-4">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Required Demonstration</h5>
                              <p className="text-sm text-gray-600">
                                {skill.demonstration_description || "No demonstration description available"}
                              </p>
                            </div>

                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Your Notes & Evidence</h5>
                              <Textarea
                                placeholder="Describe how you demonstrate this skill, provide examples, or note areas for improvement..."
                                value={assessment?.notes || ""}
                                onChange={(e) => updateAssessment(skill.id, "notes", e.target.value)}
                                className="min-h-[80px]"
                              />
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
              <div className="text-gray-400 text-lg mb-2">No skills defined</div>
              <div className="text-gray-500 text-sm">This role currently has no skills defined.</div>
            </div>
          )}
        </div>
      )}

      {/* No Selection Message */}
      {!selectedRole && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-400 text-lg mb-2">Select a role to begin your self review</div>
          <div className="text-gray-500 text-sm">Choose a role from the dropdown above to assess your skills.</div>
        </div>
      )}
    </div>
  )
}
