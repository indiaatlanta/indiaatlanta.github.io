"use client"

import { useState, useEffect } from "react"
import {
  MoreHorizontal,
  ClipboardCheck,
  GitCompare,
  Grid3X3,
  Eye,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import * as XLSX from "xlsx"
import type { User } from "@/lib/auth"

interface Department {
  id: number
  name: string
  slug: string
  description: string
}

interface Role {
  id: number
  name: string
  code: string
  level: number
  salary_min?: number
  salary_max?: number
  location_type?: string
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
  skill_sort_order?: number
  category_sort_order?: number
  category?: string
  name?: string
  description?: string
}

interface MatrixSkill {
  skill_name: string
  category_name: string
  category_color: string
  skill_description?: string
  skill_sort_order?: number
  category_sort_order?: number
  demonstrations: Record<number, { level: string; description: string }>
}

interface JobRole {
  id: number
  title: string
  description: string
  requirements: string
}

interface Props {
  department: Department
  roles: Role[]
  isDemoMode: boolean
}

interface DepartmentClientProps {
  slug: string
  user: User
}

export function DepartmentClient({ department, roles, isDemoMode }: Props) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [roleSkills, setRoleSkills] = useState<Skill[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoadingSkills, setIsLoadingSkills] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [isSkillDetailOpen, setIsSkillDetailOpen] = useState(false)
  const [isMatrixOpen, setIsMatrixOpen] = useState(false)
  const [matrixData, setMatrixData] = useState<MatrixSkill[]>([])
  const [isLoadingMatrix, setIsLoadingMatrix] = useState(false)
  const [selectedMatrixSkill, setSelectedMatrixSkill] = useState<MatrixSkill | null>(null)
  const [isMatrixSkillDetailOpen, setIsMatrixSkillDetailOpen] = useState(false)
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all")
  const [isExportingMatrix, setIsExportingMatrix] = useState(false)
  const [skills, setSkills] = useState<Skill[]>([])
  const [jobRoles, setJobRoles] = useState<JobRole[]>([])
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")

  const departmentName = department?.name || ""
  const slug = department?.slug || ""

  useEffect(() => {
    fetchDepartmentData()
  }, [slug])

  useEffect(() => {
    filterSkills()
  }, [skills, searchTerm, categoryFilter, levelFilter])

  const fetchDepartmentData = async () => {
    try {
      setLoading(true)

      // Fetch skills
      const skillsResponse = await fetch("/api/skills")
      const skillsData = await skillsResponse.json()
      setSkills(skillsData)

      // Fetch job roles for this department
      const rolesResponse = await fetch(`/api/roles?department_slug=${slug}`)
      const rolesData = await rolesResponse.json()
      setJobRoles(rolesData)
    } catch (error) {
      console.error("Error fetching department data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterSkills = () => {
    let filtered = skills

    if (searchTerm) {
      filtered = filtered.filter(
        (skill) =>
          skill.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          skill.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((skill) => skill.category === categoryFilter)
    }

    if (levelFilter !== "all") {
      filtered = filtered.filter((skill) => skill.level === levelFilter)
    }

    // Sort by category first, then by name
    filtered.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category?.localeCompare(b.category || "") || 0
      }
      return a.name?.localeCompare(b.name || "") || 0
    })

    setFilteredSkills(filtered)
  }

  const getUniqueCategories = () => {
    const categories = [...new Set(skills.map((skill) => skill.category))]
    return categories.sort()
  }

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-orange-100 text-orange-800"
      case "expert":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const exportToExcel = () => {
    const exportData = filteredSkills.map((skill) => ({
      Name: skill.name,
      Category: skill.category,
      Level: skill.level,
      Description: skill.description,
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Skills Matrix")
    XLSX.writeFile(wb, `${departmentName}_Skills_Matrix.xlsx`)
  }

  const exportToPDF = () => {
    const doc = new jsPDF()

    // Add logo
    const logoImg = new Image()
    logoImg.crossOrigin = "anonymous"
    logoImg.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      canvas.width = logoImg.width
      canvas.height = logoImg.height
      ctx?.drawImage(logoImg, 0, 0)

      try {
        const logoDataUrl = canvas.toDataURL("image/png")
        doc.addImage(logoDataUrl, "PNG", 15, 15, 40, 12)
      } catch (error) {
        console.warn("Could not add logo to PDF:", error)
      }

      generatePDFContent(doc)
    }

    logoImg.onerror = () => {
      generatePDFContent(doc)
    }

    logoImg.src = "/images/hs1-logo.png"
  }

  const generatePDFContent = (doc: jsPDF) => {
    // Title
    doc.setFontSize(20)
    doc.text(`${departmentName} Skills Matrix`, 15, 40)

    // Date
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 50)

    let yPosition = 65

    // Group skills by category
    const skillsByCategory = filteredSkills.reduce(
      (acc, skill) => {
        if (!acc[skill.category!]) {
          acc[skill.category!] = []
        }
        acc[skill.category!].push(skill)
        return acc
      },
      {} as Record<string, Skill[]>,
    )

    Object.entries(skillsByCategory).forEach(([category, categorySkills]) => {
      // Category header
      doc.setFontSize(14)
      doc.setFont(undefined, "bold")
      doc.text(category, 15, yPosition)
      yPosition += 10

      // Skills in category
      doc.setFontSize(10)
      doc.setFont(undefined, "normal")

      categorySkills.forEach((skill) => {
        if (yPosition > 270) {
          doc.addPage()
          yPosition = 20
        }

        doc.text(`• ${skill.name} (${skill.level})`, 20, yPosition)
        yPosition += 5

        if (skill.description) {
          const splitDescription = doc.splitTextToSize(`  ${skill.description}`, 170)
          doc.text(splitDescription, 20, yPosition)
          yPosition += splitDescription.length * 4
        }
        yPosition += 3
      })

      yPosition += 5
    })

    doc.save(`${departmentName}_Skills_Matrix.pdf`)
  }

  const handleRoleClick = async (role: Role) => {
    setSelectedRole(role)
    setIsModalOpen(true)
    setIsLoadingSkills(true)

    try {
      const response = await fetch(`/api/role-skills?roleId=${role.id}`)
      const skills = response.ok ? await response.json() : []
      setRoleSkills(skills)
    } catch (error) {
      console.error("Error loading skills:", error)
      setRoleSkills([])
    } finally {
      setIsLoadingSkills(false)
    }
  }

  const handleMatrixClick = async () => {
    setIsMatrixOpen(true)
    setIsLoadingMatrix(true)

    try {
      // Fetch skills for all roles in this department
      const skillsPromises = roles.map(async (role) => {
        const response = await fetch(`/api/role-skills?roleId=${role.id}`)
        const skills = response.ok ? await response.json() : []
        return { roleId: role.id, skills }
      })

      const allRoleSkills = await Promise.all(skillsPromises)

      // Create a map of all unique skills and their demonstrations per role
      const skillsMap = new Map<string, MatrixSkill>()

      allRoleSkills.forEach(({ roleId, skills }) => {
        skills.forEach((skill: Skill) => {
          const key = skill.skill_name
          if (!skillsMap.has(key)) {
            skillsMap.set(key, {
              skill_name: skill.skill_name,
              category_name: skill.category_name,
              category_color: skill.category_color,
              skill_description: skill.skill_description,
              skill_sort_order: skill.skill_sort_order,
              category_sort_order: skill.category_sort_order,
              demonstrations: {},
            })
          }

          const matrixSkill = skillsMap.get(key)!
          matrixSkill.demonstrations[roleId] = {
            level: skill.level,
            description: skill.demonstration_description,
          }
        })
      })

      // Convert to array and sort by category sort order, then skill sort order
      const sortedSkills = Array.from(skillsMap.values()).sort((a, b) => {
        // First sort by category sort order
        const aCategorySort = a.category_sort_order || 999
        const bCategorySort = b.category_sort_order || 999
        if (aCategorySort !== bCategorySort) {
          return aCategorySort - bCategorySort
        }

        // Then by skill sort order within the same category
        const aSkillSort = a.skill_sort_order || 999
        const bSkillSort = b.skill_sort_order || 999
        if (aSkillSort !== bSkillSort) {
          return aSkillSort - bSkillSort
        }

        // Finally by skill name as fallback
        return a.skill_name.localeCompare(b.skill_name)
      })

      setMatrixData(sortedSkills)
    } catch (error) {
      console.error("Error loading matrix data:", error)
      setMatrixData([])
    } finally {
      setIsLoadingMatrix(false)
    }
  }

  const handleMatrixSkillClick = (skill: MatrixSkill) => {
    setSelectedMatrixSkill(skill)
    setIsMatrixSkillDetailOpen(true)
  }

  const exportMatrixToCSV = () => {
    if (matrixData.length === 0) return

    // Sort roles: Individual contributors first (E1, E2, etc.), then leadership (M1, M2, etc.)
    const sortedRoles = [...roles].sort((a, b) => {
      const aIsLeadership = a.code.startsWith("M")
      const bIsLeadership = b.code.startsWith("M")
      if (aIsLeadership !== bIsLeadership) {
        return aIsLeadership ? 1 : -1
      }
      return a.level - b.level
    })

    // Filter data based on category filter
    const filteredData =
      selectedCategoryFilter === "all"
        ? matrixData
        : matrixData.filter((skill) => skill.category_name === selectedCategoryFilter)

    // Create CSV headers
    const headers = ["Category", "Skill", ...sortedRoles.map((role) => `${role.name} (${role.code})`)]

    // Create CSV rows
    const rows = filteredData.map((skill) => {
      const row = [
        `"${skill.category_name}"`,
        `"${skill.skill_name}"`,
        ...sortedRoles.map((role) => {
          const demonstration = skill.demonstrations[role.id]
          if (demonstration) {
            return `"${demonstration.level}: ${demonstration.description.replace(/"/g, '""')}"`
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
    link.setAttribute("download", `${department.name}-skills-matrix-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportMatrixToPDFOld = async () => {
    if (matrixData.length === 0) return

    setIsExportingMatrix(true)
    try {
      const matrixElement = document.getElementById("skills-matrix-content")
      if (!matrixElement) return

      // Create a temporary container with better styling for PDF
      const tempContainer = document.createElement("div")
      tempContainer.style.position = "absolute"
      tempContainer.style.left = "-9999px"
      tempContainer.style.top = "0"
      tempContainer.style.width = "1200px"
      tempContainer.style.backgroundColor = "white"
      tempContainer.style.padding = "20px"
      tempContainer.style.fontFamily = "Arial, sans-serif"

      // Clone the matrix content
      const clonedMatrix = matrixElement.cloneNode(true) as HTMLElement

      // Add title
      const title = document.createElement("h1")
      title.textContent = `${department.name} Skills Matrix`
      title.style.fontSize = "24px"
      title.style.marginBottom = "20px"
      title.style.textAlign = "center"

      tempContainer.appendChild(title)
      tempContainer.appendChild(clonedMatrix)
      document.body.appendChild(tempContainer)

      const canvas = await html2canvas(tempContainer, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: 1200,
        height: tempContainer.scrollHeight,
      })

      document.body.removeChild(tempContainer)

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("l", "mm", "a3") // Landscape A3 for better table fit

      // Add logo
      const logoImg = new Image()
      logoImg.crossOrigin = "anonymous"
      logoImg.onload = () => {
        // Add logo (smaller for landscape)
        pdf.addImage(logoImg, "PNG", 10, 10, 32, 5)

        // Add title
        pdf.setFontSize(16)
        pdf.text(`${department.name} Skills Matrix`, 50, 18)

        // Add date
        pdf.setFontSize(10)
        pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 50, 25)

        // Add matrix content
        const imgWidth = 400 // A3 landscape width minus margins
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        let yPosition = 35
        const pageHeight = 287 // A3 height minus margins

        if (imgHeight > pageHeight - yPosition) {
          // If image is too tall, we might need multiple pages
          const pagesNeeded = Math.ceil(imgHeight / (pageHeight - yPosition))

          for (let page = 0; page < pagesNeeded; page++) {
            if (page > 0) {
              pdf.addPage()
              yPosition = 10
            }

            const sourceY = page * (pageHeight - yPosition) * (canvas.height / imgHeight)
            const sourceHeight = Math.min(
              (pageHeight - yPosition) * (canvas.height / imgHeight),
              canvas.height - sourceY,
            )

            // Create a temporary canvas for this page section
            const pageCanvas = document.createElement("canvas")
            pageCanvas.width = canvas.width
            pageCanvas.height = sourceHeight
            const pageCtx = pageCanvas.getContext("2d")!

            pageCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight)

            const pageImgData = pageCanvas.toDataURL("image/png")
            const pageImgHeight = (sourceHeight * imgWidth) / canvas.width

            pdf.addImage(pageImgData, "PNG", 10, yPosition, imgWidth, pageImgHeight)
          }
        } else {
          pdf.addImage(imgData, "PNG", 10, yPosition, imgWidth, imgHeight)
        }

        const filename =
          selectedCategoryFilter === "all"
            ? `${department.name}-skills-matrix-${new Date().toISOString().split("T")[0]}.pdf`
            : `${department.name}-skills-matrix-${selectedCategoryFilter.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`

        pdf.save(filename)
        setIsExportingMatrix(false)
      }
      logoImg.src = "/images/hs1-logo.png"
    } catch (error) {
      console.error("Error generating PDF:", error)
      setIsExportingMatrix(false)
    }
  }

  const formatSalary = (role: Role) => {
    if (!role.salary_min || !role.salary_max) {
      return "Salary not specified"
    }
    return `£${role.salary_min.toLocaleString()} - £${role.salary_max.toLocaleString()} (GBP) - UK, ${role.location_type || "Hybrid"}`
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

  const parseSkillLevel = (level: string | null | undefined): number => {
    if (!level) return 0
    // Match any letter followed by a number (L1, L2, M1, M2, etc.)
    const match = level.match(/[A-Z](\d+)/)
    return match ? Number.parseInt(match[1], 10) : 0
  }

  const getSkillLevelDots = (skill: Skill) => {
    if (!skill.level) {
      return null
    }

    const levelNum = parseSkillLevel(skill.level)
    if (levelNum === 0) return null

    // Use a maximum of 5 dots for display, but show the actual level number
    const maxDots = 5
    const dotsToShow = Math.min(levelNum, maxDots)

    return (
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          {Array.from({ length: dotsToShow }, (_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full bg-${skill.category_color}-500`} />
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

  const organizeRoles = (roles: Role[]) => {
    const regularRoles = roles.filter((role) => !role.code.startsWith("M"))
    const leadershipRoles = roles.filter((role) => role.code.startsWith("M"))

    return { regularRoles, leadershipRoles }
  }

  const { regularRoles, leadershipRoles } = organizeRoles(roles)

  // Group matrix data by category and preserve sort order
  const matrixByCategory = matrixData.reduce(
    (acc, skill) => {
      if (!acc[skill.category_name]) {
        acc[skill.category_name] = {
          color: skill.category_color,
          skills: [],
          category_sort_order: skill.category_sort_order || 999,
        }
      }
      acc[skill.category_name].skills.push(skill)
      return acc
    },
    {} as Record<string, { color: string; skills: MatrixSkill[]; category_sort_order: number }>,
  )

  // Sort categories by their sort order and skills within categories are already sorted from the main sort
  const sortedCategories = Object.entries(matrixByCategory).sort(([, a], [, b]) => {
    return a.category_sort_order - b.category_sort_order
  })

  // Get unique categories for filter
  const availableCategories = Array.from(new Set(matrixData.map((skill) => skill.category_name))).sort((a, b) => {
    const aSort = matrixData.find((skill) => skill.category_name === a)?.category_sort_order || 999
    const bSort = matrixData.find((skill) => skill.category_name === b)?.category_sort_order || 999
    return aSort - bSort
  })

  // Filter categories based on selection
  const filteredCategories =
    selectedCategoryFilter === "all"
      ? sortedCategories
      : sortedCategories.filter(([categoryName]) => categoryName === selectedCategoryFilter)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading department data...</div>
      </div>
    )
  }

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

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {department.name} <span className="text-gray-500">({roles.length})</span>
        </h1>
        {department.description && <p className="text-gray-600">{department.description}</p>}

        {/* Role breakdown */}
        {roles.length > 0 && (
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
            <span>Individual Contributors: {regularRoles.length}</span>
            {leadershipRoles.length > 0 && <span>Leadership: {leadershipRoles.length}</span>}
          </div>
        )}

        {/* Action buttons */}
        {roles.length > 0 && (
          <div className="flex items-center gap-3 mt-4">
            <Button onClick={handleMatrixClick} className="bg-brand-600 hover:bg-brand-700 flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Skills Matrix
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{departmentName} Department</h1>
          <p className="text-gray-600 mt-2">Skills matrix and job roles for the {departmentName} department</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={exportToExcel} variant="outline" size="sm">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button onClick={exportToPDF} variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="skills" className="space-y-4">
        <TabsList>
          <TabsTrigger value="skills">Skills Matrix</TabsTrigger>
          <TabsTrigger value="roles">Job Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {getUniqueCategories().map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>

                <div className="text-sm text-gray-600 flex items-center">
                  Showing {filteredSkills.length} of {skills.length} skills
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSkills.map((skill) => (
              <Card key={skill.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{skill.name}</CardTitle>
                    <Badge className={getLevelColor(skill.level)}>{skill.level}</Badge>
                  </div>
                  <Badge variant="outline" className="w-fit">
                    {skill.category}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{skill.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredSkills.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No skills found matching your filters.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobRoles.map((role) => (
              <Card key={role.id}>
                <CardHeader>
                  <CardTitle>{role.title}</CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-medium">Requirements:</h4>
                    <p className="text-sm text-gray-600">{role.requirements}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {jobRoles.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No job roles found for this department.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Regular Roles Section */}
      {regularRoles.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Individual Contributor Roles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {regularRoles.map((role) => (
              <div
                key={role.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleRoleClick(role)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      {role.code} • {role.skill_count} skills
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{role.name}</h3>
                <div className="h-32 bg-gray-50 rounded border-2 border-dashed border-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Level {role.level}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leadership Roles Section */}
      {leadershipRoles.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <span>Leadership</span>
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
              Management Track
            </Badge>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {leadershipRoles.map((role) => (
              <div
                key={role.id}
                className="bg-white rounded-lg border border-indigo-200 p-6 hover:shadow-md transition-shadow cursor-pointer relative"
                onClick={() => handleRoleClick(role)}
              >
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 text-xs">
                    Leadership
                  </Badge>
                </div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      {role.code} • {role.skill_count} skills
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{role.name}</h3>
                <div className="h-32 bg-indigo-50 rounded border-2 border-dashed border-indigo-200 flex items-center justify-center">
                  <span className="text-indigo-600 text-sm">Level {role.level}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Roles Message */}
      {regularRoles.length === 0 && leadershipRoles.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No positions available</div>
          <div className="text-gray-500 text-sm">This department currently has no defined roles.</div>
        </div>
      )}

      {/* Skills Matrix Modal */}
      <Dialog open={isMatrixOpen} onOpenChange={setIsMatrixOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Grid3X3 className="w-5 h-5" />
                {department.name} Skills Matrix
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportMatrixToCSV}
                  disabled={matrixData.length === 0}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportMatrixToPDFOld}
                  disabled={matrixData.length === 0 || isExportingMatrix}
                  className="flex items-center gap-2 bg-transparent"
                >
                  {isExportingMatrix ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Export PDF
                    </>
                  )}
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          {isLoadingMatrix ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading skills matrix...</div>
            </div>
          ) : matrixData.length > 0 ? (
            <div className="space-y-6">
              {/* Category Filter */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filter by Category:</span>
                <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {availableCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCategoryFilter !== "all" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCategoryFilter("all")}
                    className="text-xs"
                  >
                    Clear Filter
                  </Button>
                )}
              </div>

              {/* Skills Matrix */}
              <div id="skills-matrix-content" className="space-y-8">
                {filteredCategories.map(([categoryName, categoryData]) => (
                  <div key={categoryName}>
                    <h3
                      className={`text-lg font-semibold mb-4 border-b pb-2 text-${categoryData.color}-700 border-${categoryData.color}-200`}
                    >
                      {categoryName}
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 p-3 text-left font-medium text-gray-900 min-w-[200px]">
                              Skill
                            </th>
                            {(() => {
                              // Sort roles: Individual contributors first (E1, E2, etc.), then leadership (M1, M2, etc.)
                              const sortedRoles = [...roles].sort((a, b) => {
                                const aIsLeadership = a.code.startsWith("M")
                                const bIsLeadership = b.code.startsWith("M")

                                // If one is leadership and one isn't, non-leadership comes first
                                if (aIsLeadership !== bIsLeadership) {
                                  return aIsLeadership ? 1 : -1
                                }

                                // If both are same type, sort by level
                                return a.level - b.level
                              })

                              return sortedRoles
                            })().map((role) => (
                              <th
                                key={role.id}
                                className="border border-gray-300 p-3 text-center font-medium text-gray-900 min-w-[300px]"
                              >
                                <div className="flex flex-col items-center gap-1">
                                  <Badge variant="outline" className="text-xs">
                                    {role.code}
                                  </Badge>
                                  <span className="text-sm">{role.name}</span>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {categoryData.skills.map((skill) => (
                            <tr key={skill.skill_name} className="hover:bg-gray-50">
                              <td className="border border-gray-300 p-3 font-medium text-gray-900">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                                      {skill.category_name}
                                    </div>
                                    <span>{skill.skill_name}</span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleMatrixSkillClick(skill)
                                    }}
                                    className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                </div>
                              </td>
                              {(() => {
                                // Sort roles: Individual contributors first (E1, E2, etc.), then leadership (M1, M2, etc.)
                                const sortedRoles = [...roles].sort((a, b) => {
                                  const aIsLeadership = a.code.startsWith("M")
                                  const bIsLeadership = b.code.startsWith("M")

                                  // If one is leadership and one isn't, non-leadership comes first
                                  if (aIsLeadership !== bIsLeadership) {
                                    return aIsLeadership ? 1 : -1
                                  }

                                  // If both are same type, sort by level
                                  return a.level - b.level
                                })

                                return sortedRoles
                              })().map((role) => {
                                const demonstration = skill.demonstrations[role.id]
                                return (
                                  <td key={role.id} className="border border-gray-300 p-4 text-sm">
                                    {demonstration ? (
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-center">
                                          <Badge variant="outline" className="text-xs">
                                            {demonstration.level}
                                          </Badge>
                                        </div>
                                        <div className="text-gray-700 text-xs leading-relaxed">
                                          {demonstration.description}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-center text-gray-400 text-xs">—</div>
                                    )}
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg mb-2">No skills data available</div>
              <div className="text-gray-500 text-sm">
                This department currently has no skills defined for its roles.
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Matrix Skill Detail Modal */}
      <Dialog open={isMatrixSkillDetailOpen} onOpenChange={setIsMatrixSkillDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{selectedMatrixSkill?.skill_name || "Skill Definition"}</span>
            </DialogTitle>
          </DialogHeader>

          {selectedMatrixSkill && (
            <div className="space-y-6">
              {/* Skill Category */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Category</h4>
                <Badge variant="secondary" className={`${getColorClasses(selectedMatrixSkill.category_color)} border`}>
                  {selectedMatrixSkill.category_name}
                </Badge>
              </div>

              {/* Skill Description */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Skill Definition</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {selectedMatrixSkill.skill_description ||
                      "This skill definition provides the foundational understanding and context for what this skill encompasses across all roles."}
                  </p>
                </div>
              </div>

              {/* Role-Specific Demonstrations */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Role-Specific Demonstrations</h4>
                <div className="space-y-4">
                  {(() => {
                    // Sort roles: Individual contributors first (E1, E2, etc.), then leadership (M1, M2, etc.)
                    const sortedRoles = [...roles].sort((a, b) => {
                      const aIsLeadership = a.code.startsWith("M")
                      const bIsLeadership = b.code.startsWith("M")

                      // If one is leadership and one isn't, non-leadership comes first
                      if (aIsLeadership !== bIsLeadership) {
                        return aIsLeadership ? 1 : -1
                      }

                      // If both are same type, sort by level
                      return a.level - b.level
                    })

                    return sortedRoles
                  })().map((role) => {
                    const demonstration = selectedMatrixSkill.demonstrations[role.id]
                    return (
                      <div key={role.id} className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {role.code}
                          </Badge>
                          <span className="font-medium text-gray-900">{role.name}</span>
                          {demonstration && (
                            <Badge variant="outline" className="text-xs">
                              {demonstration.level}
                            </Badge>
                          )}
                        </div>
                        {demonstration ? (
                          <p className="text-sm text-gray-700 leading-relaxed">{demonstration.description}</p>
                        ) : (
                          <p className="text-sm text-gray-400 italic">This skill is not required for this role</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setIsMatrixSkillDetailOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Role Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>
                HS1 🚀 {department.name}: {selectedRole?.code}
              </span>
            </DialogTitle>
          </DialogHeader>

          {selectedRole && (
            <div className="space-y-6">
              {/* Role Header */}
              <div>
                <Badge variant="outline" className="mb-2">
                  {selectedRole.code}
                </Badge>
                <h2 className="text-2xl font-bold">{selectedRole.name}</h2>
                <p className="text-gray-600 mt-1">Level {selectedRole.level}</p>
              </div>

              {/* Salary Section */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Salary</h3>
                <div className="text-gray-700">{formatSalary(selectedRole)}</div>
                <div className="flex flex-col gap-2 mt-3">
                  <Link
                    href={`/self-review?roleId=${selectedRole.id}`}
                    className="text-brand-600 hover:text-brand-700 text-sm flex items-center gap-1"
                  >
                    <ClipboardCheck className="w-3 h-3" />
                    Review yourself
                  </Link>
                  <Link
                    href={`/compare?role1=${selectedRole.id}`}
                    className="text-brand-600 hover:text-brand-700 text-sm flex items-center gap-1"
                  >
                    <GitCompare className="w-3 h-3" />
                    Compare against another role
                  </Link>
                </div>
              </div>

              {/* Skills Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Skills ({roleSkills.length})</h3>

                {isLoadingSkills ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">Loading skills...</div>
                  </div>
                ) : roleSkills.length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(skillsByCategory).map(([categoryName, categoryData]) => (
                      <div key={categoryName}>
                        <h4
                          className={`text-lg font-semibold mb-4 border-b pb-2 text-${categoryData.color}-700 border-${categoryData.color}-200`}
                        >
                          {categoryName}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {categoryData.skills.map((skill) => (
                            <div
                              key={skill.id}
                              className={`p-4 rounded-lg border ${getColorClasses(categoryData.color)}`}
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-medium">{skill.skill_name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {skill.level}
                                </Badge>
                                {(() => {
                                  const levelNum = parseSkillLevel(skill.level)
                                  if (levelNum === 0) return null
                                  const maxDots = 5
                                  const dotsToShow = Math.min(levelNum, maxDots)
                                  return (
                                    <div className="flex items-center gap-1">
                                      <div className="flex gap-1">
                                        {Array.from({ length: dotsToShow }, (_, i) => (
                                          <div
                                            key={i}
                                            className={`w-2 h-2 rounded-full bg-${categoryData.color}-500`}
                                          />
                                        ))}
                                        {levelNum > maxDots && (
                                          <span className="text-xs text-gray-500 ml-1">+{levelNum - maxDots}</span>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })()}
                              </div>
                              <p className="text-sm mb-3">
                                {skill.demonstration_description || "No demonstration description available"}
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedSkill(skill)
                                  setIsSkillDetailOpen(true)
                                }}
                                className="text-xs"
                              >
                                Show Details
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-lg mb-2">No skills defined</div>
                    <div className="text-gray-500 text-sm">This role currently has no skills defined.</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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

              {/* Skill Level */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Level</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedSkill.level}</Badge>
                  {getSkillLevelDots(selectedSkill)}
                </div>
              </div>

              {/* Demonstration Description */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Demonstration Description</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-800 text-sm leading-relaxed">
                    {selectedSkill.demonstration_description || "No demonstration description available"}
                  </p>
                </div>
              </div>

              {/* Skill Description */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Skill Description</h4>
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {selectedSkill.skill_description ||
                      selectedSkill.demonstration_description ||
                      "No skill description available"}
                  </p>
                </div>
              </div>

              {/* Role Context */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Role Context</h4>
                <p className="text-sm text-gray-600">
                  This skill is part of the <strong>{selectedRole?.name || "Unknown Role"}</strong> (
                  {selectedRole?.code || "N/A"}) role requirements.
                </p>
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
