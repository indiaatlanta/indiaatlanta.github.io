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
  TrendingUp,
  Download,
  Eye,
  Trash2,
  AlertCircle,
  ArrowLeft,
  Plus,
} from "lucide-react"
import Link from "next/link"

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

interface AssessmentStats {
  totalAssessments: number
  averageCompletion: number
  lastAssessmentDate: string | null
}

export default function AssessmentsClient() {
  const [assessments, setAssessments] = useState<SavedAssessment[]>([])
  const [filteredAssessments, setFilteredAssessments] = useState<SavedAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAssessment, setSelectedAssessment] = useState<SavedAssessment | null>(null)
  const [stats, setStats] = useState<AssessmentStats>({
    totalAssessments: 0,
    averageCompletion: 0,
    lastAssessmentDate: null,
  })

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

      if (data.error) {
        setError(data.error)
        setAssessments([])
      } else {
        setAssessments(data.assessments || [])
        calculateStats(data.assessments || [])
      }
    } catch (error) {
      console.error("Failed to load assessments:", error)
      setError("Failed to load assessments. Please try again.")
      setAssessments([])
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (assessmentList: SavedAssessment[]) => {
    if (assessmentList.length === 0) {
      setStats({
        totalAssessments: 0,
        averageCompletion: 0,
        lastAssessmentDate: null,
      })
      return
    }

    const totalCompletion = assessmentList.reduce((sum, assessment) => {
      const percentage = assessment.total_skills > 0 ? (assessment.completed_skills / assessment.total_skills) * 100 : 0
      return sum + percentage
    }, 0)

    const averageCompletion = Math.round(totalCompletion / assessmentList.length)
    const lastAssessmentDate = assessmentList[0]?.created_at || null

    setStats({
      totalAssessments: assessmentList.length,
      averageCompletion,
      lastAssessmentDate,
    })
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
        setSelectedAssessment(null)
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
      completionPercentage: getCompletionPercentage(assessment.completed_skills, assessment.total_skills),
      createdAt: assessment.created_at,
      assessmentData: assessment.assessment_data ? JSON.parse(assessment.assessment_data) : {},
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

  const getCompletionPercentage = (completed: number, total: number) => {
    if (total === 0) return 0
    return Math.round((completed / total) * 100)
  }

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= 60) return "bg-blue-500"
    if (percentage >= 40) return "bg-yellow-500"
    return "bg-red-500"
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

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
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
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Saved Assessments</h1>
            <p className="text-gray-600 mt-1">Manage and review your skill assessments</p>
          </div>
        </div>
        <Link href="/self-review">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Assessment
          </Button>
        </Link>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={loadAssessments}>
              Retry
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
            <div className="text-2xl font-bold">{stats.totalAssessments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalAssessments === 1 ? "assessment" : "assessments"} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageCompletion}%</div>
            <p className="text-xs text-muted-foreground">across all assessments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Assessment</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.lastAssessmentDate ? formatDateShort(stats.lastAssessmentDate) : "None"}
            </div>
            <p className="text-xs text-muted-foreground">most recent completion</p>
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
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No matching assessments" : "No assessments yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? "Try adjusting your search terms" : "Start by creating your first skill assessment"}
            </p>
            {!searchTerm && (
              <Link href="/self-review">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Assessment
                </Button>
              </Link>
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
                    <Badge variant="outline" className="ml-2">
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
                          className={`h-2 rounded-full ${getCompletionColor(completionPercentage)}`}
                          style={{ width: `${completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDateShort(assessment.created_at)}
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
                            <Eye className="w-4 h-4 mr-2" />
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
                                  <h4 className="font-medium mb-2">Completion</h4>
                                  <div className="text-2xl font-bold">
                                    {getCompletionPercentage(
                                      selectedAssessment.completed_skills,
                                      selectedAssessment.total_skills,
                                    )}
                                    %
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {selectedAssessment.completed_skills} of {selectedAssessment.total_skills} skills
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Created</h4>
                                  <div className="text-lg font-medium">{formatDate(selectedAssessment.created_at)}</div>
                                </div>
                              </div>

                              {selectedAssessment.assessment_data && (
                                <div>
                                  <h4 className="font-medium mb-2">Assessment Data</h4>
                                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40">
                                    {JSON.stringify(JSON.parse(selectedAssessment.assessment_data), null, 2)}
                                  </pre>
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
    </div>
  )
}
