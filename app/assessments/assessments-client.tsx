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
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Search,
  FileText,
  Calendar,
  Target,
  Download,
  Trash2,
  Eye,
  ArrowLeft,
  BarChart3,
  Clock,
  AlertCircle,
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
  const [assessments, setAssessments] = useState<SavedAssessment[]>([])
  const [filteredAssessments, setFilteredAssessments] = useState<SavedAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAssessment, setSelectedAssessment] = useState<SavedAssessment | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAssessments()
  }, [])

  useEffect(() => {
    // Filter assessments based on search term
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
      setError(null)
      const response = await fetch("/api/assessments")
      if (response.ok) {
        const data = await response.json()
        setAssessments(data.assessments || [])
      } else {
        setError("Failed to load assessments")
      }
    } catch (error) {
      console.error("Failed to load assessments:", error)
      setError("Failed to load assessments")
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

  const handleExportAssessment = (assessment: SavedAssessment) => {
    const exportData = {
      name: assessment.name,
      jobRole: assessment.job_role_name,
      department: assessment.department_name,
      completedSkills: assessment.completed_skills,
      totalSkills: assessment.total_skills,
      completionPercentage: getCompletionPercentage(assessment.completed_skills, assessment.total_skills),
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

  const getCompletionBadgeVariant = (percentage: number) => {
    if (percentage >= 80) return "default"
    if (percentage >= 60) return "secondary"
    return "destructive"
  }

  // Calculate statistics
  const totalAssessments = assessments.length
  const averageCompletion =
    totalAssessments > 0
      ? Math.round(
          assessments.reduce((sum, a) => sum + getCompletionPercentage(a.completed_skills, a.total_skills), 0) /
            totalAssessments,
        )
      : 0
  const lastAssessment = assessments.length > 0 ? assessments[0].created_at : null

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your assessments...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link href="/">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Saved Assessments</h1>
              <p className="text-gray-600">View and manage your completed skill assessments</p>
            </div>
            <Link href="/self-review">
              <Button>
                <Target className="w-4 h-4 mr-2" />
                New Assessment
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button variant="link" onClick={loadAssessments} className="ml-2 p-0 h-auto">
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-2xl font-bold">{totalAssessments}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Average Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-2xl font-bold">{averageCompletion}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Last Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-sm font-medium">
                  {lastAssessment ? formatDate(lastAssessment) : "No assessments"}
                </span>
              </div>
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
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No matching assessments" : "No assessments yet"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "Try adjusting your search terms" : "Start by creating your first skill assessment"}
              </p>
              {!searchTerm && (
                <Link href="/self-review">
                  <Button>
                    <Target className="w-4 h-4 mr-2" />
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
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{assessment.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {assessment.job_role_name} • {assessment.department_name}
                        </CardDescription>
                      </div>
                      <Badge variant={getCompletionBadgeVariant(completionPercentage)}>{completionPercentage}%</Badge>
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
                                    <h4 className="font-medium mb-1">Completion</h4>
                                    <p className="text-2xl font-bold">
                                      {getCompletionPercentage(
                                        selectedAssessment.completed_skills,
                                        selectedAssessment.total_skills,
                                      )}
                                      %
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-1">Skills Assessed</h4>
                                    <p className="text-2xl font-bold">
                                      {selectedAssessment.completed_skills}/{selectedAssessment.total_skills}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Assessment Date</h4>
                                  <p className="text-gray-600">{formatDate(selectedAssessment.created_at)}</p>
                                </div>
                                {selectedAssessment.assessment_data && (
                                  <div>
                                    <h4 className="font-medium mb-2">Rating Summary</h4>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                      <p className="text-sm text-gray-600">
                                        Assessment data available for detailed analysis
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExportAssessment(assessment)}
                          title="Export as JSON"
                        >
                          <Download className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAssessment(assessment.id, assessment.name)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete assessment"
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
    </div>
  )
}
