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
  BarChart3,
  Target,
  TrendingUp,
  Clock,
} from "lucide-react"
import Link from "next/link"

interface Assessment {
  id: number
  name: string
  job_role_name: string
  department_name: string
  overall_score: number
  completion_percentage: number
  created_at: string
  updated_at: string
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
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [deleting, setDeleting] = useState<number | null>(null)

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
        setAssessments(Array.isArray(data.assessments) ? data.assessments : [])
      } else {
        console.error("Failed to load assessments")
        setAssessments([])
      }
    } catch (error) {
      console.error("Error loading assessments:", error)
      setAssessments([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    setDeleting(id)
    try {
      const response = await fetch(`/api/assessments/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setAssessments(assessments.filter((a) => a.id !== id))
      } else {
        console.error("Failed to delete assessment")
      }
    } catch (error) {
      console.error("Error deleting assessment:", error)
    } finally {
      setDeleting(null)
    }
  }

  const handleExport = (assessment: Assessment) => {
    const dataStr = JSON.stringify(assessment, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `${assessment.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_assessment.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const getStats = () => {
    const total = assessments.length
    const completed = assessments.filter((a) => a.completion_percentage >= 100).length
    const inProgress = total - completed
    const avgScore = total > 0 ? assessments.reduce((sum, a) => sum + a.overall_score, 0) / total : 0

    return { total, completed, inProgress, avgScore }
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Saved Assessments</h1>
              <p className="text-gray-600">Manage and review your completed skill assessments</p>
            </div>
            <div className="flex items-center gap-4">
              <Button asChild variant="outline">
                <Link href="/">← Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">100% complete</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">Partially complete</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgScore.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Overall performance</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search assessments by name, role, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assessments</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessments List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : assessments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessments Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== "all"
                  ? "No assessments match your current search or filter criteria."
                  : "You haven't completed any assessments yet. Start your first assessment to see it here."}
              </p>
              <div className="flex justify-center gap-4">
                {(searchTerm || filterStatus !== "all") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("")
                      setFilterStatus("all")
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
                <Button asChild>
                  <Link href="/self-review">Start New Assessment</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.map((assessment) => (
              <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{assessment.name}</CardTitle>
                      <CardDescription className="truncate">
                        {assessment.job_role_name} • {assessment.department_name}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress and Score */}
                    <div className="flex items-center justify-between">
                      <Badge variant={assessment.completion_percentage >= 100 ? "default" : "secondary"}>
                        {Math.round(assessment.completion_percentage)}% Complete
                      </Badge>
                      <span className="text-sm font-medium">Score: {assessment.overall_score.toFixed(1)}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(assessment.completion_percentage, 100)}%` }}
                      />
                    </div>

                    {/* Dates */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Created: {new Date(assessment.created_at).toLocaleDateString()}
                      </div>
                      {assessment.updated_at !== assessment.created_at && (
                        <div className="flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Updated: {new Date(assessment.updated_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <Button variant="outline" size="sm" onClick={() => handleExport(assessment)}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={deleting === assessment.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                          >
                            {deleting === assessment.id ? (
                              <div className="w-4 h-4 border border-red-600 border-t-transparent rounded-full animate-spin mr-2" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-2" />
                            )}
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
                              onClick={() => handleDelete(assessment.id)}
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
    </div>
  )
}
