"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Download, Info, CheckCircle, AlertCircle, Target, TrendingUp } from "lucide-react"
import jsPDF from "jspdf"
import "jspdf-autotable"

interface Role {
  id: number
  title: string
  department: string
  level: string
  salary_min?: number
  salary_max?: number
}

interface Skill {
  id: number
  skill_name: string
  category: string
  description: string
  level: string
}

interface SkillRating {
  skillId: number
  rating: string
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

export function SelfReviewClient() {
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

      if (response.ok) {
        // Handle different response formats
        if (Array.isArray(data)) {
          setRoles(data)
        } else if (data.roles && Array.isArray(data.roles)) {
          setRoles(data.roles)
        } else {
          setRoles([])
        }
      } else {
        throw new Error(data.error || "Failed to fetch roles")
      }
    } catch (error) {
      console.error("Error fetching roles:", error)
      setError("Failed to load roles. Please try again.")
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

      if (response.ok) {
        setSkills(data.skills || [])
        // Initialize ratings for all skills
        const initialRatings = (data.skills || []).map((skill: Skill) => ({
          skillId: skill.id,
          rating: "",
        }))
        setRatings(initialRatings)
      } else {
        throw new Error(data.error || "Failed to fetch skills")
      }
    } catch (error) {
      console.error("Error fetching skills:", error)
      setError("Failed to load skills for this role. Please try again.")
      setSkills([])
      setRatings([])
    } finally {
      setLoading(false)
    }
  }

  const updateRating = (skillId: number, rating: string) => {
    setRatings((prev) => prev.map((r) => (r.skillId === skillId ? { ...r, rating } : r)))
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

  const exportToPDF = () => {
    if (!selectedRole) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width

    // Add logo
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("Henry Schein One", 20, 25)

    doc.setFontSize(16)
    doc.text("Self Assessment Report", 20, 35)

    // Role information
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(`Role: ${selectedRole.title}`, 20, 50)
    doc.text(`Department: ${selectedRole.department}`, 20, 60)
    doc.text(`Level: ${selectedRole.level}`, 20, 70)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 80)

    // Summary
    const counts = getRatingCounts()
    let yPos = 95

    doc.setFont("helvetica", "bold")
    doc.text("Assessment Summary:", 20, yPos)
    yPos += 10

    doc.setFont("helvetica", "normal")
    Object.entries(counts).forEach(([rating, count]) => {
      const label = RATING_OPTIONS.find((opt) => opt.value === rating)?.label || rating
      doc.text(`${label}: ${count}`, 25, yPos)
      yPos += 8
    })

    // Skills details
    yPos += 10
    doc.setFont("helvetica", "bold")
    doc.text("Detailed Assessment:", 20, yPos)
    yPos += 10

    const tableData = skills.map((skill) => {
      const rating = ratings.find((r) => r.skillId === skill.id)
      const ratingLabel = RATING_OPTIONS.find((opt) => opt.value === rating?.rating)?.label || "Not Rated"
      return [skill.skill_name, skill.category, ratingLabel]
    })
    ;(doc as any).autoTable({
      startY: yPos,
      head: [["Skill", "Category", "Rating"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
    })

    doc.save(`self-assessment-${selectedRole.title.replace(/\s+/g, "-").toLowerCase()}.pdf`)
  }

  const ratingCounts = getRatingCounts()
  const totalRated = Object.values(ratingCounts).reduce((sum, count) => sum + count, 0)
  const totalSkills = skills.length

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Self Assessment</h1>
          <p className="text-gray-600">
            Evaluate your current skills against role requirements and identify development opportunities.
          </p>
        </div>

        {/* Rating Scale Guide */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Rating Scale Guide
            </CardTitle>
            <CardDescription>
              Use this guide to understand what each rating level means for your self-assessment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(RATING_DESCRIPTIONS).map(([rating, description]) => {
              const option = RATING_OPTIONS.find((opt) => opt.value === rating)
              if (!option || !option.value) return null

              return (
                <div key={rating} className="border-l-4 border-blue-200 pl-4">
                  <h4 className="font-semibold text-gray-900">{option.label}</h4>
                  <p className="text-sm text-gray-600 mt-1">{description}</p>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Role Selection */}
        <Card className="mb-8">
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

        {/* Assessment Summary */}
        {selectedRole && skills.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Assessment Progress
              </CardTitle>
              <CardDescription>
                Track your progress: {totalRated} of {totalSkills} skills rated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(ratingCounts).map(([rating, count]) => {
                  const option = RATING_OPTIONS.find((opt) => opt.value === rating)
                  if (!option || !option.value) return null

                  return (
                    <div key={rating} className="text-center">
                      <div className={`rounded-lg p-3 border ${RATING_COLORS[rating as keyof typeof RATING_COLORS]}`}>
                        <div className="text-2xl font-bold">{count}</div>
                        <div className="text-xs font-medium">{option.label}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {totalRated > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">
                      {Math.round((totalRated / totalSkills) * 100)}% Complete
                    </span>
                  </div>
                  <Button onClick={exportToPDF} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading...</span>
          </div>
        )}

        {/* Skills Assessment */}
        {selectedRole && skills.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Skills Assessment</CardTitle>
              <CardDescription>
                Rate your current proficiency level for each skill required in the {selectedRole.title} role.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {skills.map((skill) => {
                  const currentRating = ratings.find((r) => r.skillId === skill.id)?.rating || ""

                  return (
                    <div key={skill.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{skill.skill_name}</h3>
                          <Badge variant="outline" className="mt-1">
                            {skill.category}
                          </Badge>
                          {skill.description && <p className="text-sm text-gray-600 mt-2">{skill.description}</p>}
                        </div>
                        <Badge variant="secondary" className="ml-4">
                          {skill.level}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700 min-w-[80px]">Your Rating:</label>
                        <Select value={currentRating} onValueChange={(value) => updateRating(skill.id, value)}>
                          <SelectTrigger className="w-full max-w-xs">
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
                        {currentRating && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Skills Message */}
        {selectedRole && skills.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Skills Found</h3>
              <p className="text-gray-600">No skills have been defined for the {selectedRole.title} role yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
