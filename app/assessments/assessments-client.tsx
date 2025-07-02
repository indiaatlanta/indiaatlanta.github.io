"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
} from "@/components/ui/dialog"
import {
  FileText,
  Search,
  MoreVertical,
  Download,
  Trash2,
  Calendar,
  TrendingUp,
  Users,
  Target,
  Clock,
  Filter,
} from "lucide-react"

interface SavedAssessment {
  id: number
  assessment_name: string
  job_role: string
  department: string
  skills_data: any
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
  const [assessments, setAssessments] = useState<SavedAssessment[]>([])
  const [filteredAssessments, setFilteredAssessments] = useState<SavedAssessment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBy, setFilterBy] = useState<"all" | "completed" | "incomplete">("all")
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    loadAssessments()
  }, [])

  useEffect(() => {
    filterAssessments()
  }, [assessments, searchTerm, filterBy])

  const loadAssessments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/assessments")
      const data = await response.json()

      if (response.ok) {
        setAssessments(data.assessments || [])
        setIsDemoMode(data.isDemoMode || false)
      } else {
        console.error("Failed to load assessments:", data.error)
        setAssessments([])
        setIsDemoMode(true)
      }
    } catch (error) {
      console.error("Error loading assessments:", error)
      setAssessments([])
      setIsDemoMode(true)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAssessments = () => {
    let filtered = assessments

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (assessment) =>
          assessment.assessment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assessment.job_role.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assessment.department.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply completion filter
    if (filterBy === "completed") {
      filtered = filtered.filter((assessment) => assessment.completion_percentage >= 100)
    } else if (filterBy === "incomplete") {
      filtered = filtered.filter((assessment) => assessment.completion_percentage < 100)
    }

    setFilteredAssessments(filtered)
  }

  const deleteAssessment = async (id: number) => {
    try {
      const response = await fetch(`/api/assessments/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setAssessments(assessments.filter((assessment) => assessment.id !== id))
      } else {
        console.error("Failed to delete assessment")
      }
    } catch (error) {
      console.error("Error deleting assessment:", error)
    }
  }

  const exportAssessment = (assessment: SavedAssessment) => {
    const dataStr = JSON.stringify(assessment, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = `${assessment.assessment_name.replace(/\s+/g, "_")}_assessment.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getCompletionBadgeVariant = (percentage: number) => {
    if (percentage >= 100) return "default"
    if (percentage >= 80) return "secondary"
    return "outline"
  }

  // Calculate statistics
  const totalAssessments = assessments.length
  const completedAssessments = assessments.filter((a) => a.completion_percentage >= 100).length
  const averageScore =
    assessments.length > 0 ? assessments.reduce((sum, a) => sum + a.overall_score, 0) / assessments.length : 0

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssessments}</div>
            <p className="text-xs text-muted-foreground">{completedAssessments} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalAssessments > 0 ? Math.round((completedAssessments / totalAssessments) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {completedAssessments} of {totalAssessments} assessments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Across all assessments</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search assessments by name, role, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Filter: {filterBy === "all" ? "All" : filterBy === "completed" ? "Completed" : "Incomplete"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterBy("all")}>All Assessments</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterBy("completed")}>Completed Only</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterBy("incomplete")}>Incomplete Only</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Demo Mode Notice */}
      {isDemoMode && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-800">
              <Clock className="h-5 w-5" />
              <p className="font-medium">Demo Mode Active</p>
            </div>
            <p className="text-sm text-amber-700 mt-1">
              Database is not configured. Assessment data will not be persisted.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Assessments List */}
      {filteredAssessments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterBy !== "all" ? "No matching assessments" : "No assessments yet"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterBy !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Start by completing a self-assessment to track your skills and progress."}
            </p>
            {!searchTerm && filterBy === "all" && (
              <Button asChild>
                <a href="/self-review">Create Your First Assessment</a>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAssessments.map((assessment) => (
            <Card key={assessment.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{assessment.assessment_name}</CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {assessment.job_role}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {assessment.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(assessment.created_at).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => exportAssessment(assessment)}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
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
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge variant={getCompletionBadgeVariant(assessment.completion_percentage)}>
                      {Math.round(assessment.completion_percentage)}% Complete
                    </Badge>
                    <div className="text-sm text-gray-600">Score: {assessment.overall_score.toFixed(1)}%</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getCompletionColor(assessment.completion_percentage)}`}
                        style={{ width: `${Math.min(assessment.completion_percentage, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 w-12">{Math.round(assessment.completion_percentage)}%</span>
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
