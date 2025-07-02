"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Search,
  FileText,
  Calendar,
  Target,
  Download,
  Trash2,
  Eye,
  AlertCircle,
  RefreshCw,
  BarChart3,
  Clock,
} from "lucide-react"

interface SavedAssessment {
  id: number
  name: string
  job_role_name: string
  department_name: string
  completed_skills: number
  total_skills: number
  created_at: string
  assessment_data?: string
}

interface AssessmentData {
  ratings?: Array<{
    skillId: number
    rating: string
    skillName: string
    notes?: string
  }>
}

export default function AssessmentsClient() {
  const [assessments, setAssessments] = useState<SavedAssessment[]>([])
  const [filteredAssessments, setFilteredAssessments] = useState<SavedAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAssessment, setSelectedAssessment] = useState<SavedAssessment | null>(null)

  useEffect(() => {
    loadAssessments()
  }, [])

  useEffect(() => {
    filterAssessments()
  }, [assessments, searchTerm])

  const loadAssessments = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/assessments")

      if (!response.ok) {
        throw new Error("Failed to load assessments")
      }

      const data = await response.json()
      setAssessments(data.assessments || [])
    } catch (error) {
      console.error("Failed to load assessments:", error)
      setError("Failed to load assessments. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const filterAssessments = () => {
    if (!searchTerm) {
      setFilteredAssessments(assessments)
      return
    }

    const filtered = assessments.filter(
      (assessment) =>
        assessment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.job_role_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.department_name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredAssessments(filtered)
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

  const handleExportAssessment = (assessment: SavedAssessment) => {
    const exportData = {
      name: assessment.name,
      jobRole: assessment.job_role_name,
      department: assessment.department_name,
      completedSkills: assessment.completed_skills,
      totalSkills: assessment.total_skills,
      createdAt: assessment.created_at,
      assessmentData: assessment.assessment_data ? JSON.parse(assessment.assessment_data) : null,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${assessment.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_assessment.json`
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
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getCompletionPercentage = (completed: number, total: number) => {
    if (total === 0) return 0
    return Math.round((completed / total) * 100)
  }

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 bg-green-50"
    if (percentage >= 60) return "text-blue-600 bg-blue-50"
    if (percentage >= 40) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const parseAssessmentData = (dataString?: string): AssessmentData => {
    if (!dataString) return {}
    try {
      return JSON.parse(dataString)
    } catch {
      return {}
    }
  }

  const getAverageCompletion = () => {
    if (assessments.length === 0) return 0
    const total = assessments.reduce(
      (sum, assessment) => sum + getCompletionPercentage(assessment.completed_skills, assessment.total_skills),
      0,
    )
    return Math.round(total / assessments.length)
  }

  const getLastAssessmentDate = () => {
    if (assessments.length === 0) return "Never"
    const latest = assessments.reduce((latest, assessment) =>
      new Date(assessment.created_at) > new Date(latest.created_at) ? assessment : latest,
    )
    return formatDate(latest.created_at)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your assessments...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Saved Assessments</h1>
          <p className="text-gray-600 mt-2">View and manage your skill assessments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAssessments} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button asChild>
            <a href="/self-review">
              <Target className="w-4 h-4 mr-2" />
              New Assessment
            </a>
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="outline" size="sm" onClick={loadAssessments}>
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assessments.length}</div>
            <p className="text-xs text-muted-foreground">
              {assessments.length === 1 ? "assessment" : "assessments"} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Completion</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAverageCompletion()}%</div>
            <p className="text-xs text-muted-foreground">across all assessments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Assessment</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assessments.length > 0
                ? new Date(getLastAssessmentDate()).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "Never"}
            </div>
            <p className="text-xs text-muted-foreground">
              {assessments.length > 0 ? "most recent" : "no assessments yet"}
            </p>
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

      {/* Assessments Grid */}
      {filteredAssessments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No matching assessments" : "No assessments yet"}
            </h3>
            <p className="text-gray-600 text-center mb-4">
              {searchTerm
                ? "Try adjusting your search terms or clear the search to see all assessments."
                : "Start by creating your first skill assessment to track your progress."}
            </p>
            {!searchTerm && (
              <Button asChild>
                <a href="/self-review">
                  <Target className="w-4 h-4 mr-2" />
                  Create Assessment
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssessments.map((assessment) => {
            const completionPercentage = getCompletionPercentage(assessment.completed_skills, assessment.total_skills)
            return (
              <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{assessment.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {assessment.job_role_name} • {assessment.department_name}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className={`${getCompletionColor(completionPercentage)} border-0`}>
                      {completionPercentage}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>
                          {assessment.completed_skills}/{assessment.total_skills} skills
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            completionPercentage >= 80
                              ? "bg-green-500"
                              : completionPercentage >= 60
                                ? "bg-blue-500"
                                : completionPercentage >= 40
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                          }`}
                          style={{ width: `${completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(assessment.created_at)}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-transparent"
                            onClick={() => setSelectedAssessment(assessment)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{selectedAssessment?.name}</DialogTitle>
                            <DialogDescription>
                              {selectedAssessment?.job_role_name} • {selectedAssessment?.department_name}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedAssessment && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Assessment Details</h4>
                                  <div className="space-y-1 text-sm">
                                    <p>
                                      <strong>Completed:</strong> {formatDate(selectedAssessment.created_at)}
                                    </p>
                                    <p>
                                      <strong>Skills Assessed:</strong> {selectedAssessment.completed_skills}/
                                      {selectedAssessment.total_skills}
                                    </p>
                                    <p>
                                      <strong>Completion:</strong>{" "}
                                      {getCompletionPercentage(
                                        selectedAssessment.completed_skills,
                                        selectedAssessment.total_skills,
                                      )}
                                      %
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Progress</h4>
                                  <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                                    <div
                                      className={`h-4 rounded-full ${
                                        getCompletionPercentage(
                                          selectedAssessment.completed_skills,
                                          selectedAssessment.total_skills,
                                        ) >= 80
                                          ? "bg-green-500"
                                          : getCompletionPercentage(
                                                selectedAssessment.completed_skills,
                                                selectedAssessment.total_skills,
                                              ) >= 60
                                            ? "bg-blue-500"
                                            : getCompletionPercentage(
                                                  selectedAssessment.completed_skills,
                                                  selectedAssessment.total_skills,
                                                ) >= 40
                                              ? "bg-yellow-500"
                                              : "bg-red-500"
                                      }`}
                                      style={{
                                        width: `${getCompletionPercentage(selectedAssessment.completed_skills, selectedAssessment.total_skills)}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>

                              {selectedAssessment.assessment_data && (
                                <div>
                                  <h4 className="font-medium mb-2">Rating Summary</h4>
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                                      {JSON.stringify(parseAssessmentData(selectedAssessment.assessment_data), null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button variant="outline" size="sm" onClick={() => handleExportAssessment(assessment)}>
                        <Download className="w-4 h-4" />
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
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Back to Dashboard */}
      <div className="mt-8 text-center">
        <Button variant="outline" asChild>
          <a href="/">← Back to Dashboard</a>
        </Button>
      </div>
    </div>
  )
}
