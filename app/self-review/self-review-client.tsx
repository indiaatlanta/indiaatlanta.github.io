"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { jsPDF } from "jspdf"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ClipboardCheck, Download, Loader2 } from "lucide-react"

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

const SelfReviewClient: React.FC = () => {
  const [reviewData, setReviewData] = useState<{
    employeeName: string
    reviewDate: string
    reviewerName: string
    questions: {
      question: string
      answer: string
    }[]
  }>({
    employeeName: "John Doe",
    reviewDate: "2024-01-01",
    reviewerName: "Jane Smith",
    questions: [
      { question: "What are your key accomplishments?", answer: "Completed project X and Y." },
      { question: "What are your areas for improvement?", answer: "Public speaking." },
    ],
  })

  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [roleSkills, setRoleSkills] = useState<Skill[]>([])
  const [assessments, setAssessments] = useState<Record<number, SelfAssessment>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const handleRoleSelect = async (roleId: string) => {
    setSelectedRole(roleId)
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/role-skills?roleId=${roleId}`)
      if (response.ok) {
        const skills = await response.json()
        setRoleSkills(skills)

        // Initialize assessments
        const initialAssessments: Record<number, SelfAssessment> = {}
        skills.forEach((skill: Skill) => {
          initialAssessments[skill.id] = {
            skillId: skill.id,
            rating: 0,
            notes: "",
          }
        })
        setAssessments(initialAssessments)
      } else {
        setError("Failed to fetch role skills")
      }
    } catch (error) {
      setError("An error occurred while fetching skills")
      console.error("Error fetching skills:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateAssessment = (skillId: number, field: keyof SelfAssessment, value: any) => {
    setAssessments((prev) => ({
      ...prev,
      [skillId]: {
        ...prev[skillId],
        [field]: value,
      },
    }))
  }

  const generatePDF = () => {
    if (!selectedRole || roleSkills.length === 0) return

    const selectedRoleData = roles.find((r) => r.id.toString() === selectedRole)
    if (!selectedRoleData) return

    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 20

    // Add logo with correct aspect ratio (1384x216 = 6.4:1)
    const logoHeight = 10
    const logoWidth = 64 // 6.4:1 ratio
    pdf.addImage("/images/hs1-logo.png", "PNG", margin, margin, logoWidth, logoHeight)

    // Title
    pdf.setFontSize(20)
    pdf.text("Self-Review Report", margin, margin + 25)

    // Role name
    pdf.setFontSize(14)
    pdf.text(`Role: ${selectedRoleData.name} (${selectedRoleData.code})`, margin, margin + 35)

    let yPosition = margin + 50

    // Group skills by category
    const skillsByCategory = roleSkills.reduce(
      (acc, skill) => {
        if (!acc[skill.category_name]) {
          acc[skill.category_name] = []
        }
        acc[skill.category_name].push(skill)
        return acc
      },
      {} as Record<string, Skill[]>,
    )

    Object.entries(skillsByCategory).forEach(([categoryName, skills]) => {
      // Category header
      pdf.setFontSize(16)
      pdf.text(categoryName, margin, yPosition)
      yPosition += 10

      skills.forEach((skill) => {
        if (yPosition > 250) {
          pdf.addPage()
          yPosition = 20
        }

        const assessment = assessments[skill.id]
        pdf.setFontSize(12)
        pdf.text(`${skill.skill_name} (${skill.level})`, margin + 5, yPosition)
        yPosition += 6

        pdf.setFontSize(10)
        pdf.text(`Rating: ${assessment?.rating || 0}/5`, margin + 10, yPosition)
        yPosition += 5

        if (assessment?.notes) {
          const lines = pdf.splitTextToSize(`Notes: ${assessment.notes}`, pageWidth - margin * 2 - 10)
          pdf.text(lines, margin + 10, yPosition)
          yPosition += lines.length * 4
        }

        yPosition += 5
      })

      yPosition += 5
    })

    pdf.save(`self-review-${selectedRoleData.code}.pdf`)
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

  // Group skills by category
  const skillsByCategory = roleSkills.reduce(
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6" />
          Self-Review
        </h1>
        <p className="text-gray-600">Assess your skills against a specific role's requirements</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select Role for Self-Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <Select value={selectedRole} onValueChange={handleRoleSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role to review against" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.name} ({role.code}) - {role.department_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading skills...</p>
        </div>
      )}

      {roleSkills.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Skills Assessment - {roles.find((r) => r.id.toString() === selectedRole)?.name}
            </h2>
            <Button onClick={generatePDF} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>

          <div className="space-y-8">
            {Object.entries(skillsByCategory).map(([categoryName, categoryData]) => (
              <div key={categoryName}>
                <h3
                  className={`text-lg font-semibold mb-4 border-b pb-2 text-${categoryData.color}-700 border-${categoryData.color}-200`}
                >
                  {categoryName}
                </h3>
                <div className="space-y-4">
                  {categoryData.skills.map((skill) => (
                    <Card key={skill.id} className={getColorClasses(categoryData.color)}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-lg">{skill.skill_name}</h4>
                            <Badge variant="outline" className="mt-1">
                              {skill.level}
                            </Badge>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-gray-700 mb-2">
                            <strong>Expected demonstration:</strong>
                          </p>
                          <p className="text-sm">{skill.demonstration_description}</p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Self-Rating (1-5 scale)
                            </label>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <Button
                                  key={rating}
                                  variant={assessments[skill.id]?.rating === rating ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => updateAssessment(skill.id, "rating", rating)}
                                  className="w-10 h-10"
                                >
                                  {rating}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Notes & Evidence</label>
                            <Textarea
                              placeholder="Describe your experience with this skill, provide examples, or note areas for improvement..."
                              value={assessments[skill.id]?.notes || ""}
                              onChange={(e) => updateAssessment(skill.id, "notes", e.target.value)}
                              rows={3}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SelfReviewClient
