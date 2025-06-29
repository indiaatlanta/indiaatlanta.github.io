"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, ArrowLeft, Info } from "lucide-react"
import Link from "next/link"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface Skill {
  id: number
  name: string
  category: string
  description: string
}

interface Role {
  id: number
  title: string
  level: string
  department: string
  description: string
  skills: Array<{
    skill: Skill
    required_level: number
    importance: "critical" | "important" | "nice-to-have"
  }>
}

interface CompareClientProps {
  roles: Role[]
}

export default function CompareClient({ roles }: CompareClientProps) {
  const [selectedRole1, setSelectedRole1] = useState<Role | null>(null)
  const [selectedRole2, setSelectedRole2] = useState<Role | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const handleRoleSelect = (roleId: string, position: 1 | 2) => {
    const role = roles.find((r) => r.id.toString() === roleId) || null
    if (position === 1) {
      setSelectedRole1(role)
    } else {
      setSelectedRole2(role)
    }
  }

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "important":
        return "bg-yellow-100 text-yellow-800"
      case "nice-to-have":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getLevelText = (level: number) => {
    const levels = ["None", "Basic", "Intermediate", "Advanced", "Expert"]
    return levels[level] || "Unknown"
  }

  const exportToPDF = async () => {
    if (!selectedRole1 || !selectedRole2) return

    setIsExporting(true)
    try {
      const element = document.getElementById("comparison-content")
      if (!element) return

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")

      // Add logo
      try {
        const logoImg = new Image()
        logoImg.crossOrigin = "anonymous"
        logoImg.src = "/images/hs1-logo.png"
        await new Promise((resolve) => {
          logoImg.onload = resolve
        })

        const logoCanvas = document.createElement("canvas")
        const logoCtx = logoCanvas.getContext("2d")
        logoCanvas.width = 40
        logoCanvas.height = 40
        logoCtx?.drawImage(logoImg, 0, 0, 40, 40)
        const logoData = logoCanvas.toDataURL("image/png")

        pdf.addImage(logoData, "PNG", 15, 15, 15, 15)
      } catch (error) {
        console.warn("Could not add logo to PDF:", error)
      }

      // Add title
      pdf.setFontSize(20)
      pdf.text("Role Comparison Report", 35, 25)

      pdf.setFontSize(12)
      pdf.text(`${selectedRole1.title} vs ${selectedRole2.title}`, 15, 35)
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 15, 42)

      // Add comparison content
      const imgWidth = 180
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      pdf.addImage(imgData, "PNG", 15, 50, imgWidth, imgHeight)

      pdf.save(
        `role-comparison-${selectedRole1.title.replace(/\s+/g, "-")}-vs-${selectedRole2.title.replace(/\s+/g, "-")}.pdf`,
      )
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsExporting(false)
    }
  }

  // Get all unique skills from both roles
  const getAllSkills = () => {
    if (!selectedRole1 || !selectedRole2) return []

    const skillsMap = new Map()

    selectedRole1.skills.forEach((rs) => {
      skillsMap.set(rs.skill.id, {
        skill: rs.skill,
        role1Level: rs.required_level,
        role1Importance: rs.importance,
        role2Level: 0,
        role2Importance: null,
      })
    })

    selectedRole2.skills.forEach((rs) => {
      if (skillsMap.has(rs.skill.id)) {
        const existing = skillsMap.get(rs.skill.id)
        existing.role2Level = rs.required_level
        existing.role2Importance = rs.importance
      } else {
        skillsMap.set(rs.skill.id, {
          skill: rs.skill,
          role1Level: 0,
          role1Importance: null,
          role2Level: rs.required_level,
          role2Importance: rs.importance,
        })
      }
    })

    return Array.from(skillsMap.values()).sort((a, b) => {
      if (a.skill.category !== b.skill.category) {
        return a.skill.category.localeCompare(b.skill.category)
      }
      return a.skill.name.localeCompare(b.skill.name)
    })
  }

  const groupedSkills = getAllSkills().reduce(
    (acc, skillData) => {
      const category = skillData.skill.category
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(skillData)
      return acc
    },
    {} as Record<string, typeof getAllSkills>,
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Compare Roles</h1>
                <p className="text-gray-600">Compare skills and requirements between different roles</p>
              </div>
            </div>
            {selectedRole1 && selectedRole2 && (
              <Button onClick={exportToPDF} disabled={isExporting}>
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? "Generating PDF..." : "Export PDF"}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Mode Banner */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Demo Mode:</strong> This is a preview with sample data. In production, this would connect to your
            actual roles database.
          </AlertDescription>
        </Alert>

        {/* Role Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Select First Role</CardTitle>
              <CardDescription>Choose the first role to compare</CardDescription>
            </CardHeader>
            <CardContent>
              <Select onValueChange={(value) => handleRoleSelect(value, 1)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role..." />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.title} ({role.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRole1 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold">{selectedRole1.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedRole1.description}</p>
                  <Badge variant="secondary" className="mt-2">
                    {selectedRole1.level}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select Second Role</CardTitle>
              <CardDescription>Choose the second role to compare</CardDescription>
            </CardHeader>
            <CardContent>
              <Select onValueChange={(value) => handleRoleSelect(value, 2)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role..." />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.title} ({role.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRole2 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold">{selectedRole2.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedRole2.description}</p>
                  <Badge variant="secondary" className="mt-2">
                    {selectedRole2.level}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Comparison Results */}
        {selectedRole1 && selectedRole2 && (
          <div id="comparison-content">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Skills Comparison
                  <div className="flex gap-2 text-sm">
                    <Badge variant="outline">{selectedRole1.title}</Badge>
                    <span>vs</span>
                    <Badge variant="outline">{selectedRole2.title}</Badge>
                  </div>
                </CardTitle>
                <CardDescription>Side-by-side comparison of skills and requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {Object.entries(groupedSkills).map(([category, skills]) => (
                    <div key={category}>
                      <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">{category}</h3>
                      <div className="space-y-4">
                        {skills.map((skillData) => (
                          <div
                            key={skillData.skill.id}
                            className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <h4 className="font-medium text-gray-900">{skillData.skill.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{skillData.skill.description}</p>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-medium text-gray-700 mb-1">{selectedRole1.title}</div>
                              {skillData.role1Level > 0 ? (
                                <div className="space-y-1">
                                  <Badge variant="secondary">{getLevelText(skillData.role1Level)}</Badge>
                                  {skillData.role1Importance && (
                                    <Badge
                                      variant="secondary"
                                      className={getImportanceColor(skillData.role1Importance)}
                                    >
                                      {skillData.role1Importance}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <Badge variant="outline" className="text-gray-400">
                                  Not Required
                                </Badge>
                              )}
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-medium text-gray-700 mb-1">{selectedRole2.title}</div>
                              {skillData.role2Level > 0 ? (
                                <div className="space-y-1">
                                  <Badge variant="secondary">{getLevelText(skillData.role2Level)}</Badge>
                                  {skillData.role2Importance && (
                                    <Badge
                                      variant="secondary"
                                      className={getImportanceColor(skillData.role2Importance)}
                                    >
                                      {skillData.role2Importance}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <Badge variant="outline" className="text-gray-400">
                                  Not Required
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!selectedRole1 || !selectedRole2 ? (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select Two Roles to Compare</h3>
              <p className="text-gray-600">
                Choose two roles from the dropdowns above to see a detailed skills comparison.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </main>
    </div>
  )
}
