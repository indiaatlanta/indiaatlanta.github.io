"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Download, FileText, Info, Save, Check } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

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

export function SelfReviewClient() {
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [ratings, setRatings] = useState<SkillRating[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isLoadingRoles, setIsLoadingRoles] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [assessmentName, setAssessmentName] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    setIsLoadingRoles(true)
    try {
      const response = await fetch("/api/roles")
      if (response.ok) {
        const data = await response.json()
        console.log("Roles API response:", data) // Debug log

        // Handle different response formats
        if (data && Array.isArray(data.roles)) {
          setRoles(data.roles)
          setIsDemoMode(data.isDemoMode || false)
        } else if (Array.isArray(data)) {
          setRoles(data)
          setIsDemoMode(false)
        } else {
          console.error("Unexpected roles data format:", data)
          setRoles([])
          setIsDemoMode(true)
        }
      } else {
        console.error("Failed to fetch roles, status:", response.status)
        setRoles([])
        setIsDemoMode(true)
      }
    } catch (error) {
      console.error("Error fetching roles:", error)
      setRoles([])
      setIsDemoMode(true)
    } finally {
      setIsLoadingRoles(false)
    }
  }

  const fetchSkills = async (roleId: number) => {
    try {
      const response = await fetch(`/api/role-skills?roleId=${roleId}`)
      if (response.ok) {
        const data = await response.json()
        return Array.isArray(data) ? data : []
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
      setRatings([])
      setIsLoading(false)
      // Generate default assessment name
      const now = new Date()
      const defaultName = `${role.name} Assessment - ${now.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })}`
      setAssessmentName(defaultName)
    }
  }

  const handleRatingChange = (skillId: number, rating: string) => {
    setRatings((prev) => {
      const existing = prev.find((r) => r.skillId === skillId)
      if (existing) {
        return prev.map((r) => (r.skillId === skillId ? { ...r, rating } : r))
      }
      return [...prev, { skillId, rating }]
    })
  }

  const getRatingForSkill = (skillId: number) => {
    return ratings.find((r) => r.skillId === skillId)?.rating || ""
  }

  const handleSaveAssessment = async () => {
    if (!selectedRole || !assessmentName.trim()) {
      alert("Please provide an assessment name")
      return
    }

    if (ratings.length === 0) {
      alert("Please rate at least one skill before saving")
      return
    }

    setIsSaving(true)
    try {
      // Calculate overall score based on ratings
      const ratingScores = {
        "needs-development": 1,
        developing: 2,
        proficient: 3,
        strength: 4,
        "not-applicable": 0,
      }

      const validRatings = ratings.filter((r) => r.rating !== "not-applicable")
      const totalScore = validRatings.reduce((sum, rating) => {
        return sum + (ratingScores[rating.rating as keyof typeof ratingScores] || 0)
      }, 0)
      const maxPossibleScore = validRatings.length * 4
      const overallScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0

      // Prepare skills data with detailed information
      const skillsData = {
        ratings: ratings.map((rating) => {
          const skill = skills.find((s) => s.id === rating.skillId)
          return {
            skillId: rating.skillId,
            skillName: skill?.skill_name || "",
            categoryName: skill?.category_name || "",
            level: skill?.level || "",
            rating: rating.rating,
            ratingLabel: RATING_OPTIONS.find((opt) => opt.value === rating.rating)?.label || "",
          }
        }),
        roleName: selectedRole.name,
        roleCode: selectedRole.code,
        departmentName: selectedRole.department_name,
        completedAt: new Date().toISOString(),
        summary: getRatingSummary(),
      }

      const assessmentData = {
        assessmentName: assessmentName.trim(),
        jobRoleName: selectedRole.name,
        departmentName: selectedRole.department_name,
        skillsData: skillsData,
        overallScore: overallScore,
        completionPercentage: completionPercentage,
        totalSkills: skills.length,
        completedSkills: totalRated,
      }

      console.log("Sending assessment data:", assessmentData) // Debug log

      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assessmentData),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Assessment saved successfully:", data)
        setSaveSuccess(true)
        setSaveDialogOpen(false)

        // Show success message briefly
        setTimeout(() => {
          setSaveSuccess(false)
        }, 3000)
      } else {
        const errorData = await response.json()
        console.error("Save assessment error:", errorData)
        alert(`Failed to save assessment: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error saving assessment:", error)
      alert("Failed to save assessment. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const generatePDF = async () => {
    if (!selectedRole) return

    setIsGeneratingPDF(true)
    try {
      const doc = new jsPDF("p", "mm", "a4")

      // Add header without logo to avoid PNG issues
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text("Henry Schein One", 20, 25)

      doc.setFontSize(16)
      doc.text(`Self Assessment: ${selectedRole.name} (${selectedRole.code})`, 20, 35)

      // Add role information
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text(`Role: ${selectedRole.name}`, 20, 50)
      doc.text(`Department: ${selectedRole.department_name}`, 20, 60)
      doc.text(`Level: ${selectedRole.level}`, 20, 70)
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 80)

      // Add summary
      const summary = getRatingSummary()
      let yPos = 95
      doc.setFont("helvetica", "bold")
      doc.text("Assessment Summary:", 20, yPos)
      yPos += 10

      doc.setFont("helvetica", "normal")
      Object.entries(summary).forEach(([rating, count]) => {
        if (count > 0) {
          const label = RATING_OPTIONS.find((opt) => opt.value === rating)?.label || rating
          doc.text(`${label}: ${count}`, 25, yPos)
          yPos += 8
        }
      })

      // Create table data for skills
      const tableData = skills.map((skill) => {
        const rating = ratings.find((r) => r.skillId === skill.id)
        const ratingLabel = RATING_OPTIONS.find((opt) => opt.value === rating?.rating)?.label || "Not Rated"
        return [skill.skill_name, skill.category_name, skill.level, ratingLabel]
      })

      // Add table using autoTable
      autoTable(doc, {
        startY: yPos + 10,
        head: [["Skill", "Category", "Required Level", "Self Rating"]],
        body: tableData,
        theme: "grid",
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 40 },
          2: { cellWidth: 30 },
          3: { cellWidth: 50 },
        },
      })

      doc.save(`self-assessment-${selectedRole.code}.pdf`)
      setIsGeneratingPDF(false)
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

  const getRatingBadgeColor = (rating: string) => {
    const colorMap: Record<string, string> = {
      "needs-development": "bg-red-100 text-red-800",
      developing: "bg-yellow-100 text-yellow-800",
      proficient: "bg-green-100 text-green-800",
      strength: "bg-blue-100 text-blue-800",
      "not-applicable": "bg-gray-100 text-gray-800",
    }
    return colorMap[rating] || "bg-gray-100 text-gray-800"
  }

  const getRatingSummary = () => {
    const summary = {
      "needs-development": 0,
      developing: 0,
      proficient: 0,
      strength: 0,
      "not-applicable": 0,
    }

    ratings.forEach((rating) => {
      if (summary.hasOwnProperty(rating.rating)) {
        summary[rating.rating as keyof typeof summary]++
      }
    })

    return summary
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

  const summary = getRatingSummary()
  const totalRated = Object.values(summary).reduce((sum, count) => sum + count, 0)
  const completionPercentage = skills.length > 0 ? Math.round((totalRated / skills.length) * 100) : 0

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

      {/* Success Message */}
      {saveSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-green-800 text-sm font-medium">Assessment saved successfully!</span>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Self Assessment</h1>
        <p className="text-gray-600">Evaluate your skills against role requirements and identify development areas.</p>
      </div>

      {/* Rating Scale Descriptions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Rating Scale Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {RATING_OPTIONS.map((option) => (
              <div key={option.value} className="border-l-4 border-gray-200 pl-4">
                <h4 className="font-semibold text-gray-900 mb-1">{option.label}</h4>
                <p className="text-sm text-gray-600">
                  {RATING_DESCRIPTIONS[option.value as keyof typeof RATING_DESCRIPTIONS]}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Selection */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select Role</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleRoleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a role to assess" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingRoles ? (
                <SelectItem value="loading" disabled>
                  Loading roles...
                </SelectItem>
              ) : roles.length > 0 ? (
                roles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.department_name} - {role.name} ({role.code})
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-roles" disabled>
                  No roles available
                </SelectItem>
              )}
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

      {/* Assessment Summary */}
      {selectedRole && skills.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Assessment Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Completion</span>
                <span className="text-sm text-gray-600">
                  {totalRated} of {skills.length} skills rated
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {RATING_OPTIONS.map((option) => (
                <div key={option.value} className="text-center">
                  <div
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRatingBadgeColor(option.value)}`}
                  >
                    {summary[option.value as keyof typeof summary]}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{option.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {selectedRole && skills.length > 0 && totalRated > 0 && (
        <div className="mb-6 flex justify-end gap-3">
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Save className="w-4 h-4" />
                Save Assessment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Assessment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="assessment-name">Assessment Name</Label>
                  <Input
                    id="assessment-name"
                    value={assessmentName}
                    onChange={(e) => setAssessmentName(e.target.value)}
                    placeholder="Enter a name for this assessment"
                    className="mt-1"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  <p>
                    <strong>Role:</strong> {selectedRole.name} ({selectedRole.code})
                  </p>
                  <p>
                    <strong>Skills Rated:</strong> {totalRated} of {skills.length}
                  </p>
                  <p>
                    <strong>Completion:</strong> {completionPercentage}%
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveAssessment} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Assessment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

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

      {/* Skills Assessment */}
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
                      {categoryData.skills.map((skill) => (
                        <div key={skill.id} className={`p-4 rounded-lg border ${getColorClasses(categoryData.color)}`}>
                          <div className="flex flex-col md:flex-row md:items-start gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold mb-2">{skill.skill_name}</h4>
                              <div className="mb-3">
                                <Badge variant="outline" className="text-xs mb-2">
                                  Required Level: {skill.level}
                                </Badge>
                                <p className="text-sm text-gray-700">{skill.demonstration_description}</p>
                              </div>
                            </div>
                            <div className="md:w-64">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                              <Select
                                value={getRatingForSkill(skill.id)}
                                onValueChange={(value) => handleRatingChange(skill.id, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select rating" />
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
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg mb-2">No skills found</div>
              <div className="text-gray-500 text-sm">This role currently has no skills defined.</div>
            </div>
          )}
        </div>
      )}

      {/* No Selection Message */}
      {!selectedRole && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-400 text-lg mb-2">Select a role to begin assessment</div>
          <div className="text-gray-500 text-sm">
            Choose a role from the dropdown above to start evaluating your skills.
          </div>
        </div>
      )}
    </div>
  )
}
