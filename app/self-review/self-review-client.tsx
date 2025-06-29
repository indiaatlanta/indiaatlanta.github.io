"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Download, FileText, AlertCircle, Info, BarChart3 } from "lucide-react"
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
  skill_name: string
  skill_category: string
  skill_description: string
  demonstration_text: string
  level: string
}

interface SkillRating {
  skillId: number
  rating: string
  notes: string
}

const RATING_OPTIONS = [
  { value: "", label: "Select Rating..." },
  { value: "needs-development", label: "Needs Development" },
  { value: "developing", label: "Developing" },
  { value: "proficient", label: "Proficient / Fully Displayed" },
  { value: "strength", label: "Strength / Role Model" },
  { value: "not-applicable", label: "Not Applicable" },
]

const RATING_DESCRIPTIONS = {
  "needs-development":
    "I have limited experience or confidence in this area and would benefit from support or learning opportunities.",
  developing:
    "I'm gaining experience in this skill and can apply it with guidance. I understand the fundamentals but am still building confidence and consistency.",
  proficient: "I demonstrate this skill consistently and effectively in my role, independently and with good outcomes.",
  strength: "I consistently excel in this area and often guide, coach, or support others to develop this skill.",
  "not-applicable": "This skill is not currently relevant to my role or responsibilities.",
}

const RATING_COLORS = {
  "needs-development": "bg-red-100 text-red-800 border-red-200",
  developing: "bg-yellow-100 text-yellow-800 border-yellow-200",
  proficient: "bg-green-100 text-green-800 border-green-200",
  strength: "bg-blue-100 text-blue-800 border-blue-200",
  "not-applicable": "bg-gray-100 text-gray-800 border-gray-200",
}

