"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, Download, FileSpreadsheet, AlertCircle } from "lucide-react"
import jsPDF from "jspdf"

interface Skill {
  id: number
  name: string
  level: string
  description: string
  full_description: string
  category_id: number
  category_name: string
  category_color: string
  job_role_id: number
  sort_order: number
}

interface JobRole {
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

interface SkillCategory {
  id: number
  name: string
  color: string
}

interface DepartmentClientProps {
  departmentSlug: string
  departmentName: string
}

const skillCategories: SkillCategory[] = [
  { id: 1, name: "Technical Skills", color: "blue" },
  { id: 2, name: "Delivery", color: "green" },
  { id: 3, name: "Feedback, Communication & Collaboration", color: "purple" },
  { id: 4, name: "Leadership", color: "indigo" },
  { id: 5, name: "Strategic Impact", color: "orange" },
]

export function DepartmentClient({ departmentSlug, departmentName }: DepartmentClientProps) {
  const [roles, setRoles] = useState<JobRole[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    loadRoles()
  }, [departmentSlug])

  useEffect(() => {
    if (roles.length > 0) {
      loadSkills()
    }
  }, [roles])

  const loadRoles = async () => {
    try {
      const response = await fetch("/api/roles")
      const data = await response.json()
      setRoles(data.roles || [])
      setIsDemoMode(data.isDemoMode)
    } catch (error) {
      console.error("Error loading roles:", error)
      setError("Failed to load roles")
    }
  }

  const loadSkills = async () => {
    try {
      const skillPromises = roles.map((role) => fetch(`/api/skills?jobRoleId=${role.id}`).then((res) => res.json()))
      const skillResults = await Promise.all(skillPromises)
      const allSkills = skillResults.flat()
      setSkills(allSkills)
    } catch (error) {
      console.error("Error loading skills:", error)
      setError("Failed to load skills")
    } finally {
      setIsLoading(false)
    }
  }

  const getSkillsMatrix = () => {
    const matrix: { [skillName: string]: { [roleId: number]: Skill } } = {}
    const filteredSkills =
      selectedCategory === "all"
        ? skills
        : skills.filter((skill) => skill.category_id === Number.parseInt(selectedCategory))

    filteredSkills.forEach((skill) => {
      if (!matrix[skill.name]) {
        matrix[skill.name] = {}
      }
      matrix[skill.name][skill.job_role_id] = skill
    })

    return matrix
  }

  const getSkillsByCategory = () => {
    const filteredSkills =
      selectedCategory === "all"
        ? skills
        : skills.filter((skill) => skill.category_id === Number.parseInt(selectedCategory))

    const categorizedSkills: { [categoryName: string]: Skill[] } = {}

    filteredSkills.forEach((skill) => {
      if (!categorizedSkills[skill.category_name]) {
        categorizedSkills[skill.category_name] = []
      }
      categorizedSkills[skill.category_name].push(skill)
    })

    // Sort skills within each category
    Object.keys(categorizedSkills).forEach((category) => {
      categorizedSkills[category].sort((a, b) => {
        if (a.sort_order !== b.sort_order) {
          return a.sort_order - b.sort_order
        }
        return a.name.localeCompare(b.name)
      })
    })

    return categorizedSkills
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

  const exportToCSV = () => {
    const matrix = getSkillsMatrix()
    const skillNames = Object.keys(matrix).sort()

    if (skillNames.length === 0) {
      setError("No data to export")
      return
    }

    // Create CSV header
    const headers = ["Skill", "Category", ...roles.map((role) => role.name)]

    // Create CSV rows
    const rows = skillNames.map((skillName) => {
      const skillData = Object.values(matrix[skillName])[0] // Get first skill to get category info
      const row = [
        `"${skillName}"`,
        `"${skillData?.category_name || ""}"`,
        ...roles.map((role) => {
          const skill = matrix[skillName][role.id]
          if (skill) {
            return `"${skill.level} - ${skill.description.replace(/"/g, '""')}"`
          }
          return '""'
        }),
      ]
      return row.join(",")
    })

    // Combine headers and rows
    const csvContent = [headers.join(","), ...rows].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)

    const categoryName =
      selectedCategory === "all"
        ? "All"
        : skillCategories.find((c) => c.id === Number.parseInt(selectedCategory))?.name || "Filtered"
    const filename = `${departmentName}-Skills-Matrix-${categoryName}-${new Date().toISOString().split("T")[0]}.csv`
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToPDF = async () => {
    setIsExporting(true)
    try {
      const matrix = getSkillsMatrix()
      const skillNames = Object.keys(matrix).sort()

      if (skillNames.length === 0) {
        setError("No data to export")
        return
      }

      // Create PDF in landscape A3 format for better table visibility
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a3",
      })

      // Add logo and title
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      // Title
      pdf.setFontSize(20)
      pdf.setFont("helvetica", "bold")
      const categoryName =
        selectedCategory === "all"
          ? "All Categories"
          : skillCategories.find((c) => c.id === Number.parseInt(selectedCategory))?.name || "Filtered"
      const title = `${departmentName} Skills Matrix - ${categoryName}`
      const titleWidth = pdf.getTextWidth(title)
      pdf.text(title, (pageWidth - titleWidth) / 2, 20)

      // Date
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "normal")
      const dateText = `Generated on ${new Date().toLocaleDateString()}`
      pdf.text(dateText, pageWidth - 50, 30)

      // Table setup
      const startY = 40
      const cellHeight = 8
      const skillNameWidth = 60
      const categoryWidth = 40
      const roleWidth = (pageWidth - skillNameWidth - categoryWidth - 20) / roles.length

