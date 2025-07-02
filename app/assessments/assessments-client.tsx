"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
} from "@/components/ui/dialog"
import { FileText, Search, Filter, Download, Trash2, Calendar, BarChart3, Clock, Building2, User } from "lucide-react"
import Link from "next/link"

interface SavedAssessment {
  id: number
  name: string
  job_role_name: string
  department_name: string
  completed_skills: number
  total_skills: number
  created_at: string
  assessment_data?: any
}

export default function AssessmentsClient() {
  const [assessments, setAssessments] = useState<SavedAssessment[]>([])
  const [filteredAssessments, setFilteredAssessments] = useState<SavedAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBy, setFilterBy] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    loadAssessments()
  }, [])

  useEffect(() => {
    filterAndSortAssessments()
  }, [assessments, searchTerm, filterBy, sortBy])

  const loadAssessments = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/assessments")
      if (response.ok) {
        const data = await response.json()
        const assessments = Array.isArray(data.assessments) ? data.assessments : []
        setAssessments(assessments)
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

  const filterAndSortAssessments = () => {
    let filtered = [...assessments]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (assessment) =>
          assessment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assessment.job_role_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assessment.department_name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply category filter
    if (filterBy !== "all") {
      filtered = filtered.filter((assessment) => {
        switch (filterBy) {
          case "high-completion":
            return getCompletionPercentage(assessment.completed_skills, assessment.total_skills) >= 80
          case "medium-completion":
            return (
              getCompletionPercentage(assessment.completed_skills, assessment.total_skills) >= 50 &&
              getCompletionPercentage(assessment.completed_skills, assessment.total_skills) < 80
            )
          case "low-completion":
            return getCompletionPercentage(assessment.completed_skills, assessment.total_skills) < 50
          default:
            return true
        }
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "name":
          return a.name.localeCompare(b.name)
        case "completion":
          return (
            getCompletionPercentage(b.completed_skills, b.total_skills) -
            getCompletionPercentage(a.completed_skills, a.total_skills)
          )
        default:
          return 0
      }
    })

    setFilteredAssessments(filtered)
  }

  const deleteAssessment = async (id: number) => {
    try {
      const response = await fetch(`/api/assessments/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setAssessments((prev) => prev.filter((assessment) => assessment.id !== id))
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

    const exportFileDefaultName = `assessment-${assessment.name.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const getCompletionPercentage = (completed: number, total: number) => {
    if (total === 0) return 0
    return Math.round((completed / total) * 100)
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return "Unknown date"
    }
  }

  const getCompletionBadgeVariant = (percentage: number) => {
    if (percentage >= 80) return "default"
    if (percentage >= 50) return "secondary"
    return "outline"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading assessments...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assessments</p>
                <p className="text-2xl font-bold">{assessments.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Completion</p>
                <p className="text-2xl font-bold">
                  {assessments.length > 0
                    ? Math.round(
                        assessments.reduce(
                          (acc, curr) => acc + getCompletionPercentage(curr.completed_skills, curr.total_skills),
                          0,
                        ) / assessments.length,
                      )
                    : 0}
                  %
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold">{new Set(assessments.map((a) => a.department_name)).size}</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Latest</p>
                <p className="text-sm font-bold">
                  {assessments.length > 0
                    ? formatDate(
                        assessments.sort(
                          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
                        )[0].created_at,
                      ).split(",")[0]
                    : "None"}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search assessments, roles, or departments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by completion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assessments</SelectItem>
                <SelectItem value="high-completion">High Completion (80%+)</SelectItem>
                <SelectItem value="medium-completion">Medium Completion (50-79%)</SelectItem>
                <SelectItem value="low-completion">Low Completion (&lt;50%)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="completion">Completion %</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assessments List */}
      {filteredAssessments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {assessments.length === 0 ? "No assessments found" : "No matching assessments"}
            </h3>
            <p className="text-gray-500 mb-4">
              {assessments.length === 0
                ? "Start your first assessment to see it here."
                : "Try adjusting your search or filter criteria."}
            </p>
            {assessments.length === 0 && (
              <Button asChild>
                <Link href="/self-review">Start Assessment</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAssessments.map((assessment) => {
            const completionPercentage = getCompletionPercentage(assessment.completed_skills, assessment.total_skills)

            return (
              <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{assessment.name}</CardTitle>
                      <CardDescription className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {assessment.job_role_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {assessment.department_name}
                        </span>
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
                        <span>Skills Completed</span>
                        <span>
                          {assessment.completed_skills} / {assessment.total_skills}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Date and Actions */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(assessment.created_at)}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => exportAssessment(assessment)}>
                          <Download className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4 text-red-500" />
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
