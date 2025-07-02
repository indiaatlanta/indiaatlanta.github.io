"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, Search, FileText, Download, Trash2, Calendar, Target, BarChart3, Eye } from "lucide-react"
import Link from "next/link"

interface Assessment {
  id: number
  name: string
  job_role_name: string
  department_name: string
  completed_skills: number
  total_skills: number
  created_at: string
  assessment_data?: string
}

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface AssessmentsClientProps {
  user: User
}

export default function AssessmentsClient({ user }: AssessmentsClientProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    loadAssessments()
  }, [])

  useEffect(() => {
    const filtered = assessments.filter(
      (assessment) =>
        assessment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.job_role_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.department_name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredAssessments(filtered)
  }, [assessments, searchTerm])

  const loadAssessments = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/assessments")
      if (response.ok) {
        const data = await response.json()
        setAssessments(data.assessments || [])
        setIsDemoMode(data.isDemoMode || false)
      } else {
        console.error("Failed to load assessments")
      }
    } catch (error) {
      console.error("Error loading assessments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAssessment = async (assessmentId: number, assessmentName: string) => {
    if (!confirm(`Are you sure you want to delete "${assessmentName}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/assessments/${assessmentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setAssessments((prev) => prev.filter((a) => a.id !== assessmentId))
      } else {
        alert("Failed to delete assessment")
      }
    } catch (error) {
      console.error("Failed to delete assessment:", error)
      alert("Failed to delete assessment")
    }
  }

  const handleExportAssessment = (assessment: Assessment) => {
    const exportData = {
      name: assessment.name,
      jobRole: assessment.job_role_name,
      department: assessment.department_name,
      completedSkills: assessment.completed_skills,
      totalSkills: assessment.total_skills,
      completionPercentage: Math.round((assessment.completed_skills / assessment.total_skills) * 100),
      createdAt: assessment.created_at,
      assessmentData: assessment.assessment_data ? JSON.parse(assessment.assessment_data) : null,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${assessment.name.replace(/\s+/g, "_")}_assessment.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getCompletionPercentage = (completed: number, total: number) => {
    if (total === 0) return 0
    return Math.round((completed / total) * 100)
  }

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getRatingsSummary = (assessmentData: string) => {
    try {
      const data = JSON.parse(assessmentData)
      if (data.ratings && Array.isArray(data.ratings)) {
        const summary = {
          "needs-development": 0,
          developing: 0,
          proficient: 0,
          strength: 0,
          "not-applicable": 0,
        }

        data.ratings.forEach((rating: any) => {
          if (summary.hasOwnProperty(rating.rating)) {
            summary[rating.rating as keyof typeof summary]++
          }
        })

        return summary
      }
    } catch (error) {
      console.error("Error parsing assessment data:", error)
    }
    return null
  }

  const totalAssessments = assessments.length
  const averageCompletion =
    assessments.length > 0
      ? Math.round(
          assessments.reduce((sum, a) => sum + getCompletionPercentage(a.completed_skills, a.total_skills), 0) /
            assessments.length,
        )
      : 0
  const lastAssessmentDate = assessments.length > 0 ? formatDate(assessments[0].created_at) : "No assessments yet"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Saved Assessments</h1>
              <p className="text-gray-600">
                Manage and review your assessment history
                {isDemoMode && (
                  <Badge variant="outline" className="ml-2">
                    Demo Mode
                  </Badge>
                )}
              </p>
            </div>
          </div>
          <Link href="/self-review">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Target className="w-4 h-4 mr-2" />
              New Assessment
            </Button>
          </Link>
        </header>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAssessments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Completion</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageCompletion}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Assessment</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">{lastAssessmentDate}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search assessments by name, role, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Assessments List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading assessments...</p>
          </div>
        ) : filteredAssessments.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? "No matching assessments found" : "No assessments yet"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? "Try adjusting your search terms or clear the search to see all assessments."
                  : "Start by taking your first skills assessment to track your professional development."}
              </p>
              {!searchTerm && (
                <Link href="/self-review">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Target className="w-4 h-4 mr-2" />
                    Take Your First Assessment
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredAssessments.map((assessment) => {
              const completionPercentage = getCompletionPercentage(assessment.completed_skills, assessment.total_skills)

              return (
                <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{assessment.name}</CardTitle>
                        <CardDescription className="space-y-1">
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="font-medium">{assessment.job_role_name}</span>
                            <span className="text-gray-400">•</span>
                            <span>{assessment.department_name}</span>
                            <span className="text-gray-400">•</span>
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(assessment.created_at)}
                            </span>
                          </div>
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedAssessment(assessment)}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{selectedAssessment?.name}</DialogTitle>
                              <DialogDescription>Assessment details and progress summary</DialogDescription>
                            </DialogHeader>
                            {selectedAssessment && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-700">Job Role</h4>
                                    <p className="text-sm">{selectedAssessment.job_role_name}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-700">Department</h4>
                                    <p className="text-sm">{selectedAssessment.department_name}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-700">Completed Skills</h4>
                                    <p className="text-sm">
                                      {selectedAssessment.completed_skills} of {selectedAssessment.total_skills}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-700">Completion</h4>
                                    <p className="text-sm">
                                      {getCompletionPercentage(
                                        selectedAssessment.completed_skills,
                                        selectedAssessment.total_skills,
                                      )}
                                      %
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Assessment Date</h4>
                                  <p className="text-sm">{formatDate(selectedAssessment.created_at)}</p>
                                </div>
                                {selectedAssessment.assessment_data &&
                                  (() => {
                                    const ratingsSummary = getRatingsSummary(selectedAssessment.assessment_data)
                                    return (
                                      ratingsSummary && (
                                        <div>
                                          <h4 className="font-semibold text-sm text-gray-700 mb-2">Rating Summary</h4>
                                          <div className="grid grid-cols-2 gap-2">
                                            {Object.entries(ratingsSummary).map(([rating, count]) => {
                                              if (count > 0) {
                                                const labels = {
                                                  "needs-development": "Needs Development",
                                                  developing: "Developing",
                                                  proficient: "Proficient",
                                                  strength: "Strength",
                                                  "not-applicable": "Not Applicable",
                                                }
                                                return (
                                                  <div
                                                    key={rating}
                                                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                                                  >
                                                    <span className="text-sm text-gray-700">
                                                      {labels[rating as keyof typeof labels]}
                                                    </span>
                                                    <Badge variant="outline">{count}</Badge>
                                                  </div>
                                                )
                                              }
                                              return null
                                            })}
                                          </div>
                                        </div>
                                      )
                                    )
                                  })()}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm" onClick={() => handleExportAssessment(assessment)}>
                          <Download className="w-4 h-4 mr-1" />
                          Export
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAssessment(assessment.id, assessment.name)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Progress</span>
                        <Badge variant="outline">
                          {assessment.completed_skills}/{assessment.total_skills} skills
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getCompletionColor(completionPercentage)}`}
                          style={{ width: `${completionPercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{completionPercentage}% complete</span>
                        <span>{assessment.total_skills - assessment.completed_skills} skills remaining</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
