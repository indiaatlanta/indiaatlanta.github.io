"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Download, Target, BookOpen, CheckCircle, AlertCircle, TrendingUp, User } from "lucide-react"
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

interface SkillAssessment {
  skillId: number
  skillName: string
  requiredLevel: number
  currentLevel: number
  notes: string
}

interface AssessmentData {
  role: Role | null
  skills: Skill[]
  assessments: SkillAssessment[]
  completed: boolean
}

const RATING_LEVELS = [
  { value: 0, label: "No Experience", description: "I have no experience with this skill", color: "bg-gray-500" },
  { value: 1, label: "Beginner", description: "I have basic knowledge or limited experience", color: "bg-red-500" },
  { value: 2, label: "Developing", description: "I can perform basic tasks with guidance", color: "bg-orange-500" },
  { value: 3, label: "Proficient", description: "I can work independently and effectively", color: "bg-yellow-500" },
  {
    value: 4,
    label: "Advanced",
    description: "I can mentor others and handle complex scenarios",
    color: "bg-blue-500",
  },
  {
    value: 5,
    label: "Expert",
    description: "I am a recognized expert and can lead initiatives",
    color: "bg-green-500",
  },
]

export default function SelfReviewClient() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [assessment, setAssessment] = useState<AssessmentData>({
    role: null,
    skills: [],
    assessments: [],
    completed: false,
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

  const handleRoleSelect = async (roleId: string) => {
    const selectedRole = roles.find((role) => role.id === Number.parseInt(roleId))
    if (!selectedRole) return

    const skills = await fetchRoleSkills(selectedRole.id)
    const assessments = skills.map((skill: Skill) => ({
      skillId: skill.id,
      skillName: skill.name,
      requiredLevel: skill.level,
      currentLevel: 0,
      notes: "",
    }))

    setAssessment({
      role: selectedRole,
      skills,
      assessments,
      completed: false,
    })
  }

  const updateAssessment = (skillId: number, field: "currentLevel" | "notes", value: number | string) => {
    setAssessment((prev) => ({
      ...prev,
      assessments: prev.assessments.map((assessment) =>
        assessment.skillId === skillId ? { ...assessment, [field]: value } : assessment,
      ),
    }))
  }

  const completeAssessment = () => {
    setAssessment((prev) => ({ ...prev, completed: true }))
  }

  const exportToPDF = () => {
    if (!assessment.role) return

    const doc = new jsPDF()

    // Header
    doc.setFontSize(20)
    doc.text("Henry Schein One - Self Assessment Report", 20, 30)

    doc.setFontSize(12)
    doc.text(`Role: ${assessment.role.title}`, 20, 45)
    doc.text(`Department: ${assessment.role.department}`, 20, 55)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 65)

    let yPosition = 80

    // Summary
    const totalSkills = assessment.assessments.length
    const assessedSkills = assessment.assessments.filter((a) => a.currentLevel > 0).length
    const meetingRequirements = assessment.assessments.filter((a) => a.currentLevel >= a.requiredLevel).length

    doc.setFontSize(16)
    doc.text("Assessment Summary", 20, yPosition)
    yPosition += 15

    doc.setFontSize(12)
    doc.text(`Total Skills: ${totalSkills}`, 20, yPosition)
    yPosition += 8
    doc.text(`Skills Assessed: ${assessedSkills}`, 20, yPosition)
    yPosition += 8
    doc.text(`Meeting Requirements: ${meetingRequirements}`, 20, yPosition)
    yPosition += 8
    doc.text(`Completion: ${Math.round((assessedSkills / totalSkills) * 100)}%`, 20, yPosition)
    yPosition += 20

    // Skills breakdown
    doc.setFontSize(16)
    doc.text("Skills Assessment", 20, yPosition)
    yPosition += 15

    assessment.assessments.forEach((assessment) => {
      const skill = assessment.skillName
      const required = assessment.requiredLevel
      const current = assessment.currentLevel
      const status = current >= required ? "MEETS" : current > 0 ? "DEVELOPING" : "NOT ASSESSED"

      doc.setFontSize(12)
      doc.text(`${skill}`, 20, yPosition)
      yPosition += 8

      doc.setFontSize(10)
      doc.text(`Required: Level ${required} | Current: Level ${current} | Status: ${status}`, 25, yPosition)
      yPosition += 6

      if (assessment.notes) {
        doc.text(`Notes: ${assessment.notes}`, 25, yPosition)
        yPosition += 6
      }

      yPosition += 4

      if (yPosition > 270) {
        doc.addPage()
        yPosition = 20
      }
    })

    doc.save(`self-assessment-${assessment.role.title.replace(/\s+/g, "-").toLowerCase()}.pdf`)
  }

  const getProgressStats = () => {
    const total = assessment.assessments.length
    const assessed = assessment.assessments.filter((a) => a.currentLevel > 0).length
    const meeting = assessment.assessments.filter((a) => a.currentLevel >= a.requiredLevel).length
    const developing = assessment.assessments.filter(
      (a) => a.currentLevel > 0 && a.currentLevel < a.requiredLevel,
    ).length

    return {
      total,
      assessed,
      meeting,
      developing,
      completion: total > 0 ? Math.round((assessed / total) * 100) : 0,
      readiness: total > 0 ? Math.round((meeting / total) * 100) : 0,
    }
  }

  const groupSkillsByCategory = () => {
    const grouped = assessment.skills.reduce(
      (acc, skill) => {
        if (!acc[skill.category]) {
          acc[skill.category] = []
        }
        acc[skill.category].push(skill)
        return acc
      },
      {} as Record<string, Skill[]>,
    )

    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const stats = getProgressStats()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Self Assessment</h1>
          </div>
          <p className="text-lg text-gray-600">
            Evaluate your current skills against role requirements and identify areas for development.
          </p>
        </div>

        {/* Role Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Select Target Role
            </CardTitle>
            <CardDescription>Choose the role you want to assess yourself against</CardDescription>
          </CardHeader>
          <CardContent>
            <Select onValueChange={handleRoleSelect}>
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

            {assessment.role && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-lg">{assessment.role.title}</h3>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{assessment.role.department}</Badge>
                  <Badge variant="outline">{assessment.role.level}</Badge>
                </div>
                <p className="text-sm text-gray-600 mt-2">{assessment.role.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Overview */}
        {assessment.role && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Assessment Progress
                  </CardTitle>
                  <CardDescription>Track your progress through the skills assessment</CardDescription>
                </div>
                {assessment.completed && (
                  <Button onClick={exportToPDF} className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Report
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.completion}%</div>
                  <div className="text-sm text-gray-600">Completion</div>
                  <Progress value={stats.completion} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.meeting}</div>
                  <div className="text-sm text-gray-600">Skills Meeting Requirements</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.developing}</div>
                  <div className="text-sm text-gray-600">Skills Developing</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.readiness}%</div>
                  <div className="text-sm text-gray-600">Role Readiness</div>
                  <Progress value={stats.readiness} className="mt-2" />
                </div>
              </div>

              {!assessment.completed && stats.completion === 100 && (
                <div className="text-center">
                  <Button onClick={completeAssessment} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Assessment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Rating Guide */}
        {assessment.role && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Rating Guide
              </CardTitle>
              <CardDescription>Use this guide to rate your skill levels accurately</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {RATING_LEVELS.map((level) => (
                  <div key={level.value} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <div className={`w-4 h-4 rounded-full ${level.color} flex-shrink-0 mt-0.5`}></div>
                    <div>
                      <div className="font-semibold text-sm">{level.label}</div>
                      <div className="text-xs text-gray-600">{level.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skills Assessment */}
        {assessment.role && (
          <div className="space-y-6">
            {groupSkillsByCategory().map(([category, categorySkills]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-lg">{category}</CardTitle>
                  <CardDescription>{categorySkills.length} skills in this category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {categorySkills.map((skill) => {
                      const skillAssessment = assessment.assessments.find((a) => a.skillId === skill.id)
                      if (!skillAssessment) return null

                      const isComplete = skillAssessment.currentLevel > 0
                      const meetsRequirement = skillAssessment.currentLevel >= skillAssessment.requiredLevel
                      const selectedRating = RATING_LEVELS.find((r) => r.value === skillAssessment.currentLevel)

                      return (
                        <div key={skill.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{skill.name}</h4>
                                {isComplete &&
                                  (meetsRequirement ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <AlertCircle className="w-5 h-5 text-orange-600" />
                                  ))}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{skill.description}</p>
                              <Badge variant="outline" className="text-xs">
                                Required: Level {skillAssessment.requiredLevel}
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Your Current Level</label>
                              <Select
                                value={skillAssessment.currentLevel.toString()}
                                onValueChange={(value) =>
                                  updateAssessment(skill.id, "currentLevel", Number.parseInt(value))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your level" />
                                </SelectTrigger>
                                <SelectContent>
                                  {RATING_LEVELS.map((level) => (
                                    <SelectItem key={level.value} value={level.value.toString()}>
                                      <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${level.color}`}></div>
                                        {level.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {selectedRating && (
                                <p className="text-xs text-gray-500 mt-1">{selectedRating.description}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                              <Textarea
                                placeholder="Add any notes about your experience with this skill..."
                                value={skillAssessment.notes}
                                onChange={(e) => updateAssessment(skill.id, "notes", e.target.value)}
                                className="text-sm"
                                rows={2}
                              />
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
        )}

        {/* Empty State */}
        {!assessment.role && (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Your Self Assessment</h3>
              <p className="text-gray-600 mb-6">
                Select a target role from the dropdown above to begin evaluating your skills and identifying areas for
                growth.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <BookOpen className="w-4 h-4" />
                <span>Choose a role to see the required skills</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
