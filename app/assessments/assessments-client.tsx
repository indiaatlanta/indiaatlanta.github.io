"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Search, Download, Trash2, FileText, Clock, Target, TrendingUp, Filter } from "lucide-react"
import { toast } from "sonner"

interface Assessment {
  id: number
  assessment_name: string
  job_role_name: string
  department_name: string
  overall_score: number
  completion_percentage: number
  total_skills: number
  completed_skills: number
  skills_data: any
  created_at: string
  updated_at: string
}

interface AssessmentStats {
  totalAssessments: number
  completedAssessments: number
  inProgressAssessments: number
  averageScore: number
}

export default function AssessmentsClient() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [stats, setStats] = useState<AssessmentStats>({
    totalAssessments: 0,
    completedAssessments: 0,
    inProgressAssessments: 0,
    averageScore: 0,
  })

  useEffect(() => {
    loadAssessments()
  }, [])

  useEffect(() => {
    filterAssessments()
  }, [assessments, searchTerm, filterStatus])

  const loadAssessments = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/assessments")
      if (!response.ok) {
        throw new Error("Failed to fetch assessments")
      }
      const data = await response.json()
      const assessmentList = Array.isArray(data.assessments) ? data.assessments : []

      // Ensure all numeric fields are properly converted
      const normalizedAssessments = assessmentList.map((assessment: any) => ({
        ...assessment,
        overall_score: Number(assessment.overall_score) || 0,
        completion_percentage: Number(assessment.completion_percentage) || 0,
        total_skills: Number(assessment.total_skills) || 0,
        completed_skills: Number(assessment.completed_skills) || 0,
      }))

      setAssessments(normalizedAssessments)
      calculateStats(normalizedAssessments)
    } catch (error) {
      console.error("Failed to load assessments:", error)
      toast.error("Failed to load assessments")
      setAssessments([])
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (assessmentList: Assessment[]) => {
    const total = assessmentList.length
    const completed = assessmentList.filter((a) => Number(a.completion_percentage) >= 100).length
    const inProgress = assessmentList.filter((a) => {
      const percentage = Number(a.completion_percentage)
      return percentage > 0 && percentage < 100
    }).length
    const avgScore = total > 0 ? assessmentList.reduce((sum, a) => sum + Number(a.overall_score), 0) / total : 0

    setStats({
      totalAssessments: total,
      completedAssessments: completed,
      inProgressAssessments: inProgress,
      averageScore: avgScore,
    })
  }

  const filterAssessments = () => {
    let filtered = assessments

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (assessment) =>
          assessment.assessment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assessment.job_role_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assessment.department_name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((assessment) => {
        const percentage = Number(assessment.completion_percentage)
        if (filterStatus === "completed") return percentage >= 100
        if (filterStatus === "in-progress") return percentage > 0 && percentage < 100
        if (filterStatus === "not-started") return percentage === 0
        return true
      })
    }

    setFilteredAssessments(filtered)
  }

  const deleteAssessment = async (id: number) => {
    try {
      const response = await fetch(`/api/assessments/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete assessment")
      }

      setAssessments(assessments.filter((a) => a.id !== id))
      toast.success("Assessment deleted successfully")
    } catch (error) {
      console.error("Failed to delete assessment:", error)
      toast.error("Failed to delete assessment")
    }
  }

  const exportAssessment = (assessment: Assessment) => {
    const dataStr = JSON.stringify(assessment, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = `assessment-${assessment.assessment_name.replace(/\s+/g, "-")}-${assessment.id}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    toast.success("Assessment exported successfully")
  }

  const getStatusBadge = (completionPercentage: number) => {
    const percentage = Number(completionPercentage)
    if (percentage >= 100) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
    } else if (percentage > 0) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">In Progress</Badge>
    } else {
      return <Badge variant="outline">Not Started</Badge>
    }
  }

  const formatScore = (score: any) => {
    const numScore = Number(score) || 0
    return numScore.toFixed(1)
  }

  const formatPercentage = (percentage: any) => {
    const numPercentage = Number(percentage) || 0
    return Math.round(numPercentage)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading assessments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assessments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAssessments}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedAssessments}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgressAssessments}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{formatScore(stats.averageScore)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search assessments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assessments</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="not-started">Not Started</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessments List */}
      {filteredAssessments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Start by creating your first assessment."}
            </p>
            <Button asChild>
              <a href="/self-review">Create Assessment</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredAssessments.map((assessment) => (
            <Card key={assessment.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{assessment.assessment_name}</CardTitle>
                    <CardDescription className="mt-1">
                      {assessment.job_role_name} • {assessment.department_name}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">{getStatusBadge(assessment.completion_percentage)}</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {formatPercentage(assessment.completion_percentage)}%
                    </p>
                    <p className="text-xs text-gray-500">Completion</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{formatScore(assessment.overall_score)}%</p>
                    <p className="text-xs text-gray-500">Overall Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {Number(assessment.completed_skills) || 0}/{Number(assessment.total_skills) || 0}
                    </p>
                    <p className="text-xs text-gray-500">Skills Rated</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(assessment.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">Created</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    Last updated: {new Date(assessment.updated_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => exportAssessment(assessment)}>
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{assessment.assessment_name}"? This action cannot be
                            undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteAssessment(assessment.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