export default function SelfReviewClient() {
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [ratings, setRatings] = useState<SkillRating[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch roles on component mount
  useEffect(() => {
    fetchRoles()
  }, [])

  // Fetch skills when role is selected
  useEffect(() => {
    if (selectedRole) {
      fetchSkills(selectedRole.id)
    }
  }, [selectedRole])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/roles")
      const data = await response.json()

      // Handle different response formats
      if (Array.isArray(data)) {
        setRoles(data)
      } else if (data.roles && Array.isArray(data.roles)) {
        setRoles(data.roles)
      } else {
        console.error("Unexpected roles data format:", data)
        setRoles([])
      }
    } catch (error) {
      console.error("Error fetching roles:", error)
      setError("Failed to load roles")
      setRoles([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSkills = async (roleId: number) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/role-skills?roleId=${roleId}`)
      const data = await response.json()

      if (Array.isArray(data)) {
        setSkills(data)
        // Initialize ratings for all skills
        setRatings(
          data.map((skill) => ({
            skillId: skill.id,
            rating: "",
            notes: "",
          })),
        )
      } else if (data.skills && Array.isArray(data.skills)) {
        setSkills(data.skills)
        setRatings(
          data.skills.map((skill: Skill) => ({
            skillId: skill.id,
            rating: "",
            notes: "",
          })),
        )
      } else {
        console.error("Unexpected skills data format:", data)
        setSkills([])
        setRatings([])
      }
    } catch (error) {
      console.error("Error fetching skills:", error)
      setError("Failed to load skills for this role")
      setSkills([])
      setRatings([])
    } finally {
      setLoading(false)
    }
  }

  const updateRating = (skillId: number, field: "rating" | "notes", value: string) => {
    setRatings((prev) => prev.map((rating) => (rating.skillId === skillId ? { ...rating, [field]: value } : rating)))
  }

  const getRatingCounts = () => {
    const counts = {
      "needs-development": 0,
      developing: 0,
      proficient: 0,
      strength: 0,
      "not-applicable": 0,
    }

    ratings.forEach((rating) => {
      if (rating.rating && counts.hasOwnProperty(rating.rating)) {
        counts[rating.rating as keyof typeof counts]++
      }
    })

    return counts
  }

  const exportToPDF = async () => {
    if (!selectedRole) return

    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.width
    const margin = 20
    let yPosition = margin

    // Add logo
    try {
      const logoResponse = await fetch("/images/hs1-logo.png")
      const logoBlob = await logoResponse.blob()
      const logoDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(logoBlob)
      })
      pdf.addImage(logoDataUrl, "PNG", margin, yPosition, 30, 30)
      yPosition += 40
    } catch (error) {
      console.error("Error adding logo:", error)
      yPosition += 10
    }

    // Title
    pdf.setFontSize(20)
    pdf.setFont("helvetica", "bold")
    pdf.text("Self-Assessment Report", margin, yPosition)
    yPosition += 15

    // Role information
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "normal")
    pdf.text(`Role: ${selectedRole.title}`, margin, yPosition)
    yPosition += 8
    pdf.text(`Department: ${selectedRole.department}`, margin, yPosition)
    yPosition += 8
    pdf.text(`Level: ${selectedRole.level}`, margin, yPosition)
    yPosition += 15

    // Assessment summary
    const counts = getRatingCounts()
    pdf.setFont("helvetica", "bold")
    pdf.text("Assessment Summary:", margin, yPosition)
    yPosition += 10

    pdf.setFont("helvetica", "normal")
    Object.entries(counts).forEach(([rating, count]) => {
      const label = RATING_OPTIONS.find((opt) => opt.value === rating)?.label || rating
      pdf.text(`${label}: ${count}`, margin + 10, yPosition)
      yPosition += 6
    })
    yPosition += 10

    // Skills assessment
    pdf.setFont("helvetica", "bold")
    pdf.text("Skills Assessment:", margin, yPosition)
    yPosition += 10

    // Group skills by category
    const skillsByCategory = skills.reduce(
      (acc, skill) => {
        if (!acc[skill.skill_category]) {
          acc[skill.skill_category] = []
        }
        acc[skill.skill_category].push(skill)
        return acc
      },
      {} as Record<string, Skill[]>,
    )

    Object.entries(skillsByCategory).forEach(([category, categorySkills]) => {
      // Check if we need a new page
      if (yPosition > pdf.internal.pageSize.height - 60) {
        pdf.addPage()
        yPosition = margin
      }

      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(14)
      pdf.text(category, margin, yPosition)
      yPosition += 10

      categorySkills.forEach((skill) => {
        const rating = ratings.find((r) => r.skillId === skill.id)
        const ratingLabel = RATING_OPTIONS.find((opt) => opt.value === rating?.rating)?.label || "Not Rated"

        // Check if we need a new page
        if (yPosition > pdf.internal.pageSize.height - 40) {
          pdf.addPage()
          yPosition = margin
        }

        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(10)
        pdf.text(skill.skill_name, margin + 5, yPosition)
        yPosition += 6

        pdf.setFont("helvetica", "normal")
        pdf.text(`Rating: ${ratingLabel}`, margin + 5, yPosition)
        yPosition += 6

        if (rating?.notes) {
          const noteLines = pdf.splitTextToSize(`Notes: ${rating.notes}`, pageWidth - margin * 2 - 10)
          pdf.text(noteLines, margin + 5, yPosition)
          yPosition += noteLines.length * 5
        }
        yPosition += 5
      })
      yPosition += 5
    })

    // Save the PDF
    pdf.save(`self-assessment-${selectedRole.title.replace(/\s+/g, "-").toLowerCase()}.pdf`)
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Self-Assessment</h1>
        <p className="text-gray-600">
          Evaluate your skills against role requirements and identify areas for development.
        </p>
      </div>

      {/* Rating Scale Descriptions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Rating Scale Guide
          </CardTitle>
          <CardDescription>
            Use this guide to understand what each rating level means when assessing your skills.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(RATING_DESCRIPTIONS).map(([rating, description]) => {
            const option = RATING_OPTIONS.find((opt) => opt.value === rating)
            return (
              <div key={rating} className="border-l-4 border-gray-200 pl-4">
                <h4 className="font-semibold text-gray-900">{option?.label}</h4>
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Role Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Role</CardTitle>
          <CardDescription>Choose the role you want to assess yourself against.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedRole?.id.toString() || ""}
            onValueChange={(value) => {
              const role = roles.find((r) => r.id.toString() === value)
              setSelectedRole(role || null)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a role..." />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id.toString()}>
                  {role.title} - {role.department} ({role.level})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedRole && (
        <>
          {/* Assessment Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Assessment Summary
              </CardTitle>
              <CardDescription>Track your progress as you complete the assessment.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(getRatingCounts()).map(([rating, count]) => {
                  const option = RATING_OPTIONS.find((opt) => opt.value === rating)
                  const colorClass = RATING_COLORS[rating as keyof typeof RATING_COLORS]
                  return (
                    <div key={rating} className={`p-3 rounded-lg border ${colorClass}`}>
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-xs font-medium">{option?.label}</div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Role Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{selectedRole.title}</CardTitle>
              <CardDescription>
                <Badge variant="outline" className="mr-2">
                  {selectedRole.department}
                </Badge>
                <Badge variant="outline">{selectedRole.level}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{selectedRole.description}</p>
            </CardContent>
          </Card>

          {/* Skills Assessment */}
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading skills...</p>
              </CardContent>
            </Card>
          ) : skills.length > 0 ? (
            <>
              {/* Group skills by category */}
              {Object.entries(
                skills.reduce(
                  (acc, skill) => {
                    if (!acc[skill.skill_category]) {
                      acc[skill.skill_category] = []
                    }
                    acc[skill.skill_category].push(skill)
                    return acc
                  },
                  {} as Record<string, Skill[]>,
                ),
              ).map(([category, categorySkills]) => (
                <Card key={category} className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">{category}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {categorySkills.map((skill) => {
                      const rating = ratings.find((r) => r.skillId === skill.id)
                      return (
                        <div key={skill.id} className="border rounded-lg p-4">
                          <div className="mb-3">
                            <h4 className="font-semibold text-gray-900">{skill.skill_name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{skill.skill_description}</p>
                            {skill.demonstration_text && (
                              <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                                <strong>How to demonstrate:</strong> {skill.demonstration_text}
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                              <Select
                                value={rating?.rating || ""}
                                onValueChange={(value) => updateRating(skill.id, "rating", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select rating..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {RATING_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                              <Textarea
                                placeholder="Add any notes about your experience with this skill..."
                                value={rating?.notes || ""}
                                onChange={(e) => updateRating(skill.id, "notes", e.target.value)}
                                className="min-h-[80px]"
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              ))}

              {/* Export Button */}
              <div className="flex justify-center mt-8">
                <Button onClick={exportToPDF} className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Assessment as PDF
                </Button>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Skills Found</h3>
                <p className="text-gray-600">
                  No skills are currently defined for this role. Contact your administrator to add skills.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
