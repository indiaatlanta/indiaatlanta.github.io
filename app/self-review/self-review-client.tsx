"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Eye, Info, MessageSquare } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface Role {
  id: number
  name: string
  code: string
  level: number
  salary_min?: number
  salary_max?: number
  location_type?: string
  department_name: string
  skill_count: number
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

interface SkillRating {
  skillId: number
  rating: string
  comment?: string
}

const ratingOptions = [
  {
    value: "needs-development",
    label: "Needs Development",
    description:
      "I have limited experience or confidence in this area and would benefit from support or learning opportunities.",
    color: "red",
  },
  {
    value: "developing",
    label: "Developing",
    description:
      "I'm gaining experience in this skill and can apply it with guidance. I understand the fundamentals but am still building confidence and consistency.",
    color: "yellow",
  },
  {
    value: "proficient",
    label: "Proficient / Fully Displayed",
    description:
      "I demonstrate this skill consistently and effectively in my role, independently and with good outcomes.",
    color: "green",
  },
  {
    value: "strength",
    label: "Strength / Role Model",
    description: "I consistently excel in this area and often guide, coach, or support others to develop this skill.",
    color: "blue",
  },
]

export function SelfReviewClient() {
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<number | null>(null)
  const [roleSkills, setRoleSkills] = useState<Skill[]>([])
  const [skillRatings, setSkillRatings] = useState<Record<number, { rating: string; comment: string }>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [isSkillDetailOpen, setIsSkillDetailOpen] = useState(false)
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({})

  const role = roles.find((r) => r.id === selectedRole)

  // Load roles on component mount
  useEffect(() => {
    loadRoles()
  }, [])

  // Load skills when role is selected
  useEffect(() => {
    if (selectedRole) {
      loadSkillsForReview()
    }
  }, [selectedRole])

  const loadRoles = async () => {
    try {
      const response = await fetch("/api/roles")
      if (response.ok) {
        const data = await response.json()
        setRoles(data.roles)
        setIsDemoMode(data.isDemoMode)
      } else {
        // Fallback to mock data
        setRoles([
          { id: 1, name: "Junior Engineer", code: "E1", level: 1, department_name: "Engineering", skill_count: 25 },
          { id: 2, name: "Software Engineer", code: "E2", level: 2, department_name: "Engineering", skill_count: 30 },
          { id: 3, name: "Senior Engineer", code: "E3", level: 3, department_name: "Engineering", skill_count: 35 },
        ])
        setIsDemoMode(true)
      }
    } catch (error) {
      console.error("Error loading roles:", error)
      // Fallback to mock data
      setRoles([
        { id: 1, name: "Junior Engineer", code: "E1", level: 1, department_name: "Engineering", skill_count: 25 },
        { id: 2, name: "Software Engineer", code: "E2", level: 2, department_name: "Engineering", skill_count: 30 },
        { id: 3, name: "Senior Engineer", code: "E3", level: 3, department_name: "Engineering", skill_count: 35 },
      ])
      setIsDemoMode(true)
    }
  }

  const loadSkillsForReview = async () => {
    if (!selectedRole) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/role-skills?roleId=${selectedRole}`)
      const skills = response.ok ? await response.json() : []
      setRoleSkills(skills)
      // Reset ratings when changing roles
      setSkillRatings({})
      setExpandedComments({})
    } catch (error) {
      console.error("Error loading skills for review:", error)
      setRoleSkills([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRatingChange = (skillId: number, rating: string) => {
    setSkillRatings((prev) => ({
      ...prev,
      [skillId]: {
        rating,
        comment: prev[skillId]?.comment || "",
      },
    }))
  }

  const handleCommentChange = (skillId: number, comment: string) => {
    setSkillRatings((prev) => ({
      ...prev,
      [skillId]: {
        rating: prev[skillId]?.rating || "",
        comment,
      },
    }))
  }

  const toggleCommentField = (skillId: number) => {
    setExpandedComments((prev) => ({
      ...prev,
      [skillId]: !prev[skillId],
    }))
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

  const getRatingColorClasses = (rating: string) => {
    const colorMap: Record<string, string> = {
      "needs-development": "bg-red-50 text-red-900 border-red-200",
      developing: "bg-yellow-50 text-yellow-900 border-yellow-200",
      proficient: "bg-green-50 text-green-900 border-green-200",
      strength: "bg-blue-50 text-blue-900 border-blue-200",
    }
    return colorMap[rating] || "bg-gray-50 text-gray-900 border-gray-200"
  }

  const parseSkillLevel = (level: string | null | undefined): number => {
    if (!level) return 0
    const match = level.match(/[A-Z](\d+)/)
    return match ? Number.parseInt(match[1], 10) : 0
  }

  const getSkillLevelDots = (level: string, color: string) => {
    const levelNum = parseSkillLevel(level)
    if (levelNum === 0) return null

    const maxDots = 5
    const dotsToShow = Math.min(levelNum, maxDots)

    return (
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          {Array.from({ length: dotsToShow }, (_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full bg-${color}-500`} />
          ))}
          {levelNum > maxDots && <span className="text-xs text-gray-500 ml-1">+{levelNum - maxDots}</span>}
        </div>
      </div>
    )
  }

  // Group skills by category
  const skillsByCategory = roleSkills.reduce(
    (acc, skill) => {
      if (!acc[skill.category_name]) {
        acc[skill.category_name] = { color: skill.category_color, skills: [] }
      }
      acc[skill.category_name].skills.push(skill)
      return acc
    },
    {} as Record<string, { color: string; skills: Skill[] }>,
  )

  const formatSalary = (role: Role) => {
    if (!role.salary_min || !role.salary_max) {
      return "Salary not specified"
    }
    return `£${role.salary_min.toLocaleString()} - £${role.salary_max.toLocaleString()}`
  }

  const getCompletionStats = () => {
    const totalSkills = roleSkills.length
    const ratedSkills = Object.values(skillRatings).filter((rating) => rating.rating).length
    const completionPercentage = totalSkills > 0 ? Math.round((ratedSkills / totalSkills) * 100) : 0

    const ratingCounts = ratingOptions.reduce(
      (acc, option) => {
        acc[option.value] = Object.values(skillRatings).filter((rating) => rating.rating === option.value).length
        return acc
      },
      {} as Record<string, number>,
    )

    return { totalSkills, ratedSkills, completionPercentage, ratingCounts }
  }

  const exportToPDF = async () => {
    if (!selectedRole || !role) return

    try {
      // Dynamic import to avoid SSR issues
      const jsPDF = (await import("jspdf")).default

      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.width
      const margin = 20
      let yPosition = margin

      // Helper function to add text with word wrapping
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize = 10) => {
        doc.setFontSize(fontSize)
        const lines = doc.splitTextToSize(text, maxWidth)
        doc.text(lines, x, y)
        return y + lines.length * fontSize * 0.4
      }

      // Header
      doc.setFontSize(20)
      doc.setFont(undefined, "bold")
      doc.text("Self Review Report", margin, yPosition)
      yPosition += 15

      doc.setFontSize(12)
      doc.setFont(undefined, "normal")
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, yPosition)
      yPosition += 20

      // Role Information
      doc.setFontSize(16)
      doc.setFont(undefined, "bold")
      doc.text(`${role.name} (${role.code})`, margin, yPosition)
      yPosition += 10

      doc.setFontSize(10)
      doc.setFont(undefined, "normal")
      const roleDetails = `${role.department_name} • Level ${role.level} • ${formatSalary(role)} • ${role.location_type || "Hybrid"}`
      yPosition = addWrappedText(roleDetails, margin, yPosition, pageWidth - 2 * margin)
      yPosition += 15

      // Completion Stats
      const stats = getCompletionStats()
      doc.setFontSize(12)
      doc.setFont(undefined, "bold")
      doc.text("Review Summary", margin, yPosition)
      yPosition += 8

      doc.setFontSize(10)
      doc.setFont(undefined, "normal")
      doc.text(
        `Completion: ${stats.ratedSkills}/${stats.totalSkills} skills (${stats.completionPercentage}%)`,
        margin,
        yPosition,
      )
      yPosition += 15

      // Rating Scale
      doc.setFontSize(12)
      doc.setFont(undefined, "bold")
      doc.text("Rating Scale", margin, yPosition)
      yPosition += 8

      doc.setFontSize(9)
      doc.setFont(undefined, "normal")
      for (const option of ratingOptions) {
        doc.setFont(undefined, "bold")
        doc.text(`${option.label}:`, margin, yPosition)
        yPosition += 4
        doc.setFont(undefined, "normal")
        yPosition = addWrappedText(option.description, margin + 5, yPosition, pageWidth - 2 * margin - 5, 8)
        yPosition += 5
      }
      yPosition += 10

      // Skills by Category
      for (const [categoryName, categoryData] of Object.entries(skillsByCategory)) {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage()
          yPosition = margin
        }

        // Category Header
        doc.setFontSize(14)
        doc.setFont(undefined, "bold")
        doc.text(categoryName, margin, yPosition)
        yPosition += 10

        // Skills in this category
        for (const skill of categoryData.skills) {
          if (yPosition > 270) {
            doc.addPage()
            yPosition = margin
          }

          const skillRating = skillRatings[skill.id]
          const rating = skillRating?.rating
          const comment = skillRating?.comment
          const ratingOption = ratingOptions.find((opt) => opt.value === rating)

          doc.setFontSize(10)
          doc.setFont(undefined, "bold")
          doc.text(`• ${skill.skill_name} (${skill.level})`, margin, yPosition)
          yPosition += 5

          if (ratingOption) {
            doc.setFont(undefined, "bold")
            doc.text(`Rating: ${ratingOption.label}`, margin + 5, yPosition)
            yPosition += 4
          } else {
            doc.setFont(undefined, "italic")
            doc.text("Rating: Not rated", margin + 5, yPosition)
            yPosition += 4
          }

          if (comment && comment.trim()) {
            doc.setFont(undefined, "bold")
            doc.text("Comments:", margin + 5, yPosition)
            yPosition += 3
            doc.setFontSize(9)
            doc.setFont(undefined, "normal")
            yPosition = addWrappedText(comment, margin + 10, yPosition, pageWidth - 2 * margin - 10, 8)
            yPosition += 3
          }

          doc.setFontSize(9)
          doc.setFont(undefined, "normal")
          doc.text("Demonstration Required:", margin + 5, yPosition)
          yPosition += 3
          yPosition = addWrappedText(
            skill.demonstration_description,
            margin + 10,
            yPosition,
            pageWidth - 2 * margin - 10,
            8,
          )
          yPosition += 8
        }
        yPosition += 5
      }

      // Save the PDF
      const fileName = `self-review-${role.code}-${new Date().toISOString().split("T")[0]}.pdf`
      doc.save(fileName)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    }
  }

  const stats = getCompletionStats()

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

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Self Review</h1>
        <p className="text-gray-600">
          Assess your skills against a specific role's requirements to identify development opportunities.
        </p>
      </div>

      {/* Rating Scale Information */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Rating Scale Definitions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ratingOptions.map((option) => (
              <div key={option.value} className={`p-4 rounded-lg border ${getRatingColorClasses(option.value)}`}>
                <h4 className="font-semibold mb-2">{option.label}</h4>
                <p className="text-sm">{option.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Role to Review</label>
        <Select
          value={selectedRole?.toString() || ""}
          onValueChange={(value) => setSelectedRole(Number.parseInt(value))}
        >
          <SelectTrigger className="max-w-md">
            <SelectValue placeholder="Choose a role to assess yourself against" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id.toString()}>
                {role.department_name} - {role.name} ({role.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Review Content */}
      {selectedRole && role && (
        <>
          {/* Role Header */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{role.code}</Badge>
                  <span>{role.name}</span>
                </div>
                <Button
                  onClick={exportToPDF}
                  disabled={isLoading}
                  className="bg-brand-600 hover:bg-brand-700 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Export to PDF
                </Button>
              </CardTitle>
              <div className="text-sm text-gray-600">
                <div>
                  {role.department_name} • Level {role.level}
                </div>
                <div>
                  {formatSalary(role)} • {role.location_type || "Hybrid"}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Progress Summary */}
          {stats.totalSkills > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Review Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-2xl font-bold text-brand-600">{stats.completionPercentage}%</div>
                  <div className="text-sm text-gray-600">
                    {stats.ratedSkills} of {stats.totalSkills} skills rated
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.completionPercentage}%` }}
                  ></div>
                </div>
                {stats.ratedSkills > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {ratingOptions.map((option) => (
                      <div key={option.value} className="text-center">
                        <div className={`text-lg font-bold text-${option.color}-600`}>
                          {stats.ratingCounts[option.value] || 0}
                        </div>
                        <div className="text-gray-600">{option.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Skills Review */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading skills for review...</div>
            </div>
          ) : roleSkills.length > 0 ? (
            <div className="space-y-8">
              {Object.entries(skillsByCategory).map(([categoryName, categoryData]) => (
                <div key={categoryName}>
                  <h3
                    className={`text-xl font-semibold mb-4 border-b pb-2 text-${categoryData.color}-700 border-${categoryData.color}-200`}
                  >
                    {categoryName}
                  </h3>

                  <div className="space-y-4">
                    {categoryData.skills.map((skill) => {
                      const currentRating = skillRatings[skill.id]?.rating
                      const currentComment = skillRatings[skill.id]?.comment || ""
                      const isCommentExpanded = expandedComments[skill.id]
                      return (
                        <div key={skill.id} className={`p-4 rounded-lg border ${getColorClasses(categoryData.color)}`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-medium">{skill.skill_name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {skill.level}
                                </Badge>
                                {getSkillLevelDots(skill.level, categoryData.color)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedSkill(skill)
                                    setIsSkillDetailOpen(true)
                                  }}
                                  className="h-6 w-6 p-0"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                              <p className="text-sm text-gray-700 mb-3">{skill.demonstration_description}</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Rate your proficiency:
                                </label>
                                <Select
                                  value={currentRating || ""}
                                  onValueChange={(value) => handleRatingChange(skill.id, value)}
                                >
                                  <SelectTrigger className="max-w-xs">
                                    <SelectValue placeholder="Select your rating" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ratingOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleCommentField(skill.id)}
                                className="mt-6 flex items-center gap-2"
                              >
                                <MessageSquare className="w-4 h-4" />+ Comments
                              </Button>
                            </div>

                            {isCommentExpanded && (
                              <div className="mt-3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Comments (optional):
                                </label>
                                <Textarea
                                  value={currentComment}
                                  onChange={(e) => handleCommentChange(skill.id, e.target.value)}
                                  placeholder="Add notes about your rating, specific examples, or areas for development..."
                                  rows={3}
                                  className="w-full"
                                />
                                {currentComment && (
                                  <p className="text-xs text-gray-500 mt-1">{currentComment.length} characters</p>
                                )}
                              </div>
                            )}

                            {currentComment && !isCommentExpanded && (
                              <div className="mt-2 p-2 bg-gray-50 rounded border-l-4 border-gray-300">
                                <p className="text-sm text-gray-700 italic">
                                  "
                                  {currentComment.length > 100
                                    ? currentComment.substring(0, 100) + "..."
                                    : currentComment}
                                  "
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleCommentField(skill.id)}
                                  className="text-xs text-gray-500 p-0 h-auto mt-1"
                                >
                                  Click to edit comment
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg mb-2">No skills defined</div>
              <div className="text-gray-500 text-sm">This role currently has no skills defined for review.</div>
            </div>
          )}
        </>
      )}

      {/* Skill Detail Modal */}
      <Dialog open={isSkillDetailOpen} onOpenChange={setIsSkillDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{selectedSkill?.skill_name || "Skill Details"}</span>
              {selectedSkill && (
                <Badge variant="outline" className="text-xs">
                  {selectedSkill.level}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedSkill && (
            <div className="space-y-4">
              {/* Skill Category */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Category</h4>
                <Badge variant="secondary" className={`${getColorClasses(selectedSkill.category_color)} border`}>
                  {selectedSkill.category_name}
                </Badge>
              </div>

              {/* Demonstration Description */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Demonstration Required</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-800 text-sm leading-relaxed">{selectedSkill.demonstration_description}</p>
                </div>
              </div>

              {/* Skill Description */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Skill Description</h4>
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedSkill.skill_description}</p>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setIsSkillDetailOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
