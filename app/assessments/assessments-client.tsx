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
  FileText,
  Search,
  Download,
  Trash2,
  Calendar,
  BarChart3,
  Target,
  TrendingUp,
  Clock,
  Filter,
} from "lucide-react"
import Link from "next/link"

interface User {
  id: number
  email: string
  name: string
  role: string
}

interface Assessment {
  id: number
  assessment_name: string
  job_role: string
  department: string
  overall_score: number
  completion_percentage: number
  created_at: string
  updated_at: string
}

interface AssessmentStats {
  total: number
  completed: number
  inProgress: number
  averageScore: number
}

interface AssessmentsClientProps {
  user: User
}

export default function AssessmentsClient({ user }: AssessmentsClientProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [stats, setStats] = useState<AssessmentStats>({
    total: 0,
    completed: 0,
    inProgress: 0,
    averageScore: 0,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [deleting, setDeleting] = useState<number | null>(null)

  useEffect(() => {
    loadAssessments()
  }, [search, filter])

  const loadAssessments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (filter !== "all") params.append("filter", filter)

      const response = await fetch(`/api/assessments?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAssessments(Array.isArray(data.assessments) ? data.assessments : [])
        setStats(data.stats || { total: 0, completed: 0, inProgress: 0, averageScore: 0 })
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
        await loadAssessments()
      } else {
        console.error("Failed to delete assessment")
      }
    } catch (error) {
      console.error("Error deleting assessment:", error)
    } finally {
      setDeleting(null)
    }
  }

  const handleExport = async (assessment: Assessment) => {
    try {
      const response = await fetch(`/api/assessments/${assessment.id}`)
      if (response.ok) {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data.assessment, null, 2)], {
          type: "application/json",
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${assessment.assessment_name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Error exporting assessment:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Saved Assessments</h1>
              <p className="text-gray-600">View and manage your completed skill assessments</p>
            </div>
            <Button asChild>
              <Link href="/self-review">
                <Target className="h-4 w-4 mr-2" />
                New Assessment
              </Link>
            </Button>
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
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">100% complete</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">Partially complete</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Overall performance</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search assessments by name, role, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assessments</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Assessments List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : assessments.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {assessments.map((assessment) => (
              <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{assessment.assessment_name}</CardTitle>
                      <CardDescription>
                        {assessment.job_role} • {assessment.department}
                      </CardDescription>
                    </div>
                    <Badge variant={assessment.completion_percentage >= 100 ? "default" : "secondary"}>
                      {Math.round(assessment.completion_percentage)}% Complete
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{Math.round(assessment.completion_percentage)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${assessment.completion_percentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Overall Score</span>
                      <span className="font-semibold">{assessment.overall_score.toFixed(1)}%</span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      Created {new Date(assessment.created_at).toLocaleDateString()}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button variant="outline" size="sm" onClick={() => handleExport(assessment)} className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 bg-transparent"
                          >
                            <Trash2 className="h-4 w-4" />
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
                              onClick={() => handleDelete(assessment.id)}
                              disabled={deleting === assessment.id}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {deleting === assessment.id ? "Deleting..." : "Delete"}
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
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessments Found</h3>
              <p className="text-gray-600 mb-4">
                {search || filter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "You haven't completed any assessments yet. Start your first assessment to track your skills."}
              </p>
              <Button asChild>
                <Link href="/self-review">
                  <Target className="h-4 w-4 mr-2" />
                  Start Your First Assessment
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