      // Table headers
      pdf.setFontSize(9)
      pdf.setFont("helvetica", "bold")

      // Header background
      pdf.setFillColor(240, 240, 240)
      pdf.rect(10, startY, pageWidth - 20, cellHeight, "F")

      // Header text
      pdf.text("Skill", 12, startY + 5)
      pdf.text("Category", 12 + skillNameWidth, startY + 5)

      roles.forEach((role, index) => {
        const x = 12 + skillNameWidth + categoryWidth + index * roleWidth
        const roleText = role.name.length > 12 ? role.name.substring(0, 12) + "..." : role.name
        pdf.text(roleText, x, startY + 5)
      })

      // Table content
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(8)

      let currentY = startY + cellHeight

      skillNames.forEach((skillName, skillIndex) => {
        // Check if we need a new page
        if (currentY + cellHeight > pageHeight - 20) {
          pdf.addPage()
          currentY = 20
        }

        const skillData = Object.values(matrix[skillName])[0]

        // Alternate row colors
        if (skillIndex % 2 === 0) {
          pdf.setFillColor(250, 250, 250)
          pdf.rect(10, currentY, pageWidth - 20, cellHeight, "F")
        }

        // Skill name
        const skillText = skillName.length > 25 ? skillName.substring(0, 25) + "..." : skillName
        pdf.text(skillText, 12, currentY + 5)

        // Category
        const categoryText = skillData?.category_name || ""
        pdf.text(
          categoryText.length > 15 ? categoryText.substring(0, 15) + "..." : categoryText,
          12 + skillNameWidth,
          currentY + 5,
        )

        // Role levels
        roles.forEach((role, roleIndex) => {
          const x = 12 + skillNameWidth + categoryWidth + roleIndex * roleWidth
          const skill = matrix[skillName][role.id]
          if (skill) {
            pdf.text(skill.level, x, currentY + 5)
          } else {
            pdf.text("-", x, currentY + 5)
          }
        })

        currentY += cellHeight
      })

      // Save the PDF
      const filename = `${departmentName}-Skills-Matrix-${categoryName}-${new Date().toISOString().split("T")[0]}.pdf`
      pdf.save(filename)
    } catch (error) {
      console.error("Error generating PDF:", error)
      setError("Failed to generate PDF")
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">Loading skills matrix...</div>
      </div>
    )
  }

  const skillsByCategory = getSkillsByCategory()

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Demo Mode Alert */}
      {isDemoMode && (
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Demo Mode:</strong> Skills data is simulated for demonstration purposes.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header with Export Options */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{departmentName} Skills Matrix</h1>
          <p className="text-gray-600 mt-1">Compare skills and levels across different roles in {departmentName}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {skillCategories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={exportToPDF} variant="outline" size="sm" disabled={isExporting}>
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? "Generating..." : "Export PDF"}
          </Button>
        </div>
      </div>

      {/* Skills Matrix */}
      <div className="space-y-8">
        {Object.entries(skillsByCategory).map(([categoryName, categorySkills]) => {
          const category = skillCategories.find((c) => c.name === categoryName)
          const colorClasses = getColorClasses(category?.color || "gray")

          return (
            <Card key={categoryName}>
              <CardHeader>
                <CardTitle className={`text-${category?.color || "gray"}-700`}>{categoryName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium text-gray-900 min-w-[200px]">Skill</th>
                        {roles.map((role) => (
                          <th key={role.id} className="text-center p-3 font-medium text-gray-900 min-w-[120px]">
                            <div className="flex flex-col">
                              <span className="text-sm">{role.name}</span>
                              <span className="text-xs text-gray-500 font-normal">({role.code})</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {categorySkills
                        .reduce((uniqueSkills: string[], skill) => {
                          if (!uniqueSkills.includes(skill.name)) {
                            uniqueSkills.push(skill.name)
                          }
                          return uniqueSkills
                        }, [])
                        .map((skillName) => {
                          const skillsForThisName = categorySkills.filter((s) => s.name === skillName)
                          const firstSkill = skillsForThisName[0]

                          return (
                            <tr key={skillName} className="border-b hover:bg-gray-50">
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{skillName}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedSkill(firstSkill)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                </div>
                              </td>
                              {roles.map((role) => {
                                const skill = skillsForThisName.find((s) => s.job_role_id === role.id)
                                return (
                                  <td key={role.id} className="p-3 text-center">
                                    {skill ? (
                                      <div className="flex flex-col items-center gap-1">
                                        <Badge variant="outline" className="text-xs">
                                          {skill.level}
                                        </Badge>
                                        <span className="text-xs text-gray-600 text-center leading-tight">
                                          {skill.description.length > 50
                                            ? `${skill.description.substring(0, 50)}...`
                                            : skill.description}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </td>
                                )
                              })}
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Skill Detail Dialog */}
      <Dialog open={!!selectedSkill} onOpenChange={() => setSelectedSkill(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSkill?.name}</DialogTitle>
          </DialogHeader>
          {selectedSkill && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedSkill.level}</Badge>
                <Badge
                  className={getColorClasses(selectedSkill.category_color)
                    .replace("bg-", "")
                    .replace("text-", "")
                    .replace("border-", "")}
                >
                  {selectedSkill.category_name}
                </Badge>
              </div>
              <div>
                <h4 className="font-medium mb-2">Demonstration Description</h4>
                <p className="text-sm text-gray-600">{selectedSkill.description}</p>
              </div>
              {selectedSkill.full_description && (
                <div>
                  <h4 className="font-medium mb-2">Skill Description</h4>
                  <div className="text-sm text-gray-600 whitespace-pre-wrap">{selectedSkill.full_description}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
