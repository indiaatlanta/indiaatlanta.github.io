"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Eye, ArrowLeftRight, Download, FileText } from "lucide-react"

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

export function CompareClient() {
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole1, setSelectedRole1] = useState<number | null>(null)
  const [selectedRole2, setSelectedRole2] = useState<number | null>(null)
  const [role1Skills, setRole1Skills] = useState<Skill[]>([])
  const [role2Skills, setRole2Skills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<{
    skill: Skill
    role: Role
    otherRoleSkill?: Skill
    otherRole?: Role
  } | null>(null)
  const [isSkillDetailOpen, setIsSkillDetailOpen] = useState(false)

  const role1 = roles.find((r) => r.id === selectedRole1)
  const role2 = roles.find((r) => r.id === selectedRole2)

  // Load roles on component mount
  useEffect(() => {
    loadRoles()
  }, [])

  // Load skills when roles are selected
  useEffect(() => {
    if (selectedRole1 && selectedRole2) {
      loadSkillsForComparison()
    }
  }, [selectedRole1, selectedRole2])

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

  const loadSkillsForComparison = async () => {
    if (!selectedRole1 || !selectedRole2) return

    setIsLoading(true)
    try {
      const [response1, response2] = await Promise.all([
        fetch(`/api/role-skills?roleId=${selectedRole1}`),
        fetch(`/api/role-skills?roleId=${selectedRole2}`),
      ])

      const skills1 = response1.ok ? await response1.json() : []
      const skills2 = response2.ok ? await response2.json() : []

      setRole1Skills(skills1)
      setRole2Skills(skills2)
    } catch (error) {
      console.error("Error loading skills for comparison:", error)
      setRole1Skills([])
      setRole2Skills([])
    } finally {
      setIsLoading(false)
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

  // Group skills by category for both roles
  const role1SkillsByCategory = role1Skills.reduce(
    (acc, skill) => {
      if (!acc[skill.category_name]) {
        acc[skill.category_name] = { color: skill.category_color, skills: [] }
      }
      acc[skill.category_name].skills.push(skill)
      return acc
    },
    {} as Record<string, { color: string; skills: Skill[] }>,
  )

  const role2SkillsByCategory = role2Skills.reduce(
    (acc, skill) => {
      if (!acc[skill.category_name]) {
        acc[skill.category_name] = { color: skill.category_color, skills: [] }
      }
      acc[skill.category_name].skills.push(skill)
      return acc
    },
    {} as Record<string, { color: string; skills: Skill[] }>,
  )

  // Get all unique categories
  const allCategories = Array.from(
    new Set([...Object.keys(role1SkillsByCategory), ...Object.keys(role2SkillsByCategory)]),
  )

  const handleSkillClick = (skill: Skill, role: Role, isRole1: boolean) => {
    const otherRoleSkills = isRole1 ? role2Skills : role1Skills
    const otherRole = isRole1 ? role2 : role1
    const otherRoleSkill = otherRoleSkills.find((s) => s.skill_name === skill.skill_name)

    setSelectedSkill({
      skill,
      role,
      otherRoleSkill,
      otherRole,
    })
    setIsSkillDetailOpen(true)
  }

  const formatSalary = (role: Role) => {
    if (!role.salary_min || !role.salary_max) {
      return "Salary not specified"
    }
    return `£${role.salary_min.toLocaleString()} - £${role.salary_max.toLocaleString()}`
  }

  const swapRoles = () => {
    const temp = selectedRole1
    setSelectedRole1(selectedRole2)
    setSelectedRole2(temp)
  }

  const exportToPDF = async () => {
    if (!selectedRole1 || !selectedRole2 || !role1 || !role2) return

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

      // Header with brand styling
      doc.setFillColor(30, 64, 175) // brand-800 color
      doc.rect(0, 0, pageWidth, 30, "F")

      // Add logo with better quality handling
      try {
        const img = new Image()
        img.crossOrigin = "anonymous"

        await new Promise((resolve, reject) => {
          img.onload = () => {
            // Use a much smaller, fixed size without scaling to maintain quality
            const logoWidth = 30
            const logoHeight = 10

            // Add the image directly at a small size to maintain crispness
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")

            // Set canvas to 2x resolution for better quality
            canvas.width = logoWidth * 2
            canvas.height = logoHeight * 2

            if (ctx) {
              // Scale the context for high DPI
              ctx.scale(2, 2)
              // Draw the image at the target size
              ctx.drawImage(img, 0, 0, logoWidth, logoHeight)

              // Convert to base64 and add to PDF
              const logoData = canvas.toDataURL("image/png", 1.0)
              doc.addImage(logoData, "PNG", margin, 9, logoWidth, logoHeight)
            }
            resolve(true)
          }
          img.onerror = () => resolve(false) // Continue without logo if it fails
          img.src = "/images/hs1-logo.png"
        })
      } catch (error) {
        console.log("Logo could not be loaded, continuing without it")
      }

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(16)
      doc.setFont(undefined, "bold")
      doc.text("Role Comparison Report", margin + 60, 15)

      doc.setFontSize(10)
      doc.setFont(undefined, "normal")
      doc.text("Henry Schein One Career Matrix", margin + 60, 22)

      yPosition = 40
      doc.setTextColor(0, 0, 0)

      // Comparison title
      doc.setFontSize(20)
      doc.setFont(undefined, "bold")
      doc.text("Role Comparison Report", margin, yPosition)
      yPosition += 15

      doc.setFontSize(10)
      doc.setFont(undefined, "normal")
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, yPosition)
      yPosition += 20

      // Role comparison header with boxes
      doc.setFontSize(14)
      doc.setFont(undefined, "bold")

      // Role 1 box
      doc.setFillColor(96, 150, 255) // brand-500 color
      doc.rect(margin, yPosition, (pageWidth - 3 * margin) / 2, 25, "F")
      doc.setTextColor(255, 255, 255)
      doc.text(`${role1.name} (${role1.code})`, margin + 5, yPosition + 8)
      doc.text(`${role1.department_name} • Level ${role1.level}`, margin + 5, yPosition + 16)

      // VS text
      doc.setTextColor(0, 0, 0)
      doc.text("VS", pageWidth / 2 - 5, yPosition + 12)

      // Role 2 box
      doc.setFillColor(96, 150, 255) // brand-500 color
      doc.rect(pageWidth / 2 + 10, yPosition, (pageWidth - 3 * margin) / 2, 25, "F")
      doc.setTextColor(255, 255, 255)
      doc.text(`${role2.name} (${role2.code})`, pageWidth / 2 + 15, yPosition + 8)
      doc.text(`${role2.department_name} • Level ${role2.level}`, pageWidth / 2 + 15, yPosition + 16)

      yPosition += 35
      doc.setTextColor(0, 0, 0)

      // Role Details
      doc.setFontSize(10)
      doc.setFont(undefined, "normal")

      const role1Details = `${formatSalary(role1)} • ${role1.location_type || "Hybrid"}`
      const role2Details = `${formatSalary(role2)} • ${role2.location_type || "Hybrid"}`

      yPosition = addWrappedText(`${role1.name}: ${role1Details}`, margin, yPosition, pageWidth - 2 * margin)
      yPosition = addWrappedText(`${role2.name}: ${role2Details}`, margin, yPosition + 5, pageWidth - 2 * margin)
      yPosition += 20

      // Skills by Category with color coding
      for (const categoryName of allCategories) {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage()
          yPosition = margin
        }

        const role1Category = role1SkillsByCategory[categoryName]
        const role2Category = role2SkillsByCategory[categoryName]
        const categoryColor = role1Category?.color || role2Category?.color || "gray"

        // Category Header with colored background
        const colorMap: Record<string, number[]> = {
          blue: [59, 130, 246],
          green: [34, 197, 94],
          purple: [147, 51, 234],
          indigo: [99, 102, 241],
          orange: [249, 115, 22],
        }
        const bgColor = colorMap[categoryColor] || [107, 114, 128]

        doc.setFillColor(bgColor[0], bgColor[1], bgColor[2])
        doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 15, "F")

        doc.setTextColor(255, 255, 255)
        doc.setFontSize(14)
        doc.setFont(undefined, "bold")
        doc.text(categoryName, margin + 5, yPosition + 5)
        yPosition += 15

        doc.setTextColor(0, 0, 0)

        // Create two columns for skills
        const columnWidth = (pageWidth - 3 * margin) / 2
        const leftColumnX = margin
        const rightColumnX = margin + columnWidth + margin

        let leftColumnY = yPosition
        let rightColumnY = yPosition

        // Role 1 Skills (Left Column)
        doc.setFontSize(12)
        doc.setFont(undefined, "bold")
        doc.text(role1.name, leftColumnX, leftColumnY)
        leftColumnY += 8

        if (role1Category?.skills.length) {
          doc.setFontSize(9)
          doc.setFont(undefined, "normal")
          for (const skill of role1Category.skills) {
            if (leftColumnY > 270) {
              doc.addPage()
              leftColumnY = margin
            }

            doc.setFont(undefined, "bold")
            doc.text(`• ${skill.skill_name} (${skill.level})`, leftColumnX, leftColumnY)
            leftColumnY += 5

            doc.setFont(undefined, "normal")
            leftColumnY = addWrappedText(
              skill.demonstration_description,
              leftColumnX + 5,
              leftColumnY,
              columnWidth - 5,
              8,
            )
            leftColumnY += 3
          }
        } else {
          doc.setFontSize(9)
          doc.setFont(undefined, "italic")
          doc.setTextColor(128, 128, 128)
          doc.text("No skills in this category", leftColumnX, leftColumnY)
          doc.setTextColor(0, 0, 0)
          leftColumnY += 8
        }

        // Role 2 Skills (Right Column)
        doc.setFontSize(12)
        doc.setFont(undefined, "bold")
        doc.text(role2.name, rightColumnX, rightColumnY)
        rightColumnY += 8

        if (role2Category?.skills.length) {
          doc.setFontSize(9)
          doc.setFont(undefined, "normal")
          for (const skill of role2Category.skills) {
            if (rightColumnY > 270) {
              doc.addPage()
              rightColumnY = margin
            }

            doc.setFont(undefined, "bold")
            doc.text(`• ${skill.skill_name} (${skill.level})`, rightColumnX, rightColumnY)
            rightColumnY += 5

            doc.setFont(undefined, "normal")
            rightColumnY = addWrappedText(
              skill.demonstration_description,
              rightColumnX + 5,
              rightColumnY,
              columnWidth - 5,
              8,
            )
            rightColumnY += 3
          }
        } else {
          doc.setFontSize(9)
          doc.setFont(undefined, "italic")
          doc.setTextColor(128, 128, 128)
          doc.text("No skills in this category", rightColumnX, rightColumnY)
          doc.setTextColor(0, 0, 0)
          rightColumnY += 8
        }

        yPosition = Math.max(leftColumnY, rightColumnY) + 10
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(128, 128, 128)
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, doc.internal.pageSize.height - 10)
        doc.text("Henry Schein One Career Matrix", margin, doc.internal.pageSize.height - 10)
      }

      // Save the PDF
      const fileName = `role-comparison-${role1.code}-vs-${role2.code}-${new Date().toISOString().split("T")[0]}.pdf`
      doc.save(fileName)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare Roles</h1>
        <p className="text-gray-600">
          Select two roles to compare their skill requirements and demonstration descriptions.
        </p>
      </div>

      {/* Role Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Role</label>
          <Select
            value={selectedRole1?.toString() || ""}
            onValueChange={(value) => setSelectedRole1(Number.parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select first role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id.toString()} disabled={role.id === selectedRole2}>
                  {role.department_name} - {role.name} ({role.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={swapRoles}
            disabled={!selectedRole1 || !selectedRole2}
            className="mb-2 bg-transparent"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToPDF}
            disabled={!selectedRole1 || !selectedRole2 || isLoading}
            className="mb-2 bg-transparent"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Second Role</label>
          <Select
            value={selectedRole2?.toString() || ""}
            onValueChange={(value) => setSelectedRole2(Number.parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select second role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id.toString()} disabled={role.id === selectedRole1}>
                  {role.department_name} - {role.name} ({role.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Comparison Results */}
      {selectedRole1 && selectedRole2 && (
        <>
          {/* Export Button */}
          <div className="flex justify-end mb-6">
            <Button
              onClick={exportToPDF}
              disabled={isLoading}
              className="bg-brand-600 hover:bg-brand-700 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Export to PDF
            </Button>
          </div>

          {/* Role Headers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[role1, role2].map((role, index) => (
              <Card key={role?.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="outline">{role?.code}</Badge>
                    <span>{role?.name}</span>
                  </CardTitle>
                  <div className="text-sm text-gray-600">
                    <div>
                      {role?.department_name} • Level {role?.level}
                    </div>
                    <div>
                      {formatSalary(role!)} • {role?.location_type || "Hybrid"}
                    </div>
                    <div>{index === 0 ? role1Skills.length : role2Skills.length} skills</div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Skills Comparison */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading skills comparison...</div>
            </div>
          ) : (
            <div className="space-y-8">
              {allCategories.map((categoryName) => {
                const role1Category = role1SkillsByCategory[categoryName]
                const role2Category = role2SkillsByCategory[categoryName]
                const categoryColor = role1Category?.color || role2Category?.color || "gray"

                return (
                  <div key={categoryName}>
                    <h3
                      className={`text-xl font-semibold mb-4 border-b pb-2 text-${categoryColor}-700 border-${categoryColor}-200`}
                    >
                      {categoryName}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Role 1 Skills */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">{role1?.name}</h4>
                        <div className="space-y-3">
                          {role1Category?.skills.map((skill) => (
                            <div
                              key={skill.id}
                              className={`p-4 rounded-lg border ${getColorClasses(categoryColor)} cursor-pointer hover:shadow-sm transition-shadow`}
                              onClick={() => handleSkillClick(skill, role1!, true)}
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-medium">{skill.skill_name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {skill.level}
                                </Badge>
                                {getSkillLevelDots(skill.level, categoryColor)}
                                <Eye className="w-4 h-4 text-gray-400 ml-auto" />
                              </div>
                              <p className="text-sm text-gray-700">{skill.demonstration_description}</p>
                            </div>
                          )) || (
                            <div className="text-gray-400 text-sm italic p-4 border border-dashed rounded-lg">
                              No skills in this category
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Role 2 Skills */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">{role2?.name}</h4>
                        <div className="space-y-3">
                          {role2Category?.skills.map((skill) => (
                            <div
                              key={skill.id}
                              className={`p-4 rounded-lg border ${getColorClasses(categoryColor)} cursor-pointer hover:shadow-sm transition-shadow`}
                              onClick={() => handleSkillClick(skill, role2!, false)}
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-medium">{skill.skill_name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {skill.level}
                                </Badge>
                                {getSkillLevelDots(skill.level, categoryColor)}
                                <Eye className="w-4 h-4 text-gray-400 ml-auto" />
                              </div>
                              <p className="text-sm text-gray-700">{skill.demonstration_description}</p>
                            </div>
                          )) || (
                            <div className="text-gray-400 text-sm italic p-4 border border-dashed rounded-lg">
                              No skills in this category
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Skill Detail Modal */}
      <Dialog open={isSkillDetailOpen} onOpenChange={setIsSkillDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{selectedSkill?.skill.skill_name || "Skill Comparison"}</span>
            </DialogTitle>
          </DialogHeader>

          {selectedSkill && (
            <div className="space-y-6">
              {/* Skill Overview */}
              <div>
                <h4 className="text-lg font-semibold mb-2">Skill Description</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {selectedSkill.skill.skill_description}
                  </p>
                </div>
              </div>

              {/* Role Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Selected Role */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    {selectedSkill.role.name}
                    <Badge variant="outline" className="text-xs">
                      {selectedSkill.skill.level}
                    </Badge>
                  </h4>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h5 className="text-sm font-medium text-blue-900 mb-2">Demonstration Description</h5>
                    <p className="text-blue-800 text-sm leading-relaxed">
                      {selectedSkill.skill.demonstration_description}
                    </p>
                  </div>
                </div>

                {/* Other Role */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    {selectedSkill.otherRole?.name || "Not Available"}
                    {selectedSkill.otherRoleSkill && (
                      <Badge variant="outline" className="text-xs">
                        {selectedSkill.otherRoleSkill.level}
                      </Badge>
                    )}
                  </h4>
                  <div
                    className={`rounded-lg p-4 border ${
                      selectedSkill.otherRoleSkill ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <h5
                      className={`text-sm font-medium mb-2 ${
                        selectedSkill.otherRoleSkill ? "text-green-900" : "text-gray-600"
                      }`}
                    >
                      Demonstration Description
                    </h5>
                    <p
                      className={`text-sm leading-relaxed ${
                        selectedSkill.otherRoleSkill ? "text-green-800" : "text-gray-500"
                      }`}
                    >
                      {selectedSkill.otherRoleSkill?.demonstration_description ||
                        "This skill is not required for this role"}
                    </p>
                  </div>
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
