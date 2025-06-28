"use client"

import { useState } from "react"
import { MoreHorizontal, ClipboardCheck, GitCompare, Grid3X3, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

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

interface Props {
  department: Department
  roles: Role[]
  isDemoMode: boolean
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
            <DialogTitle className="flex items-center gap-2">
              <Grid3X3 className="w-5 h-5" />
              {department.name} Skills Matrix
            </DialogTitle>
          </DialogHeader>

          {isLoadingMatrix ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading skills matrix...</div>
            </div>
          ) : matrixData.length > 0 ? (
            <div className="space-y-8">
              {sortedCategories.map(([categoryName, categoryData]) => (
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
