"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Search, Calendar, BarChart3, ArrowLeft, Plus, AlertCircle, RefreshCw } from "lucide-react"
import Link from "next/link"

interface Assessment {
  id: number
  name: string
  role_name: string
  department_name: string
  completion_percentage: number
  assessment_data: any
  created_at: string
  updated_at: string
}

interface AssessmentStats {
  total: number
  averageCompletion: number
  lastAssessment: string | null
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
  const [stats, setStats] = useState<AssessmentStats>({
    total: 0,
    averageCompletion: 0,
    lastAssessment: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const loadAssessments = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/assessments")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to load assessments")
      }

      setAssessments(data.assessments || [])
      setStats(data.stats || { total: 0, averageCompletion: 0, lastAssessment: null })
    } catch (error) {
      console.error("Failed to load assessments:", error)
      setError(error instanceof Error ? error.message : "Failed to load assessments")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAssessments()
  }, [])

  const filteredAssessments = assessments.filter(
    (assessment) =>
      assessment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.role_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (assessment.department_name && assessment.department_name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleExport = (assessment: Assessment) => {
    const exportData = {
      name: assessment.name,
      role: assessment.role_name,
      department: assessment.department_name,
      completion: assessment.completion_percentage,
      data: assessment.assessment_data,
      created: assessment.created_at,
      updated: assessment.updated_at,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${assessment.name.replace(/\s+/g, "_")}_assessment.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDelete = async (assessmentId: number) => {
    if (!confirm("Are you sure you want to delete this assessment? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/assessments/${assessmentId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete assessment")
      }

      await loadAssessments()
    } catch (error) {
      console.error("Failed to delete assessment:", error)
      alert("Failed to delete assessment. Please try again.")
    }
  }

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 bg-green-100"
    if (percentage >= 60) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-lg text-gray-600">Loading assessments...</span>
            </div>
          </div>
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
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Saved Assessments</h1>
                <p className="text-sm text-gray-500">Manage your skill assessment history</p>
              </div>
            </div>
            <Button asChild>
              <Link href="/self-review">
                <Plus className="h-4 w-4 mr-2" />
                New Assessment
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={loadAssessments}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">completed assessments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Completion</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
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
                {stats.lastAssessment ? formatDate(stats.lastAssessment).split(",")[0] : "None"}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.lastAssessment ? formatDate(stats.lastAssessment).split(",")[1] : "No assessments yet"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
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

        {/* Assessments Grid */}
        {filteredAssessments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12\
