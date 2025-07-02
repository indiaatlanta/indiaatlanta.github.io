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
import { FileText, Search, Calendar, Target, Download, Trash2, Eye, ArrowLeft, BarChart3, Plus } from "lucide-react"
import Link from "next/link"

interface Assessment {
  id: number
  assessment_name: string
  job_role_name: string
  department_name: string
  completed_skills: number
  total_skills: number
  created_at: string
  assessment_data: string
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
  const [error, setError] = useState<string | null>(null)

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
      setIsDemoMode(data.isDemoMode || false)
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
        assessment.assessment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const handleExportAssessment = (assessment: Assessment) => {
    const exportData = {
      name: assessment.assessment_name,
      role: assessment.job_role_name,
      department: assessment.department_name,
      completed: assessment.completed_skills,
      total: assessment.total_skills,
      date: new Date(assessment.created_at).toLocaleDateString(),
      data: assessment.assessment_data,
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${assessment.assessment_name.replace(/\s+/g, "_")}_assessment.json`
    link.click()
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
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const calculateStats = () => {
    if (assessments.length === 0) {
      return { total: 0, avgCompletion: 0, lastAssessment: null }
    }

    const totalCompletion = assessments.reduce((sum, assessment) => {
      return sum + getCompletionPercentage(assessment.completed_skills, assessment.total_skills)
    }, 0)

    const avgCompletion = Math.round(totalCompletion / assessments.length)
    const lastAssessment = assessments.reduce((latest, current) => {
      return new Date(current.created_at) > new Date(latest.created_at) ? current : latest
    })

    return {
      total: assessments.length,
      avgCompletion,
      lastAssessment: formatDate(lastAssessment.created_at),
    }
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assessments...</p>
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
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Saved Assessments</h1>
                <p className="text-sm text-gray-500">Manage your skill assessments</p>
              </div>
              {isDemoMode && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  Demo Mode
                </Badge>
              )}
            </div>
            <Link href="/self-review">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Assessment
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Saved assessments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Completion</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgCompletion}%</div>
              <p className="text-xs text-muted-foreground">Across all assessments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Assessment</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.lastAssessment ? "Recent" : "None"}</div>
              <p className="text-xs text-muted-foreground">{stats.lastAssessment || "No assessments yet"}</p>
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
        {filteredAssessments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssessments.map((assessment) => {
              const completionPercentage = getCompletionPercentage(assessment.completed_skills, assessment.total_skills)

              return (
                <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{assessment.assessment_name}</CardTitle>
                        <CardDescription>
                          {assessment.job_role_name} • {assessment.department_name}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Progress</span>
                          <span className={`text-sm font-medium ${getCompletionColor(completionPercentage)}`}>
                            {completionPercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${completionPercentage}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">
                            {assessment.completed_skills} of {assessment.total_skills} skills
                          </span>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(assessment.created_at)}
                      </div>

                      {/* Actions */}
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
                              <DialogTitle>{assessment.assessment_name}</DialogTitle>
                              <DialogDescription>Assessment details and progress</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Job Role</label>
                                  <p className="text-sm text-gray-900">{assessment.job_role_name}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Department</label>
                                  <p className="text-sm text-gray-900">{assessment.department_name}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Completed Skills</label>
                                  <p className="text-sm text-gray-900">
                                    {assessment.completed_skills} of {assessment.total_skills}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Completion</label>
                                  <p className={`text-sm font-medium ${getCompletionColor(completionPercentage)}`}>
                                    {completionPercentage}%
                                  </p>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700">Created</label>
                                <p className="text-sm text-gray-900">{formatDate(assessment.created_at)}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button variant="outline" size="sm" onClick={() => handleExportAssessment(assessment)}>
                          <Download className="w-4 h-4 mr-1" />
                          Export
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAssessment(assessment.id, assessment.assessment_name)}
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
        ) : (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? "No matching assessments" : "No saved assessments"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first skill assessment"}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Link href="/self-review">
                  <Button>
                    <Target className="w-4 h-4 mr-2" />
                    Start Assessment
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
