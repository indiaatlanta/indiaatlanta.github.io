"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Download, Info, BarChart3 } from "lucide-react"

interface Role {
  id: number
  name: string
  code: string
  level: number
  department_name: string
}

interface Skill {
  id: number
  name: string
  description: string
  full_description: string
  level: string
  category_name: string
  category_color: string
}

interface SkillRating {
  skillId: number
  rating: string
}

const RATING_OPTIONS = [
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
  const [exporting, setExporting] = useState(false)

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
        console.error("Unexpected roles response format:", data)
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
        setRatings(data.map((skill) => ({ skillId: skill.id, rating: "" })))
      } else if (data.skills && Array.isArray(data.skills)) {
        setSkills(data.skills)
        setRatings(data.skills.map((skill: Skill) => ({ skillId: skill.id, rating: "" })))
      } else {
        console.error("Unexpected skills response format:", data)
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

  const exportToPDF = async () => {
    if (!selectedRole) return

    try {
      setExporting(true)
      const response = await fetch("/api/skills/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roleId: selectedRole.id,
          roleName: selectedRole.name,
          ratings: ratings.filter((r) => r.rating),
          skills: skills,
          format: "pdf",
          type: "self-review",
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = `self-review-${selectedRole.name.toLowerCase().replace(/\s+/g, "-")}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        throw new Error("Export failed")
      }
    } catch (error) {
      console.error("Error exporting PDF:", error)
      setError("Failed to export PDF")
    } finally {
      setExporting(false)
    }
  }

  const ratingCounts = getRatingCounts()
  const totalRated = Object.values(ratingCounts).reduce((sum, count) => sum + count, 0)
  const completionPercentage = skills.length > 0 ? Math.round((totalRated / skills.length) * 100) : 0

  // Group skills by category
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Self Assessment</h1>
              <p className="text-sm text-gray-500">Evaluate your skills against role requirements</p>
            </div>
            {selectedRole && (
              <Button
                onClick={exportToPDF}
                disabled={exporting || totalRated === 0}
                className="flex items-center gap-2"
              >
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Export PDF
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Rating Scale Guide */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Rating Scale Guide
            </CardTitle>
            <CardDescription>
              Use this guide to understand what each rating level means for your self-assessment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {RATING_OPTIONS.map((option) => (
                <div key={option.value} className="p-4 border rounded-lg">
                  <div className="font-semibold text-sm mb-2">{option.label}</div>
                  <div className="text-xs text-gray-600">
                    {RATING_DESCRIPTIONS[option.value as keyof typeof RATING_DESCRIPTIONS]}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Role Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Role</CardTitle>
            <CardDescription>Choose the role you want to assess yourself against</CardDescription>
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
                    {role.name} - {role.department_name}
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
                <BarChart3 className="w-5 h-5" />
                Assessment Summary
              </CardTitle>
              <CardDescription>
                Progress: {totalRated} of {skills.length} skills rated ({completionPercentage}%)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {RATING_OPTIONS.map((option) => (
                  <div key={option.value} className="text-center">
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${RATING_COLORS[option.value as keyof typeof RATING_COLORS]}`}
                    >
                      {ratingCounts[option.value as keyof typeof ratingCounts]}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{option.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Loading...</span>
          </div>
        )}

        {/* Skills Assessment */}
        {selectedRole && skills.length > 0 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Skills Assessment for {selectedRole.name}</h2>
              <p className="text-gray-600 mb-6">
                Rate your current proficiency level for each skill required in this role.
              </p>
            </div>

            {Object.entries(skillsByCategory).map(([categoryName, categorySkills]) => (
              <Card key={categoryName}>
                <CardHeader>
                  <CardTitle className="text-lg">{categoryName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {categorySkills.map((skill) => {
                      const rating = ratings.find((r) => r.skillId === skill.id)
                      return (
                        <div key={skill.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium">{skill.name}</h3>
                                <Badge variant="outline">{skill.level}</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{skill.description}</p>
                              {skill.full_description && skill.full_description !== skill.description && (
                                <p className="text-xs text-gray-500">{skill.full_description}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <label className="text-sm font-medium text-gray-700 min-w-[80px]">Your Rating:</label>
                            <Select
                              value={rating?.rating || ""}
                              onValueChange={(value) => updateRating(skill.id, value)}
                            >
                              <SelectTrigger className="w-64">
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
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Skills Message */}
        {selectedRole && !loading && skills.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">No skills found for this role.</p>
            </CardContent>
          </Card>
        )}

        {/* No Role Selected */}
        {!selectedRole && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">Please select a role to begin your self-assessment.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
