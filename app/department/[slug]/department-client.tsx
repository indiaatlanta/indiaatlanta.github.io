"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, Download, FileSpreadsheet, AlertCircle, Info, Grid3X3 } from "lucide-react"
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

export default function DepartmentClient({ departmentSlug, departmentName }: DepartmentClientProps) {
  const [roles, setRoles] = useState<JobRole[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [selectedRole, setSelectedRole] = useState<JobRole | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isExporting, setIsExporting] = useState(false)
  const [showMatrix, setShowMatrix] = useState(false)

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
      if (!response.ok) {
        throw new Error("Failed to fetch roles")
      }
      const data = await response.json()

      // Ensure roles is always an array
      const rolesData = Array.isArray(data.roles) ? data.roles : []
      setRoles(rolesData)
      setIsDemoMode(data.isDemoMode || false)

      // If no roles from API, use demo data
      if (rolesData.length === 0) {
        const demoRoles: JobRole[] = [
          {
            id: 1,
            name: "Software Engineer I",
            code: "SE1",
            level: 1,
            salary_min: 70000,
            salary_max: 90000,
            location_type: "Hybrid",
            department_name: departmentName,
            skill_count: 12,
          },
          {
            id: 2,
            name: "Software Engineer II",
            code: "SE2",
            level: 2,
            salary_min: 90000,
            salary_max: 120000,
            location_type: "Hybrid",
            department_name: departmentName,
            skill_count: 15,
          },
          {
            id: 3,
            name: "Senior Software Engineer",
            code: "SSE",
            level: 3,
            salary_min: 120000,
            salary_max: 160000,
            location_type: "Hybrid",
            department_name: departmentName,
            skill_count: 18,
          },
          {
            id: 4,
            name: "Engineering Manager",
            code: "M1",
            level: 4,
            salary_min: 140000,
            salary_max: 180000,
            location_type: "Hybrid",
            department_name: departmentName,
            skill_count: 20,
          },
          {
            id: 5,
            name: "Senior Engineering Manager",
            code: "M2",
            level: 5,
            salary_min: 160000,
            salary_max: 220000,
            location_type: "Hybrid",
            department_name: departmentName,
            skill_count: 22,
          },
        ]
        setRoles(demoRoles)
        setIsDemoMode(true)
      }
    } catch (error) {
      console.error("Error loading roles:", error)
      setError("Failed to load roles")

      // Fallback to demo data on error
      const demoRoles: JobRole[] = [
        {
          id: 1,
          name: "Software Engineer I",
          code: "SE1",
          level: 1,
          salary_min: 70000,
          salary_max: 90000,
          location_type: "Hybrid",
          department_name: departmentName,
          skill_count: 12,
        },
        {
          id: 2,
          name: "Software Engineer II",
          code: "SE2",
          level: 2,
          salary_min: 90000,
          salary_max: 120000,
          location_type: "Hybrid",
          department_name: departmentName,
          skill_count: 15,
        },
      ]
      setRoles(demoRoles)
      setIsDemoMode(true)
    }
  }

  const loadSkills = async () => {
    try {
      const skillPromises = roles.map(async (role) => {
        try {
          const response = await fetch(`/api/skills?jobRoleId=${role.id}`)
          if (!response.ok) {
            throw new Error(`Failed to fetch skills for role ${role.id}`)
          }
          const data = await response.json()
          return Array.isArray(data) ? data : []
        } catch (error) {
          console.error(`Error loading skills for role ${role.id}:`, error)
          return []
        }
      })

      const skillResults = await Promise.all(skillPromises)
      const allSkills = skillResults.flat()

      // If no skills from API, use demo data
      if (allSkills.length === 0) {
        const demoSkills: Skill[] = [
          {
            id: 1,
            name: "JavaScript/TypeScript",
            level: "Intermediate",
            description: "Proficient in modern JavaScript and TypeScript development",
            full_description:
              "Strong understanding of ES6+ features, async/await, and TypeScript type system. Can build complex applications with proper type safety.",
            category_id: 1,
            category_name: "Technical Skills",
            category_color: "blue",
            job_role_id: 1,
            sort_order: 1,
          },
          {
            id: 2,
            name: "React/Next.js",
            level: "Intermediate",
            description: "Experience building React applications with Next.js",
            full_description:
              "Comfortable with React hooks, component lifecycle, and Next.js features including SSR, SSG, and API routes.",
            category_id: 1,
            category_name: "Technical Skills",
            category_color: "blue",
            job_role_id: 1,
            sort_order: 2,
          },
          {
            id: 3,
            name: "Problem Solving",
            level: "Intermediate",
            description: "Ability to break down complex problems and find solutions",
            full_description:
              "Can analyze requirements, identify edge cases, and implement effective solutions with proper testing.",
            category_id: 2,
            category_name: "Delivery",
            category_color: "green",
            job_role_id: 1,
            sort_order: 3,
          },
          {
            id: 4,
            name: "Team Collaboration",
            level: "Advanced",
            description: "Works effectively with cross-functional teams",
            full_description:
              "Excellent communication skills, provides constructive feedback, and mentors junior team members.",
            category_id: 3,
            category_name: "Feedback, Communication & Collaboration",
            category_color: "purple",
            job_role_id: 4,
            sort_order: 1,
          },
          {
            id: 5,
            name: "Technical Leadership",
            level: "Advanced",
            description: "Leads technical decisions and architecture",
            full_description:
              "Makes strategic technical decisions, defines architecture patterns, and guides team technical direction.",
            category_id: 4,
            category_name: "Leadership",
            category_color: "indigo",
            job_role_id: 4,
            sort_order: 2,
          },
        ]
        setSkills(demoSkills)
        setIsDemoMode(true)
      } else {
        setSkills(allSkills)
      }
    } catch (error) {
      console.error("Error loading skills:", error)
      setError("Failed to load skills")
      setSkills([])
    } finally {
      setIsLoading(false)
    }
  }

  const getSkillsForRole = (roleId: number) => {
    return skills.filter((skill) => skill.job_role_id === roleId)
  }

  const getSkillsByCategory = (roleSkills: Skill[]) => {
    const categorizedSkills: { [categoryName: string]: Skill[] } = {}

    roleSkills.forEach((skill) => {
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

  // Separate IC and Manager roles
  const icRoles = roles.filter((role) => !role.code.startsWith("M")).sort((a, b) => a.level - b.level)
  const managerRoles = roles.filter((role) => role.code.startsWith("M")).sort((a, b) => a.level - b.level)

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
        <div className="text-center">Loading roles and skills...</div>
      </div>
    )
  }

  if (showMatrix) {
    const skillsByCategory = getSkillsByCategory(skills)

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
            <Button onClick={() => setShowMatrix(false)} variant="outline" className="mb-4">
              ← Back to Roles
            </Button>
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Demo Mode Alert */}
      {isDemoMode && (
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Demo Mode:</strong> Role and skills data is simulated for demonstration purposes.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{departmentName} Roles</h1>
          <p className="text-gray-600 mt-1">Explore career paths and skill requirements in {departmentName}</p>
        </div>
        <Button onClick={() => setShowMatrix(true)} className="flex items-center gap-2">
          <Grid3X3 className="w-4 h-4" />
          Skills Matrix
        </Button>
      </div>

      {/* IC Roles Section */}
      {icRoles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Individual Contributor Roles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {icRoles.map((role) => (
              <Card
                key={role.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedRole(role)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {role.code}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Level {role.level}</span>
                    {role.salary_min && role.salary_max && (
                      <>
                        <span>•</span>
                        <span>
                          ${role.salary_min.toLocaleString()} - ${role.salary_max.toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{role.skill_count} skills required</span>
                    <Button variant="ghost" size="sm">
                      View Details →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Manager Roles Section */}
      {managerRoles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Management Roles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {managerRoles.map((role) => (
              <Card
                key={role.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedRole(role)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      {role.code}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Level {role.level}</span>
                    {role.salary_min && role.salary_max && (
                      <>
                        <span>•</span>
                        <span>
                          ${role.salary_min.toLocaleString()} - ${role.salary_max.toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{role.skill_count} skills required</span>
                    <Button variant="ghost" size="sm">
                      View Details →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Role Detail Dialog */}
      <Dialog open={!!selectedRole} onOpenChange={() => setSelectedRole(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedRole?.name}
              <Badge
                variant="outline"
                className={
                  selectedRole?.code.startsWith("M")
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }
              >
                {selectedRole?.code}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-6">
              {/* Role Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Level</h4>
                  <p className="text-sm text-gray-600">Level {selectedRole.level}</p>
                </div>
                {selectedRole.salary_min && selectedRole.salary_max && (
                  <div>
                    <h4 className="font-medium text-gray-900">Salary Range</h4>
                    <p className="text-sm text-gray-600">
                      ${selectedRole.salary_min.toLocaleString()} - ${selectedRole.salary_max.toLocaleString()}
                    </p>
                  </div>
                )}
                {selectedRole.location_type && (
                  <div>
                    <h4 className="font-medium text-gray-900">Location</h4>
                    <p className="text-sm text-gray-600">{selectedRole.location_type}</p>
                  </div>
                )}
              </div>

              {/* Skills by Category */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Skills</h3>
                {(() => {
                  const roleSkills = getSkillsForRole(selectedRole.id)
                  const skillsByCategory = getSkillsByCategory(roleSkills)

                  if (Object.keys(skillsByCategory).length === 0) {
                    return <div className="text-center py-8 text-gray-500">No skills data available for this role</div>
                  }

                  return (
                    <div className="space-y-6">
                      {Object.entries(skillsByCategory).map(([categoryName, categorySkills]) => {
                        const category = skillCategories.find((c) => c.name === categoryName)
                        const colorClasses = getColorClasses(category?.color || "gray")

                        return (
                          <div key={categoryName} className="border rounded-lg p-4">
                            <h4 className={`font-medium mb-3 text-${category?.color || "gray"}-700`}>{categoryName}</h4>
                            <div className="space-y-3">
                              {categorySkills.map((skill) => (
                                <div
                                  key={skill.id}
                                  className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h5 className="font-medium text-gray-900">{skill.name}</h5>
                                      <Badge variant="outline" className="text-xs">
                                        {skill.level}
                                      </Badge>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedSkill(skill)}
                                        className="h-6 w-6 p-0 ml-2"
                                        title="View skill description"
                                      >
                                        <Info className="w-3 h-3" />
                                      </Button>
                                    </div>
                                    <p className="text-sm text-gray-600">{skill.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
