"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Download, AlertCircle, Info } from "lucide-react"
import jsPDF from "jspdf"
import "jspdf-autotable"

interface Role {
  id: number
  title: string
  department: string
  level: string
  salary_min: number | null
  salary_max: number | null
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

const ratingOptions = [
  { value: "", label: "Select Rating..." },
  { value: "needs-development", label: "Needs Development" },
  { value: "developing", label: "Developing" },
  { value: "proficient", label: "Proficient / Fully Displayed" },
  { value: "strength", label: "Strength / Role Model" },
  { value: "not-applicable", label: "Not Applicable" },
]

const ratingDescriptions = {
  "needs-development": {
    title: "Needs Development",
    description:
      "I have limited experience or confidence in this area and would benefit from support or learning opportunities.",
    color: "bg-red-100 text-red-800",
  },
  developing: {
    title: "Developing",
    description:
      "I'm gaining experience in this skill and can apply it with guidance. I understand the fundamentals but am still building confidence and consistency.",
    color: "bg-orange-100 text-orange-800",
  },
  proficient: {
    title: "Proficient / Fully Displayed",
    description:
      "I demonstrate this skill consistently and effectively in my role, independently and with good outcomes.",
    color: "bg-green-100 text-green-800",
  },
  strength: {
    title: "Strength / Role Model",
    description: "I consistently excel in this area and often guide, coach, or support others to develop this skill.",
    color: "bg-blue-100 text-blue-800",
  },
  "not-applicable": {
    title: "Not Applicable",
    description: "This skill is not currently relevant to my role or responsibilities.",
    color: "bg-gray-100 text-gray-800",
  },
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
        // Initialize ratings array
        setRatings(
          (data.skills || []).map((skill: Skill) => ({
            skillId: skill.id,
            rating: "",
          })),
        )
      } else {
        throw new Error(data.error || "Failed to fetch skills")
      }
    } catch (error) {
      console.error("Error fetching skills:", error)
      setError("Failed to load skills for this role.")
      setSkills([])
      setRatings([])
    } finally {
      setLoading(false)
    }
  }

  const handleRoleSelect = (roleId: string) => {
    const role = roles.find((r) => r.id === Number.parseInt(roleId))
    if (role) {
      setSelectedRole(role)
      fetchSkills(role.id)
      setError(null)
    }
  }

  const handleRatingChange = (skillId: number, rating: string) => {
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
    try {
      const logoImg = new Image()
      logoImg.crossOrigin = "anonymous"
      logoImg.onload = () => {
        doc.addImage(logoImg, "PNG", 15, 15, 30, 15)
        generatePDFContent()
      }
      logoImg.onerror = () => {
        generatePDFContent()
      }
      logoImg.src = "/images/hs1-logo.png"
    } catch (error) {
      generatePDFContent()
    }

    function generatePDFContent() {
      // Header
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text("Self Assessment Report", pageWidth / 2, 25, { align: "center" })

      // Role information
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text(`Role: ${selectedRole.title}`, 15, 45)
      doc.text(`Department: ${selectedRole.department}`, 15, 52)
      doc.text(`Level: ${selectedRole.level}`, 15, 59)
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 66)

      // Summary
      const counts = getRatingCounts()
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Assessment Summary", 15, 80)

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      let yPos = 88
      Object.entries(counts).forEach(([key, count]) => {
        const desc = ratingDescriptions[key as keyof typeof ratingDescriptions]
        doc.text(`${desc.title}: ${count}`, 15, yPos)
        yPos += 6
      })

      // Skills table
      const tableData = skills.map((skill) => {
        const rating = ratings.find((r) => r.skillId === skill.id)
        const ratingText = rating?.rating
          ? ratingDescriptions[rating.rating as keyof typeof ratingDescriptions]?.title || "Not Rated"
          : "Not Rated"

        return [skill.category, skill.skill_name, skill.level, ratingText]
      })

      doc.autoTable({
        head: [["Category", "Skill", "Level", "Self Rating"]],
        body: tableData,
        startY: yPos + 10,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 70 },
          2: { cellWidth: 25 },
          3: { cellWidth: 45 },
        },
      })

      doc.save(`self-assessment-${selectedRole.title.replace(/\s+/g, "-").toLowerCase()}.pdf`)
    }
  }

  const ratingCounts = getRatingCounts()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Self Assessment</h1>
          <p className="text-gray-600">
            Evaluate your skills against role requirements and identify development opportunities.
          </p>
        </div>

        {/* Rating Scale Descriptions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Rating Scale Guide
            </CardTitle>
            <CardDescription>
              Use this guide to understand what each rating level means when assessing your skills.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(ratingDescriptions).map(([key, desc]) => (
                <div key={key} className="p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={desc.color}>{desc.title}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{desc.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Assessment Summary */}
        {selectedRole && ratings.some((r) => r.rating) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Assessment Summary</CardTitle>
              <CardDescription>Your current assessment progress for {selectedRole.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(ratingCounts).map(([key, count]) => {
                  const desc = ratingDescriptions[key as keyof typeof ratingDescriptions]
                  return (
                    <div key={key} className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{count}</div>
                      <Badge className={`${desc.color} text-xs`}>{desc.title}</Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Role Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Role</CardTitle>
            <CardDescription>Choose the role you want to assess yourself against.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Select onValueChange={handleRoleSelect} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.title} - {role.department} ({role.level})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedRole && (
                <Button onClick={exportToPDF} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skills Assessment */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Loading...</span>
          </div>
        )}

        {selectedRole && skills.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Skills Assessment - {selectedRole.title}</CardTitle>
              <CardDescription>Rate your current proficiency level for each required skill.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {skills
                  .reduce(
                    (acc, skill) => {
                      const existingCategory = acc.find((item) => item.category === skill.category)
                      if (existingCategory) {
                        existingCategory.skills.push(skill)
                      } else {
                        acc.push({ category: skill.category, skills: [skill] })
                      }
                      return acc
                    },
                    [] as { category: string; skills: Skill[] }[],
                  )
                  .map((categoryGroup) => (
                    <div key={categoryGroup.category} className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">{categoryGroup.category}</h3>
                      <div className="grid gap-4">
                        {categoryGroup.skills.map((skill) => {
                          const currentRating = ratings.find((r) => r.skillId === skill.id)
                          return (
                            <div key={skill.id} className="flex items-start gap-4 p-4 border rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-gray-900">{skill.skill_name}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {skill.level}
                                  </Badge>
                                </div>
                                {skill.description && <p className="text-sm text-gray-600 mb-2">{skill.description}</p>}
                              </div>
                              <div className="w-64">
                                <Select
                                  value={currentRating?.rating || ""}
                                  onValueChange={(value) => handleRatingChange(skill.id, value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select rating..." />
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
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedRole && skills.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">No skills found for this role.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
