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
import {
  Search,
  Filter,
  Download,
  Trash2,
  FileText,
  Calendar,
  TrendingUp,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"

interface SavedAssessment {
  id: number
  name: string
  job_role_name: string
  department_name: string
  completion_percentage: number
  total_skills: number
  completed_skills: number
  created_at: string
  updated_at: string
}

interface AssessmentsClientProps {
  user: {
    id: number
    name: string
    email: string
    role: string
  }
}

export default function AssessmentsClient({ user }: AssessmentsClientProps) {
  const [assessments, setAssessments] = useState<SavedAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    averageCompletion: 0,
  })

  useEffect(() => {
    loadAssessments()
  }, [searchTerm, filterStatus])

  const loadAssessments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (filterStatus !== "all") params.append("filter", filterStatus)

      const response = await fetch(`/api/assessments?${params}`)
      if (response.ok) {
        const data = await response.json()
        const assessmentsList = Array.isArray(data.assessments) ? data.assessments : []
        setAssessments(assessmentsList)

        // Calculate stats
        const total = assessmentsList.length
        const completed = assessmentsList.filter((a: SavedAssessment) => a.completion_percentage >= 100).length
        const inProgress = assessmentsList.filter(
          (a: SavedAssessment) => a.completion_percentage > 0 && a.completion_percentage < 100,
        ).length
        const averageCompletion =
          total > 0
            ? assessmentsList.reduce((sum: number, a: SavedAssessment) => sum + a.completion_percentage, 0) / total
            : 0

        setStats({ total, completed, inProgress, averageCompletion })
      }
    } catch (error) {
      console.error("Failed to load assessments:", error)
      setAssessments([])
    } finally {
      setLoading(false)
    }
  }

  const deleteAssessment = async (id: number) => {
    try {
      const response = await fetch(`/api/assessments/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        loadAssessments() // Reload the list
      }
    } catch (error) {
      console.error("Failed to delete assessment:", error)
    }
  }

  const exportAssessment = async (assessment: SavedAssessment) => {
    try {
      const response = await fetch(`/api/assessments/${assessment.id}`)
      if (response.ok) {
        const data = await response.json()
        const exportData = {
          ...data.assessment,
          exported_at: new Date().toISOString(),
          exported_by: user.name,
        }

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: "application/json",
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `assessment-${assessment.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Failed to export assessment:", error)
    }
  }

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 100) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Complete
        </Badge>
      )
    } else if (percentage > 0) {
      return (
        <Badge variant="secondary">
          <AlertCircle className="w-3 h-3 mr-1" />
          In Progress
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline">
          <Clock className="w-3 h-3 mr-1" />
          Not Started
        </Badge>
      )
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">100% complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Partially complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{Math.round(stats.averageCompletion)}%</div>
            <p className="text-xs text-muted-foreground">Across all assessments</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search assessments by name, role, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
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
        </CardContent>
      </Card>

      {/* Assessments List */}
      {loading ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading assessments...</p>
          </CardContent>
        </Card>
      ) : assessments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessments Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria."
                : "You haven't completed any assessments yet."}
            </p>
            <Button asChild>
              <Link href="/self-review">Start Your First Assessment</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {assessments.map((assessment) => (
            <Card key={assessment.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{assessment.name}</CardTitle>
                    <CardDescription>
                      {assessment.job_role_name} • {assessment.department_name}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">{getStatusBadge(assessment.completion_percentage)}</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{Math.round(assessment.completion_percentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${assessment.completion_percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {assessment.completed_skills} of {assessment.total_skills} skills completed
                      </span>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created {formatDate(assessment.created_at)}
                      </span>
                      {assessment.updated_at !== assessment.created_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Updated {formatDate(assessment.updated_at)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => exportAssessment(assessment)}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{assessment.name}"? This action cannot be undone.
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
