"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { generateAssessmentPDF } from "@/lib/pdf-generator"
import { useUser } from "@/lib/auth-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Download, ChevronLeft, ChevronRight, Target, TrendingUp, Users, BookOpen } from "lucide-react"

interface Skill {
  id: number
  name: string
  category: string
  level: string
  description?: string
}

interface JobRole {
  id: number
  name: string
  code: string
  level: string
  department: string
  skills: Skill[]
}

interface SkillRating {
  skillId: number
  rating: string
  ratingValue: number
}

interface AssessmentProgress {
  totalSkills: number
  ratedSkills: number
  completionPercentage: number
  ratingCounts: {
    needsDevelopment: number
    developing: number
    proficient: number
    strength: number
    notApplicable: number
  }
}

const RATING_OPTIONS = [
  { value: "needs-development", label: "Needs Development", score: 1, color: "text-red-600" },
  { value: "developing", label: "Developing", score: 2, color: "text-orange-600" },
  { value: "proficient", label: "Proficient / Fully Displayed", score: 3, color: "text-green-600" },
  { value: "strength", label: "Strength / Role Model", score: 4, color: "text-blue-600" },
  { value: "not-applicable", label: "Not Applicable", score: 0, color: "text-gray-600" },
]

export default function SelfReviewClient() {
  const { user } = useUser()
  const { toast } = useToast()
  const [jobRoles, setJobRoles] = useState<JobRole[]>([])
  const [selectedRole, setSelectedRole] = useState<JobRole | null>(null)
  const [ratings, setRatings] = useState<Record<number, SkillRating>>({})
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    loadJobRoles()
  }, [])

  const loadJobRoles = async () => {
    try {
      const response = await fetch("/api/job-roles")
      if (response.ok) {
        const data = await response.json()
        setJobRoles(data)
      } else {
        // Demo data fallback
        const demoRoles: JobRole[] = [
          {
            id: 1,
            name: "Software Engineer",
            code: "SE-001",
            level: "Mid-Level",
            department: "Engineering",
            skills: [
              { id: 1, name: "JavaScript", category: "Technical Skills", level: "Intermediate" },
              { id: 2, name: "React", category: "Technical Skills", level: "Intermediate" },
              { id: 3, name: "Node.js", category: "Technical Skills", level: "Intermediate" },
              { id: 4, name: "Problem Solving", category: "Core Skills", level: "Advanced" },
              { id: 5, name: "Communication", category: "Soft Skills", level: "Intermediate" },
              { id: 6, name: "Team Collaboration", category: "Soft Skills", level: "Intermediate" },
              { id: 7, name: "Code Review", category: "Technical Skills", level: "Intermediate" },
              { id: 8, name: "Testing", category: "Technical Skills", level: "Basic" },
              { id: 9, name: "Documentation", category: "Core Skills", level: "Basic" },
              { id: 10, name: "Agile Methodology", category: "Process Skills", level: "Intermediate" },
              { id: 11, name: "Git Version Control", category: "Technical Skills", level: "Intermediate" },
              { id: 12, name: "Database Design", category: "Technical Skills", level: "Basic" },
              { id: 13, name: "API Development", category: "Technical Skills", level: "Intermediate" },
              { id: 14, name: "Performance Optimization", category: "Technical Skills", level: "Advanced" },
            ],
          },
          {
            id: 2,
            name: "Product Manager",
            code: "PM-001",
            level: "Senior",
            department: "Product",
            skills: [
              { id: 15, name: "Product Strategy", category: "Strategic Skills", level: "Advanced" },
              { id: 16, name: "Market Research", category: "Analytical Skills", level: "Intermediate" },
              { id: 17, name: "User Experience Design", category: "Design Skills", level: "Intermediate" },
              { id: 18, name: "Data Analysis", category: "Analytical Skills", level: "Advanced" },
              { id: 19, name: "Stakeholder Management", category: "Leadership Skills", level: "Advanced" },
              { id: 20, name: "Roadmap Planning", category: "Strategic Skills", level: "Advanced" },
            ],
          },
        ]
        setJobRoles(demoRoles)
      }
    } catch (error) {
      console.error("Failed to load job roles:", error)
      toast({
        title: "Error",
        description: "Failed to load job roles. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleSelect = (roleId: string) => {
    const role = jobRoles.find((r) => r.id.toString() === roleId)
    if (role) {
      setSelectedRole(role)
      setRatings({})
      setCurrentSkillIndex(0)
    }
  }

  const handleRatingChange = (skillId: number, rating: string) => {
    const ratingOption = RATING_OPTIONS.find((opt) => opt.value === rating)
    if (ratingOption) {
      setRatings((prev) => ({
        ...prev,
        [skillId]: {
          skillId,
          rating,
          ratingValue: ratingOption.score,
        },
      }))
    }
  }

  const calculateProgress = (): AssessmentProgress => {
    if (!selectedRole) {
      return {
        totalSkills: 0,
        ratedSkills: 0,
        completionPercentage: 0,
        ratingCounts: {
          needsDevelopment: 0,
          developing: 0,
          proficient: 0,
          strength: 0,
          notApplicable: 0,
        },
      }
    }

    const totalSkills = selectedRole.skills.length
    const ratedSkills = Object.keys(ratings).length
    const completionPercentage = totalSkills > 0 ? Math.round((ratedSkills / totalSkills) * 100) : 0

    const ratingCounts = {
      needsDevelopment: 0,
      developing: 0,
      proficient: 0,
      strength: 0,
      notApplicable: 0,
    }

    Object.values(ratings).forEach((rating) => {
      switch (rating.rating) {
        case "needs-development":
          ratingCounts.needsDevelopment++
          break
        case "developing":
          ratingCounts.developing++
          break
        case "proficient":
          ratingCounts.proficient++
          break
        case "strength":
          ratingCounts.strength++
          break
        case "not-applicable":
          ratingCounts.notApplicable++
          break
      }
    })

    return {
      totalSkills,
      ratedSkills,
      completionPercentage,
      ratingCounts,
    }
  }

  const calculateOverallScore = (): number => {
    const ratingValues = Object.values(ratings)
    if (ratingValues.length === 0) return 0

    const scoredRatings = ratingValues.filter((r) => r.ratingValue > 0)
    if (scoredRatings.length === 0) return 0

    const totalScore = scoredRatings.reduce((sum, rating) => sum + rating.ratingValue, 0)
    const maxPossibleScore = scoredRatings.length * 4
    return (totalScore / maxPossibleScore) * 100
  }

  const handleSaveAssessment = async () => {
    if (!selectedRole) {
      toast({
        title: "Error",
        description: "Please select a role first.",
        variant: "destructive",
      })
      return
    }

    const progress = calculateProgress()
    if (progress.ratedSkills === 0) {
      toast({
        title: "Error",
        description: "Please rate at least one skill before saving.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const skillsData = selectedRole.skills.map((skill) => {
        const rating = ratings[skill.id]
        return {
          skillId: skill.id,
          skillName: skill.name,
          category: skill.category,
          level: skill.level,
          rating: rating?.rating || "not-rated",
          ratingValue: rating?.ratingValue || 0,
        }
      })

      const assessmentData = {
        assessmentName: `${selectedRole.name} Self-Assessment - ${new Date().toLocaleDateString()}`,
        jobRoleName: selectedRole.name,
        departmentName: selectedRole.department,
        skillsData,
        overallScore: calculateOverallScore(),
        completionPercentage: progress.completionPercentage,
        totalSkills: progress.totalSkills,
        completedSkills: progress.ratedSkills,
        roleId: selectedRole.id,
      }

      console.log("Saving assessment data:", assessmentData)

      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assessmentData),
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Success",
          description: "Assessment saved successfully!",
        })
        console.log("Assessment saved:", result)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save assessment")
      }
    } catch (error) {
      console.error("Failed to save assessment:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save assessment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportPDF = () => {
    if (!selectedRole) {
      toast({
        title: "Error",
        description: "Please select a role first.",
        variant: "destructive",
      })
      return
    }

    const progress = calculateProgress()
    if (progress.ratedSkills === 0) {
      toast({
        title: "Error",
        description: "Please rate at least one skill before exporting.",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)

    try {
      const skillsData = selectedRole.skills
        .map((skill) => {
          const rating = ratings[skill.id]
          const ratingOption = RATING_OPTIONS.find((opt) => opt.value === rating?.rating)
          return {
            skillId: skill.id,
            skillName: skill.name,
            category: skill.category,
            level: skill.level,
            rating: ratingOption?.label || "Not Rated",
            ratingValue: rating?.ratingValue || 0,
          }
        })
        .filter((skill) => skill.ratingValue > 0)

      const assessmentData = {
        assessmentName: `${selectedRole.name} Self-Assessment`,
        jobRoleName: selectedRole.name,
        departmentName: selectedRole.department,
        skillsData,
        overallScore: calculateOverallScore(),
        completionPercentage: progress.completionPercentage,
        totalSkills: progress.totalSkills,
        completedSkills: progress.ratedSkills,
        createdAt: new Date().toISOString(),
      }

      generateAssessmentPDF(assessmentData)

      toast({
        title: "Success",
        description: "PDF exported successfully!",
      })
    } catch (error) {
      console.error("Failed to export PDF:", error)
      toast({
        title: "Error",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const progress = calculateProgress()
  const currentSkill = selectedRole?.skills[currentSkillIndex]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job roles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Self Assessment</h1>
            </div>
            <div className="flex items-center space-x-4">
              {selectedRole && progress.ratedSkills > 0 && (
                <>
                  <Button onClick={handleSaveAssessment} disabled={isSaving} variant="outline">
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Assessment"}
                  </Button>
                  <Button onClick={handleExportPDF} disabled={isExporting} variant="default">
                    <Download className="h-4 w-4 mr-2" />
                    {isExporting ? "Exporting..." : "Export PDF"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedRole ? (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Select a Job Role
                </CardTitle>
                <CardDescription>Choose the role you want to assess yourself against</CardDescription>
              </CardHeader>
              <CardContent>
                <Select onValueChange={handleRoleSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a job role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {jobRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{role.name}</span>
                          <span className="text-sm text-gray-500">
                            {role.department} • {role.level} • {role.skills.length} skills
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Role Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {selectedRole.name}
                    </CardTitle>
                    <CardDescription>
                      {selectedRole.department} • {selectedRole.level} • {selectedRole.code}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedRole(null)}>
                    Change Role
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Assessment Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Completion</span>
                      <span>
                        {progress.ratedSkills} of {progress.totalSkills} skills rated
                      </span>
                    </div>
                    <Progress value={progress.completionPercentage} className="h-2" />
                  </div>

                  <div className="grid grid-cols-5 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-red-600">{progress.ratingCounts.needsDevelopment}</div>
                      <div className="text-xs text-gray-600">Needs Development</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{progress.ratingCounts.developing}</div>
                      <div className="text-xs text-gray-600">Developing</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{progress.ratingCounts.proficient}</div>
                      <div className="text-xs text-gray-600">Proficient / Fully Displayed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{progress.ratingCounts.strength}</div>
                      <div className="text-xs text-gray-600">Strength / Role Model</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-600">{progress.ratingCounts.notApplicable}</div>
                      <div className="text-xs text-gray-600">Not Applicable</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Skill */}
            {currentSkill && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      {currentSkill.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{currentSkill.category}</Badge>
                      <Badge variant="secondary">{currentSkill.level}</Badge>
                    </div>
                  </div>
                  <CardDescription>
                    Skill {currentSkillIndex + 1} of {selectedRole.skills.length}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {currentSkill.description && <p className="text-gray-600">{currentSkill.description}</p>}

                    <div>
                      <Label className="text-base font-medium mb-4 block">
                        How would you rate your current level in this skill?
                      </Label>
                      <RadioGroup
                        value={ratings[currentSkill.id]?.rating || ""}
                        onValueChange={(value) => handleRatingChange(currentSkill.id, value)}
                        className="space-y-3"
                      >
                        {RATING_OPTIONS.map((option) => (
                          <div key={option.value} className="flex items-center space-x-3">
                            <RadioGroupItem value={option.value} id={option.value} />
                            <Label htmlFor={option.value} className={`flex-1 cursor-pointer ${option.color}`}>
                              <span className="font-medium">{option.label}</span>
                              {option.value === "needs-development" && (
                                <span className="block text-sm text-gray-500 mt-1">
                                  Limited knowledge or experience in this area
                                </span>
                              )}
                              {option.value === "developing" && (
                                <span className="block text-sm text-gray-500 mt-1">
                                  Some knowledge and experience, but requires guidance
                                </span>
                              )}
                              {option.value === "proficient" && (
                                <span className="block text-sm text-gray-500 mt-1">
                                  Competent and can work independently
                                </span>
                              )}
                              {option.value === "strength" && (
                                <span className="block text-sm text-gray-500 mt-1">
                                  Expert level, can mentor and guide others
                                </span>
                              )}
                              {option.value === "not-applicable" && (
                                <span className="block text-sm text-gray-500 mt-1">
                                  Not relevant to my current role or responsibilities
                                </span>
                              )}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <Separator />

                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentSkillIndex(Math.max(0, currentSkillIndex - 1))}
                        disabled={currentSkillIndex === 0}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                      <Button
                        onClick={() =>
                          setCurrentSkillIndex(Math.min(selectedRole.skills.length - 1, currentSkillIndex + 1))
                        }
                        disabled={currentSkillIndex === selectedRole.skills.length - 1}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Skills Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Skills Overview</CardTitle>
                <CardDescription>Click on any skill to jump to it directly</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedRole.skills.map((skill, index) => {
                    const rating = ratings[skill.id]
                    const ratingOption = RATING_OPTIONS.find((opt) => opt.value === rating?.rating)

                    return (
                      <Button
                        key={skill.id}
                        variant={index === currentSkillIndex ? "default" : "outline"}
                        size="sm"
                        className="justify-start h-auto p-3"
                        onClick={() => setCurrentSkillIndex(index)}
                      >
                        <div className="flex flex-col items-start w-full">
                          <span className="font-medium text-left">{skill.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {skill.category}
                            </Badge>
                            {ratingOption && (
                              <Badge variant="secondary" className={`text-xs ${ratingOption.color}`}>
                                {ratingOption.label}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
