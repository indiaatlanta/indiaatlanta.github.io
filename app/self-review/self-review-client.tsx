"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, AlertCircle, BarChart3 } from "lucide-react"
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
  skill_category: string
  skill_level: string
  description: string
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
  "needs-development": {
    title: "Needs Development",
    description:
      "I have limited experience or confidence in this area and would benefit from support or learning opportunities.",
    color: "bg-red-100 text-red-800 border-red-200",
  },
  developing: {
    title: "Developing",
    description:
      "I'm gaining experience in this skill and can apply it with guidance. I understand the fundamentals but am still building confidence and consistency.",
    color: "bg-orange-100 text-orange-800 border-orange-200",
  },
  proficient: {
    title: "Proficient / Fully Displayed",
    description:
      "I demonstrate this skill consistently and effectively in my role, independently and with good outcomes.",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  strength: {
    title: "Strength / Role Model",
    description: "I consistently excel in this area and often guide, coach, or support others to develop this skill.",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  "not-applicable": {
    title: "Not Applicable",
    description: "This skill is not currently relevant to my role or responsibilities.",
    color: "bg-gray-100 text-gray-800 border-gray-200",
  },
}

export default function SelfReviewClient() {
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [ratings, setRatings] = useState<SkillRating[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("assessment")

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/roles")
      const data = await response.json()

      if (response.ok) {
        // Handle both array and object responses
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
      setActiveTab("assessment")
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
      unrated: 0,
    }

    ratings.forEach((rating) => {
      if (rating.rating === "") {
        counts.unrated++
      } else {
        counts[rating.rating as keyof typeof counts]++
      }
    })

    return counts
  }

  const exportToPDF = () => {
    if (!selectedRole) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const margin = 20

    // Add logo
    try {
      const logoImg = new Image()
      logoImg.crossOrigin = "anonymous"
      logoImg.onload = () => {
        doc.addImage(logoImg, "PNG", margin, 15, 30, 15)
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
      doc.text("Self-Assessment Report", pageWidth / 2, 40, { align: "center" })

      // Role information
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text(`Role: ${selectedRole.title}`, margin, 60)
      doc.text(`Department: ${selectedRole.department}`, margin, 70)
      doc.text(`Level: ${selectedRole.level}`, margin, 80)
      doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, 90)

      // Summary
      const counts = getRatingCounts()
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Assessment Summary", margin, 110)

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      let yPos = 120
      Object.entries(counts).forEach(([key, count]) => {
        if (key !== "unrated" && count > 0) {
          const description = RATING_DESCRIPTIONS[key as keyof typeof RATING_DESCRIPTIONS]
          doc.text(`${description?.title || key}: ${count} skills`, margin, yPos)
          yPos += 10
        }
      })

      // Skills table
      yPos += 10
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Detailed Assessment", margin, yPos)

      const tableData = skills.map((skill) => {
        const rating = ratings.find((r) => r.skillId === skill.id)
        const ratingText = rating?.rating
          ? RATING_DESCRIPTIONS[rating.rating as keyof typeof RATING_DESCRIPTIONS]?.title || rating.rating
          : "Not Rated"

        return [skill.skill_category, skill.skill_name, skill.skill_level, ratingText]
      })
      ;(doc as any).autoTable({
        startY: yPos + 10,
        head: [["Category", "Skill", "Level", "Self-Rating"]],
        body: tableData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 60 },
          2: { cellWidth: 25 },
          3: { cellWidth: 45 },
        },
      })

      doc.save(`self-assessment-${selectedRole.title.replace(/\s+/g, "-").toLowerCase()}.pdf`)
    }
  }

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

  const ratingCounts = getRatingCounts()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Self-Assessment</h1>
          <p className="text-gray-600">
            Evaluate your skills against role requirements and identify development opportunities.
          </p>
        </div>

        {/* Role Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Role</CardTitle>
            <CardDescription>Choose the role you want to assess yourself against</CardDescription>
          </CardHeader>
          <CardContent>
            <Select onValueChange={handleRoleSelect} disabled={loading}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={loading ? "Loading roles..." : "Select a role..."} />
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

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {selectedRole && (
          <>
            {/* Rating Scale Guide */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Rating Scale Guide
                </CardTitle>
                <CardDescription>
                  Use this guide to understand each rating level and assess your skills accurately
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {Object.entries(RATING_DESCRIPTIONS).map(([key, info]) => (
                    <div key={key} className={`p-4 rounded-lg border ${info.color}`}>
                      <h4 className="font-semibold mb-2">{info.title}</h4>
                      <p className="text-sm">{info.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Assessment Summary */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Assessment Progress</CardTitle>
                <CardDescription>Track your progress and see the distribution of your ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(ratingCounts).map(([key, count]) => {
                    if (key === "unrated") {
                      return (
                        <div key={key} className="text-center">
                          <div className="text-2xl font-bold text-gray-500">{count}</div>
                          <div className="text-sm text-gray-600">Unrated</div>
                        </div>
                      )
                    }
                    const info = RATING_DESCRIPTIONS[key as keyof typeof RATING_DESCRIPTIONS]
                    return (
                      <div key={key} className="text-center">
                        <div className="text-2xl font-bold">{count}</div>
                        <Badge variant="outline" className={`text-xs ${info.color}`}>
                          {info.title}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="assessment">Skills Assessment</TabsTrigger>
                <TabsTrigger value="export">Export & Save</TabsTrigger>
              </TabsList>

              <TabsContent value="assessment">
                {loading ? (
                  <Card>
                    <CardContent className="py-8">
                      <div className="text-center">Loading skills...</div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                      <Card key={category}>
                        <CardHeader>
                          <CardTitle className="text-lg">{category}</CardTitle>
                          <CardDescription>
                            {categorySkills.length} skill{categorySkills.length !== 1 ? "s" : ""}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {categorySkills.map((skill) => {
                              const rating = ratings.find((r) => r.skillId === skill.id)
                              return (
                                <div key={skill.id} className="border rounded-lg p-4">
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-medium">{skill.skill_name}</h4>
                                        <Badge variant="outline" className="text-xs">
                                          {skill.skill_level}
                                        </Badge>
                                      </div>
                                      {skill.description && (
                                        <p className="text-sm text-gray-600">{skill.description}</p>
                                      )}
                                    </div>
                                    <div className="md:w-64">
                                      <Select
                                        value={rating?.rating || ""}
                                        onValueChange={(value) => handleRatingChange(skill.id, value)}
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
              </TabsContent>

              <TabsContent value="export">
                <Card>
                  <CardHeader>
                    <CardTitle>Export Assessment</CardTitle>
                    <CardDescription>
                      Download your self-assessment report for your records or to share with your manager
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Button onClick={exportToPDF} className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Export as PDF
                        </Button>
                        <Button variant="outline" disabled>
                          <Download className="w-4 h-4 mr-2" />
                          Save to Profile (Coming Soon)
                        </Button>
                      </div>

                      <div className="text-sm text-gray-600">
                        <p className="mb-2">
                          <strong>PDF Export includes:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Complete skills assessment with ratings</li>
                          <li>Assessment summary and statistics</li>
                          <li>Role and department information</li>
                          <li>Professional formatting for sharing</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  )
}
