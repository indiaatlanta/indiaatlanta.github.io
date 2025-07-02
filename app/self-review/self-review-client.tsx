"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, ChevronRight, Save, Download, BarChart3, Target, AlertCircle } from "lucide-react"
import { generatePDF } from "@/lib/pdf-generator"

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
  department: {
    name: string
    slug: string
  }
}

interface SkillRating {
  skillId: number
  rating: string
  notes: string
}

interface SelfReviewClientProps {
  skills: Skill[]
  jobRole: JobRole
}

const ratingOptions = [
  { value: "needs-development", label: "Needs Development", color: "bg-red-100 text-red-800", score: 1 },
  { value: "developing", label: "Developing", color: "bg-yellow-100 text-yellow-800", score: 2 },
  { value: "proficient", label: "Proficient / Fully Displayed", color: "bg-green-100 text-green-800", score: 3 },
  { value: "strength", label: "Strength / Role Model", color: "bg-blue-100 text-blue-800", score: 4 },
  { value: "not-applicable", label: "Not Applicable", color: "bg-gray-100 text-gray-800", score: 0 },
]

export default function SelfReviewClient({ skills, jobRole }: SelfReviewClientProps) {
  const [ratings, setRatings] = useState<Record<number, SkillRating>>({})
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const currentSkill = skills[currentSkillIndex]
  const currentRating = ratings[currentSkill?.id]

  // Group skills by category
  const skillsByCategory = skills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = []
      }
      acc[skill.category].push(skill)
      return acc
    },
    {} as Record<string, Skill[]>,
  )

  // Calculate progress
  const totalSkills = skills.length
  const ratedSkills = Object.keys(ratings).length
  const completionPercentage = totalSkills > 0 ? (ratedSkills / totalSkills) * 100 : 0

  // Calculate rating distribution
  const ratingDistribution = ratingOptions.reduce(
    (acc, option) => {
      acc[option.value] = Object.values(ratings).filter((r) => r.rating === option.value).length
      return acc
    },
    {} as Record<string, number>,
  )

  // Calculate overall score
  const calculateOverallScore = () => {
    const validRatings = Object.values(ratings).filter((r) => r.rating !== "not-applicable")
    if (validRatings.length === 0) return 0

    const totalScore = validRatings.reduce((sum, rating) => {
      const option = ratingOptions.find((opt) => opt.value === rating.rating)
      return sum + (option?.score || 0)
    }, 0)

    return (totalScore / (validRatings.length * 4)) * 100 // Convert to percentage
  }

  const handleRatingChange = (skillId: number, rating: string) => {
    setRatings((prev) => ({
      ...prev,
      [skillId]: {
        ...prev[skillId],
        skillId,
        rating,
        notes: prev[skillId]?.notes || "",
      },
    }))
  }

  const handleNotesChange = (skillId: number, notes: string) => {
    setRatings((prev) => ({
      ...prev,
      [skillId]: {
        ...prev[skillId],
        skillId,
        rating: prev[skillId]?.rating || "",
        notes,
      },
    }))
  }

  const handleNext = () => {
    if (currentSkillIndex < skills.length - 1) {
      setCurrentSkillIndex(currentSkillIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentSkillIndex > 0) {
      setCurrentSkillIndex(currentSkillIndex - 1)
    }
  }

  const handleSaveAssessment = async () => {
    setIsSaving(true)
    try {
      const assessmentData = {
        assessmentName: `Self Assessment - ${jobRole.name} - ${new Date().toLocaleDateString()}`,
        jobRoleName: jobRole.name,
        departmentName: jobRole.department.name,
        skillsData: {
          ratings: Object.values(ratings).map((rating) => {
            const skill = skills.find((s) => s.id === rating.skillId)
            const ratingOption = ratingOptions.find((opt) => opt.value === rating.rating)
            return {
              skillId: rating.skillId,
              skillName: skill?.name || "",
              skillCategory: skill?.category || "",
              skillLevel: skill?.level || "",
              rating: rating.rating,
              ratingLabel: ratingOption?.label || "",
              ratingScore: ratingOption?.score || 0,
              notes: rating.notes,
            }
          }),
          summary: {
            totalSkills,
            ratedSkills,
            completionPercentage,
            overallScore: calculateOverallScore(),
            ratingDistribution,
            jobRole: {
              id: jobRole.id,
              name: jobRole.name,
              code: jobRole.code,
              level: jobRole.level,
              department: jobRole.department.name,
            },
            completedAt: new Date().toISOString(),
          },
        },
        overallScore: calculateOverallScore(),
        completionPercentage,
        totalSkills,
        completedSkills: ratedSkills,
      }

      console.log("Saving assessment data:", assessmentData)

      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assessmentData),
      })

      const result = await response.json()
      console.log("Save response:", result)

      if (!response.ok) {
        throw new Error(result.error || "Failed to save assessment")
      }

      toast({
        title: "Assessment Saved",
        description: `Your self-assessment has been saved successfully. Overall score: ${calculateOverallScore().toFixed(1)}%`,
      })
    } catch (error) {
      console.error("Failed to save assessment:", error)
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save assessment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportPDF = async () => {
    setIsGeneratingPDF(true)
    try {
      const assessmentData = {
        title: `Self Assessment - ${jobRole.name}`,
        subtitle: `${jobRole.department.name} Department`,
        date: new Date().toLocaleDateString(),
        jobRole: {
          name: jobRole.name,
          code: jobRole.code,
          level: jobRole.level,
          department: jobRole.department.name,
        },
        summary: {
          totalSkills,
          ratedSkills,
          completionPercentage,
          overallScore: calculateOverallScore(),
        },
        ratingDistribution,
        skillsByCategory: Object.entries(skillsByCategory).map(([category, categorySkills]) => ({
          category,
          skills: categorySkills.map((skill) => {
            const rating = ratings[skill.id]
            const ratingOption = ratingOptions.find((opt) => opt.value === rating?.rating)
            return {
              name: skill.name,
              level: skill.level,
              description: skill.description,
              rating: ratingOption?.label || "Not Rated",
              ratingColor: ratingOption?.color || "bg-gray-100 text-gray-800",
              notes: rating?.notes || "",
            }
          }),
        })),
      }

      await generatePDF(assessmentData, "self-assessment")

      toast({
        title: "PDF Generated",
        description: "Your self-assessment PDF has been downloaded successfully.",
      })
    } catch (error) {
      console.error("Failed to generate PDF:", error)
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  if (!currentSkill) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Skills Available</h3>
            <p className="text-muted-foreground">
              No skills are available for assessment in this role. Please contact your administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Self Assessment</h1>
        <p className="text-lg text-gray-600">
          {jobRole.name} • {jobRole.department.name}
        </p>
        <Badge variant="outline" className="mt-2">
          {jobRole.code} - {jobRole.level}
        </Badge>
      </div>

      {/* Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Assessment Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Completion</span>
              <span>
                {ratedSkills} of {totalSkills} skills rated
              </span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          <div className="grid grid-cols-5 gap-4 text-center">
            {ratingOptions.map((option) => (
              <div key={option.value} className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">{ratingDistribution[option.value] || 0}</div>
                <div className="text-xs text-gray-600 leading-tight">{option.label}</div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={handleSaveAssessment} disabled={ratedSkills === 0 || isSaving} variant="outline">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Assessment"}
            </Button>
            <Button
              onClick={handleExportPDF}
              disabled={ratedSkills === 0 || isGeneratingPDF}
              className="bg-black hover:bg-gray-800"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGeneratingPDF ? "Generating..." : "Export PDF"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Skill */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {currentSkill.category}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {currentSkillIndex + 1} of {totalSkills}
            </Badge>
          </div>
          <CardTitle className="text-xl">{currentSkill.name}</CardTitle>
          <CardDescription>
            Level: {currentSkill.level}
            {currentSkill.description && (
              <>
                <br />
                {currentSkill.description}
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rating Selection */}
          <div>
            <Label className="text-base font-medium">Rate your proficiency</Label>
            <RadioGroup
              value={currentRating?.rating || ""}
              onValueChange={(value) => handleRatingChange(currentSkill.id, value)}
              className="mt-3"
            >
              {ratingOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-3">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label
                    htmlFor={option.value}
                    className={`flex-1 p-3 rounded-lg border cursor-pointer transition-colors ${
                      currentRating?.rating === option.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.label}</span>
                      <Badge className={option.color}>{option.score > 0 ? `${option.score}/4` : "N/A"}</Badge>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-base font-medium">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any additional comments about your proficiency in this skill..."
              value={currentRating?.notes || ""}
              onChange={(e) => handleNotesChange(currentSkill.id, e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button onClick={handlePrevious} disabled={currentSkillIndex === 0} variant="outline">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button onClick={handleNext} disabled={currentSkillIndex === skills.length - 1}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Skills Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Skills Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
              <div key={category}>
                <h4 className="font-medium text-gray-900 mb-3">{category}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {categorySkills.map((skill) => {
                    const rating = ratings[skill.id]
                    const ratingOption = ratingOptions.find((opt) => opt.value === rating?.rating)
                    const isCurrentSkill = skill.id === currentSkill.id

                    return (
                      <div
                        key={skill.id}
                        className={`p-3 rounded-lg border transition-colors ${
                          isCurrentSkill
                            ? "border-blue-500 bg-blue-50"
                            : rating
                              ? "border-green-200 bg-green-50"
                              : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{skill.name}</div>
                            <div className="text-xs text-gray-600">{skill.level}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isCurrentSkill && (
                              <Badge variant="outline" className="text-xs">
                                Current
                              </Badge>
                            )}
                            {rating ? (
                              <Badge className={`text-xs ${ratingOption?.color}`}>{ratingOption?.label}</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                Not Rated
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
