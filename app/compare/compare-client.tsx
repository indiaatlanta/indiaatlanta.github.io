"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GitCompare, Download, Loader2 } from "lucide-react"
import jsPDF from "jspdf"

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

interface ComparisonData {
  role1: Role
  role2: Role
  role1Skills: Skill[]
  role2Skills: Skill[]
  commonSkills: Array<{
    skill_name: string
    category_name: string
    category_color: string
    role1_level: string
    role2_level: string
    role1_description: string
    role2_description: string
  }>
  uniqueToRole1: Skill[]
  uniqueToRole2: Skill[]
}

export function CompareClient() {
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole1, setSelectedRole1] = useState<string>("")
  const [selectedRole2, setSelectedRole2] = useState<string>("")
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/roles")
      if (response.ok) {
        const data = await response.json()
        setRoles(data)
      }
    } catch (error) {
      console.error("Error fetching roles:", error)
    }
  }

  const handleCompare = async () => {
    if (!selectedRole1 || !selectedRole2) {
      setError("Please select both roles to compare")
      return
    }

    if (selectedRole1 === selectedRole2) {
      setError("Please select different roles to compare")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/compare?role1=${selectedRole1}&role2=${selectedRole2}`)
      if (response.ok) {
        const data = await response.json()
        setComparisonData(data)
      } else {
        setError("Failed to fetch comparison data")
      }
    } catch (error) {
      setError("An error occurred while comparing roles")
      console.error("Error comparing roles:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generatePDF = () => {
    if (!comparisonData) return

    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 20

    // Add logo with correct aspect ratio (1384x216 = 6.4:1)
    const logoHeight = 10
    const logoWidth = 64 // 6.4:1 ratio
    pdf.addImage("/images/hs1-logo.png", "PNG", margin, margin, logoWidth, logoHeight)

    // Title
    pdf.setFontSize(20)
    pdf.text("Role Comparison Report", margin, margin + 25)

    // Role names
    pdf.setFontSize(14)
    pdf.text(`${comparisonData.role1.name} vs ${comparisonData.role2.name}`, margin, margin + 35)

    let yPosition = margin + 50

    // Common Skills
    pdf.setFontSize(16)
    pdf.text("Common Skills", margin, yPosition)
    yPosition += 10

    pdf.setFontSize(10)
    comparisonData.commonSkills.forEach((skill) => {
      if (yPosition > 250) {
        pdf.addPage()
        yPosition = 20
      }
      pdf.text(`• ${skill.skill_name} (${skill.role1_level} vs ${skill.role2_level})`, margin + 5, yPosition)
      yPosition += 6
    })

    // Unique to Role 1
    yPosition += 10
    pdf.setFontSize(16)
    pdf.text(`Unique to ${comparisonData.role1.name}`, margin, yPosition)
    yPosition += 10

    pdf.setFontSize(10)
    comparisonData.uniqueToRole1.forEach((skill) => {
      if (yPosition > 250) {
        pdf.addPage()
        yPosition = 20
      }
      pdf.text(`• ${skill.skill_name} (${skill.level})`, margin + 5, yPosition)
      yPosition += 6
    })

    // Unique to Role 2
    yPosition += 10
    pdf.setFontSize(16)
    pdf.text(`Unique to ${comparisonData.role2.name}`, margin, yPosition)
    yPosition += 10

    pdf.setFontSize(10)
    comparisonData.uniqueToRole2.forEach((skill) => {
      if (yPosition > 250) {
        pdf.addPage()
        yPosition = 20
      }
      pdf.text(`• ${skill.skill_name} (${skill.level})`, margin + 5, yPosition)
      yPosition += 6
    })

    pdf.save(`role-comparison-${comparisonData.role1.code}-vs-${comparisonData.role2.code}.pdf`)
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <GitCompare className="w-6 h-6" />
          Compare Roles
        </h1>
        <p className="text-gray-600">Compare skills and requirements between different roles</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select Roles to Compare</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Role</label>
              <Select value={selectedRole1} onValueChange={setSelectedRole1}>
                <SelectTrigger>
                  <SelectValue placeholder="Select first role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name} ({role.code}) - {role.department_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Second Role</label>
              <Select value={selectedRole2} onValueChange={setSelectedRole2}>
                <SelectTrigger>
                  <SelectValue placeholder="Select second role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name} ({role.code}) - {role.department_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button onClick={handleCompare} disabled={isLoading || !selectedRole1 || !selectedRole2}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Comparing...
              </>
            ) : (
              <>
                <GitCompare className="w-4 h-4 mr-2" />
                Compare Roles
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {comparisonData && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {comparisonData.role1.name} vs {comparisonData.role2.name}
            </h2>
            <Button onClick={generatePDF} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="common">Common Skills</TabsTrigger>
              <TabsTrigger value="unique1">Unique to {comparisonData.role1.code}</TabsTrigger>
              <TabsTrigger value="unique2">Unique to {comparisonData.role2.code}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">Common Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-center text-green-600">
                      {comparisonData.commonSkills.length}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">Unique to {comparisonData.role1.code}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-center text-blue-600">
                      {comparisonData.uniqueToRole1.length}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">Unique to {comparisonData.role2.code}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-center text-purple-600">
                      {comparisonData.uniqueToRole2.length}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="common" className="space-y-4">
              {comparisonData.commonSkills.length > 0 ? (
                <div className="space-y-4">
                  {comparisonData.commonSkills.map((skill, index) => (
                    <Card key={index} className={getColorClasses(skill.category_color)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{skill.skill_name}</h3>
                          <Badge variant="secondary">{skill.category_name}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">{comparisonData.role1.code}</Badge>
                              <Badge variant="outline">{skill.role1_level}</Badge>
                            </div>
                            <p className="text-sm">{skill.role1_description}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">{comparisonData.role2.code}</Badge>
                              <Badge variant="outline">{skill.role2_level}</Badge>
                            </div>
                            <p className="text-sm">{skill.role2_description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No common skills found between these roles.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="unique1" className="space-y-4">
              {comparisonData.uniqueToRole1.length > 0 ? (
                <div className="space-y-4">
                  {comparisonData.uniqueToRole1.map((skill) => (
                    <Card key={skill.id} className={getColorClasses(skill.category_color)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{skill.skill_name}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{skill.level}</Badge>
                            <Badge variant="secondary">{skill.category_name}</Badge>
                          </div>
                        </div>
                        <p className="text-sm">{skill.demonstration_description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No unique skills found for {comparisonData.role1.name}.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="unique2" className="space-y-4">
              {comparisonData.uniqueToRole2.length > 0 ? (
                <div className="space-y-4">
                  {comparisonData.uniqueToRole2.map((skill) => (
                    <Card key={skill.id} className={getColorClasses(skill.category_color)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{skill.skill_name}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{skill.level}</Badge>
                            <Badge variant="secondary">{skill.category_name}</Badge>
                          </div>
                        </div>
                        <p className="text-sm">{skill.demonstration_description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No unique skills found for {comparisonData.role2.name}.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
