"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Crown, Download, Grid3X3, AlertCircle, ChevronRight, Star, Target } from "lucide-react"

interface Role {
  id: number
  title: string
  code: string
  level: string
  description: string
  is_manager: boolean
  skill_count: number
}

interface Skill {
  id: number
  name: string
  category: string
  description: string
  level: number
}

interface DepartmentClientProps {
  departmentSlug: string
  departmentName: string
}

export default function DepartmentClient({ departmentSlug, departmentName }: DepartmentClientProps) {
  const [roles, setRoles] = useState<Role[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [showSkillsMatrix, setShowSkillsMatrix] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Fetch roles for this department
        const rolesResponse = await fetch(`/api/departments/${departmentSlug}/roles`)
        const rolesData = await rolesResponse.json()

        if (rolesResponse.ok) {
          setRoles(rolesData.roles || [])
          setIsDemoMode(rolesData.isDemoMode || false)
        } else {
          console.error("Failed to fetch roles:", rolesData.error)
          setRoles([])
          setIsDemoMode(true)
        }

        // Fetch skills for this department
        const skillsResponse = await fetch(`/api/role-skills?department=${departmentSlug}`)
        const skillsData = await skillsResponse.json()

        if (skillsResponse.ok) {
          setSkills(skillsData.skills || [])
        } else {
          console.error("Failed to fetch skills:", skillsData.error)
          setSkills([])
        }
      } catch (error) {
        console.error("Error fetching department data:", error)
        setRoles([])
        setSkills([])
        setIsDemoMode(true)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [departmentSlug])

  const icRoles = roles.filter((role) => !role.is_manager)
  const managerRoles = roles.filter((role) => role.is_manager)

  const skillCategories = [...new Set(skills.map((skill) => skill.category))].sort()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Demo Mode Alert */}
      {isDemoMode && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Demo Mode:</strong> Showing sample data for {departmentName} department.
          </AlertDescription>
        </Alert>
      )}

      {/* Department Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{departmentName} Skills Matrix</h1>
          <p className="text-lg text-gray-600">
            Explore career paths and skill requirements across {roles.length} roles
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setShowSkillsMatrix(!showSkillsMatrix)}
            className="flex items-center space-x-2"
          >
            <Grid3X3 className="w-4 h-4" />
            <span>{showSkillsMatrix ? "Hide" : "Show"} Skills Matrix</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Skills Matrix */}
      {showSkillsMatrix && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Grid3X3 className="w-5 h-5" />
              <span>Skills Matrix</span>
            </CardTitle>
            <CardDescription>Compare skill requirements across all roles in {departmentName}</CardDescription>
          </CardHeader>
          <CardContent>
            {skills.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left p-3 border-b font-medium">Skill</th>
                      <th className="text-left p-3 border-b font-medium">Category</th>
                      {roles.map((role) => (
                        <th key={role.id} className="text-center p-3 border-b font-medium min-w-[100px]">
                          <div className="text-xs">{role.code}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {skillCategories.map((category) =>
                      skills
                        .filter((skill) => skill.category === category)
                        .map((skill) => (
                          <tr key={skill.id} className="hover:bg-gray-50">
                            <td className="p-3 border-b">
                              <div className="font-medium">{skill.name}</div>
                              <div className="text-sm text-gray-500">{skill.description}</div>
                            </td>
                            <td className="p-3 border-b">
                              <Badge variant="outline" className="text-xs">
                                {skill.category}
                              </Badge>
                            </td>
                            {roles.map((role) => (
                              <td key={role.id} className="p-3 border-b text-center">
                                <div className="flex items-center justify-center">
                                  {Math.random() > 0.3 ? (
                                    <div className="flex items-center space-x-1">
                                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                      <span className="text-sm">{Math.floor(Math.random() * 3) + 1}</span>
                                    </div>
                                  ) : (
                                    <span className="text-gray-300">-</span>
                                  )}
                                </div>
                              </td>
                            ))}
                          </tr>
                        )),
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No skills data available for this department</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Roles Tabs */}
      <Tabs defaultValue="ic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ic" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Individual Contributors ({icRoles.length})</span>
          </TabsTrigger>
          <TabsTrigger value="manager" className="flex items-center space-x-2">
            <Crown className="w-4 h-4" />
            <span>Managers ({managerRoles.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ic" className="mt-6">
          {icRoles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {icRoles.map((role) => (
                <Card key={role.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {role.code}
                      </Badge>
                      <Badge variant={role.level === "Senior" ? "default" : "secondary"} className="text-xs">
                        {role.level}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{role.title}</CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Target className="w-4 h-4" />
                        <span>{role.skill_count} skills</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRole(role)}
                        className="flex items-center space-x-1"
                      >
                        <span>View Details</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Individual Contributor Roles</h3>
              <p className="text-gray-600">No IC roles found for this department.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="manager" className="mt-6">
          {managerRoles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {managerRoles.map((role) => (
                <Card key={role.id} className="hover:shadow-lg transition-shadow cursor-pointer border-orange-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                        {role.code}
                      </Badge>
                      <Badge className="text-xs bg-orange-100 text-orange-800">Manager</Badge>
                    </div>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Crown className="w-5 h-5 text-orange-600" />
                      <span>{role.title}</span>
                    </CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Target className="w-4 h-4" />
                        <span>{role.skill_count} skills</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRole(role)}
                        className="flex items-center space-x-1"
                      >
                        <span>View Details</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Management Roles</h3>
              <p className="text-gray-600">No management roles found for this department.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Role Details Modal/Panel */}
      {selectedRole && (
        <Card className="mt-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  {selectedRole.is_manager && <Crown className="w-5 h-5 text-orange-600" />}
                  <span>{selectedRole.title}</span>
                  <Badge variant="outline">{selectedRole.code}</Badge>
                </CardTitle>
                <CardDescription className="mt-2">{selectedRole.description}</CardDescription>
              </div>
              <Button variant="ghost" onClick={() => setSelectedRole(null)}>
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Level</h4>
                <Badge variant="secondary">{selectedRole.level}</Badge>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Skills Required</h4>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span>{selectedRole.skill_count} skills</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Role Type</h4>
                <Badge variant={selectedRole.is_manager ? "default" : "outline"}>
                  {selectedRole.is_manager ? "Manager" : "Individual Contributor"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
