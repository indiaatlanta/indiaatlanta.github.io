"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Download, CheckCircle2, Circle } from "lucide-react"
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

interface SelfAssessment {
  skillId: number
  proficient: boolean
  notes: string
}

interface Props {
  departments: Department[]
  roles: Role[]
  isDemoMode: boolean
}

export function SelfReviewClient({ departments, roles, isDemoMode }: Props) {
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [assessments, setAssessments] = useState<Record<number, SelfAssessment>>({})

  const role = roles.find((r) => r.id.toString() === selectedRole)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const roleParam = urlParams.get("roleId")
    if (roleParam) setSelectedRole(roleParam)
  }, [])

  const fetchSkills = async (roleId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/role-skills?roleId=${roleId}`)
      const skillsData = response.ok ? await response.json() : []
      setSkills(skillsData)

      // Initialize assessments
      const initialAssessments: Record<number, SelfAssessment> = {}
      skillsData.forEach((skill: Skill) => {
        initialAssessments[skill.id] = {
          skillId: skill.id,
          proficient: false,
          notes: "",
        }
      })
      setAssessments(initialAssessments)
    } catch (error) {
      console.error("Error fetching skills:", error)
      setSkills([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = (roleId: string) => {
    setSelectedRole(roleId)
    if (roleId) {
      fetchSkills(roleId)
    }
  }

  const updateAssessment = (skillId: number, updates: Partial<SelfAssessment>) => {
    setAssessments((prev) => ({
      ...prev,
      [skillId]: { ...prev[skillId], ...updates },
    }))
  }

  const generatePDF = () => {
    if (!role || skills.length === 0) return

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
    pdf.text("Self-Review Report", margin, 35)

    // Role information
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "normal")
    pdf.text(`Role: ${role.name} (${role.code})`, margin, 45)
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, margin, 52)

    let yPosition = 70

    // Group by category
    const skillsByCategory = skills.reduce(
      (acc, skill) => {
        if (!acc[skill.category_name]) {
          acc[skill.category_name] = []
        }
        acc[skill.category_name].push(skill)
        return acc
      },
      {} as Record<string, Skill[]>,
    )

    Object.entries(skillsByCategory).forEach(([categoryName, categorySkills]) => {
      // Category header
      pdf.setFontSize(14)
      pdf.setFont("helvetica", "bold")
      pdf.text(categoryName, margin, yPosition)
      yPosition += 10

      categorySkills.forEach((skill) => {
        // Check if we need a new page
        if (yPosition > 250) {
          pdf.addPage()
          yPosition = 20
        }

        const assessment = assessments[skill.id]
        const status = assessment?.proficient ? "✓ Proficient" : "○ Not Yet"

        // Skill name and status
        pdf.setFontSize(11)
        pdf.setFont("helvetica", "bold")
        pdf.text(`${skill.skill_name} (${skill.level}) - ${status}`, margin, yPosition)
        yPosition += 8

        // Demonstration description
        pdf.setFontSize(9)
        pdf.setFont("helvetica", "normal")
        const lines = pdf.splitTextToSize(skill.demonstration_description, pageWidth - margin * 2)
        pdf.text(lines, margin + 5, yPosition)
        yPosition += lines.length * 4 + 2

        // Notes if any
        if (assessment?.notes) {
          pdf.setFont("helvetica", "italic")
          pdf.text("Notes:", margin + 5, yPosition)
          yPosition += 4
          const noteLines = pdf.splitTextToSize(assessment.notes, pageWidth - margin * 2)
          pdf.text(noteLines, margin + 10, yPosition)
          yPosition += noteLines.length * 4
        }

        yPosition += 5
      })

      yPosition += 5
    })

    // Summary
    const totalSkills = skills.length
    const proficientSkills = Object.values(assessments).filter((a) => a.proficient).length
    const percentage = totalSkills > 0 ? Math.round((proficientSkills / totalSkills) * 100) : 0

    pdf.addPage()
    pdf.setFontSize(16)
    pdf.setFont("helvetica", "bold")
    pdf.text("Summary", margin, 30)

    pdf.setFontSize(12)
    pdf.setFont("helvetica", "normal")
    pdf.text(`Total Skills: ${totalSkills}`, margin, 45)
    pdf.text(`Proficient: ${proficientSkills}`, margin, 52)
    pdf.text(`Percentage: ${percentage}%`, margin, 59)

    pdf.save(`self-review-${role.code}-${new Date().toISOString().split("T")[0]}.pdf`)
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

  const totalSkills = skills.length
  const proficientSkills = Object.values(assessments).filter((a) => a.proficient).length
  const percentage = totalSkills > 0 ? Math.round((proficientSkills / totalSkills) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Self-Review</h1>
        <p className="text-gray-600">Assess your proficiency against role requirements.</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select Role</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedRole} onValueChange={handleRoleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role to review against" />
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
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading skills...
          </CardContent>
        </Card>
      )}

      {skills.length > 0 && (
        <>
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                Review: {role?.name} ({role?.code})
              </CardTitle>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  {proficientSkills}/{totalSkills} skills ({percentage}%)
                </div>
                <Button onClick={generatePDF} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </CardHeader>
          </Card>

          <div className="space-y-6">
            {Object.entries(skillsByCategory).map(([categoryName, categoryData]) => (
              <Card key={categoryName}>
                <CardHeader>
                  <CardTitle className={`text-${categoryData.color}-700`}>{categoryName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categoryData.skills.map((skill) => {
                    const assessment = assessments[skill.id] || {
                      skillId: skill.id,
                      proficient: false,
                      notes: "",
                    }

                    return (
                      <div key={skill.id} className={`p-4 rounded-lg border ${getColorClasses(categoryData.color)}`}>
                        <div className="flex items-start gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateAssessment(skill.id, {
                                proficient: !assessment.proficient,
                              })
                            }
                            className="mt-1 p-0 h-auto"
                          >
                            {assessment.proficient ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400" />
                            )}
                          </Button>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">{skill.skill_name}</span>
                              <Badge variant="outline" className="text-xs">
                                {skill.level}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700 mb-3">{skill.demonstration_description}</p>

                            <Textarea
                              placeholder="Add notes about your experience with this skill..."
                              value={assessment.notes}
                              onChange={(e) =>
                                updateAssessment(skill.id, {
                                  notes: e.target.value,
                                })
                              }
                              className="text-sm"
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
