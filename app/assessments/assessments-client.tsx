"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Calendar,
  Target,
  Trash2,
  Search,
  FileText,
  Download,
  Eye,
  ArrowLeft,
  AlertTriangle,
  Briefcase,
} from "lucide-react"
import Link from "next/link"
import jsPDF from "jspdf"

interface SavedAssessment {
  id: number
  name: string
  job_role_name: string
  department_name: string
  completed_skills: number
  total_skills: number
  created_at: string
  assessment_data: any
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

const RATING_OPTIONS = [
  { value: "needs-development", label: "Needs Development" },
  { value: "developing", label: "Developing" },
  { value: "proficient", label: "Proficient / Fully Displayed" },
  { value: "strength", label: "Strength / Role Model" },
  { value: "not-applicable", label: "Not Applicable" },
]

export default function AssessmentsClient({ user }: AssessmentsClientProps) {
  const [assessments, setAssessments] = useState<SavedAssessment[]>([])
  const [filteredAssessments, setFilteredAssessments] = useState<SavedAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAssessment, setSelectedAssessment] = useState<SavedAssessment | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [assessmentToDelete, setAssessmentToDelete] = useState<SavedAssessment | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

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
      const response = await fetch("/api/assessments")
      if (response.ok) {
        const data = await response.json()
        setAssessments(data.assessments || [])
        setIsDemoMode(data.isDemoMode || false)
      } else {
        console.error("Failed to load assessments")
      }
    } catch (error) {
      console.error("Error loading assessments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAssessment = async () => {
    if (!assessmentToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/assessments/${assessmentToDelete.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setAssessments((prev) => prev.filter((a) => a.id !== assessmentToDelete.id))
        setDeleteDialogOpen(false)
        setAssessmentToDelete(null)
      } else {
        alert("Failed to delete assessment")
      }
    } catch (error) {
      console.error("Failed to delete assessment:", error)
      alert("Failed to delete assessment")
    } finally {
      setIsDeleting(false)
    }
  }

  const generateAssessmentPDF = async (assessment: SavedAssessment) => {
    setIsGeneratingPDF(true)
    try {
      const doc = new jsPDF("p", "mm", "a4")

      // Add header
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text("Henry Schein One", 20, 25)

      doc.setFontSize(16)
      doc.text(`Assessment: ${assessment.name}`, 20, 35)

      // Add assessment information
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text(`Role: ${assessment.job_role_name}`, 20, 50)
      doc.text(`Department: ${assessment.department_name}`, 20, 60)
      doc.text(`Completed: ${formatDate(assessment.created_at)}`, 20, 70)
      doc.text(`Progress: ${assessment.completed_skills}/${assessment.total_skills} skills`, 20, 80)

      // Add summary if assessment data is available
      if (assessment.assessment_data && assessment.assessment_data.ratings) {
        const ratings = assessment.assessment_data.ratings
        const summary = getRatingSummary(ratings)

        let yPos = 95
        doc.setFont("helvetica", "bold")
        doc.text("Assessment Summary:", 20, yPos)
        yPos += 10

        doc.setFont("helvetica", "normal")
        Object.entries(summary).forEach(([rating, count]) => {
          if (count > 0) {
            const label = RATING_OPTIONS.find((opt) => opt.value === rating)?.label || rating
            doc.text(`${label}: ${count}`, 25, yPos)
            yPos += 8
          }
        })

        // Add completion percentage
        const completionPercentage = Math.round((assessment.completed_skills / assessment.total_skills) * 100)
        doc.text(`Completion: ${completionPercentage}%`, 25, yPos)
      }

      doc.save(`assessment-${assessment.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const getRatingSummary = (ratings: any[]) => {
    const summary = {
      "needs-development": 0,
      developing: 0,
      proficient: 0,
      strength: 0,
      "not-applicable": 0,
    }

    ratings.forEach((rating) => {
      if (summary.hasOwnProperty(rating.rating)) {
        summary[rating.rating as keyof typeof summary]++
      }
    })

    return summary
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

  const getCompletionPercentage = (completed: number, total: number) => {
    if (total === 0) return 0
    return Math.round((completed / total) * 100)
  }

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-100 text-green-800"
    if (percentage >= 60) return "bg-blue-100 text-blue-800"
    if (percentage >= 40) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
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
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Saved Assessments</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isDemoMode && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Demo Mode
                </Badge>
              )}
              <Badge variant="outline">{user.name}</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Stats */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Assessments</h2>
              <p className="text-gray-600">View and manage your saved skill assessments</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search assessments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Link href="/self-review">
                <Button>
                  <Target className="w-4 h-4 mr-2" />
                  New Assessment
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Assessments</p>
                    <p className="text-2xl font-bold text-gray-900">{assessments.length}</p>
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
                    <p className="text-2xl font-bold text-gray-900">
                      {assessments.length > 0
                        ? Math.round(
                            assessments.reduce(
                              (sum, a) => sum + getCompletionPercentage(a.completed_skills, a.total_skills),
                              0,
                            ) / assessments.length,
                          )
                        : 0}
                      %
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Last Assessment</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {assessments.length > 0
                        ? new Date(
                            Math.max(...assessments.map((a) => new Date(a.created_at).getTime())),
                          ).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : "None"}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Assessments List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading assessments...</p>
          </div>
        ) : filteredAssessments.length > 0 ? (
          <div className="grid gap-6">
            {filteredAssessments.map((assessment) => {
              const completionPercentage = getCompletionPercentage(assessment.completed_skills, assessment.total_skills)
              return (
                <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{assessment.name}</h3>
                          <Badge className={getCompletionColor(completionPercentage)}>
                            {completionPercentage}% Complete
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {assessment.job_role_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            {assessment.department_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(assessment.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            <span className="font-medium">{assessment.completed_skills}</span>
                            <span className="text-gray-500"> of {assessment.total_skills} skills rated</span>
                          </div>
                          <div className="flex-1 max-w-xs">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${completionPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAssessment(assessment)
                            setViewDialogOpen(true)
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateAssessmentPDF(assessment)}
                          disabled={isGeneratingPDF}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          PDF
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAssessmentToDelete(assessment)
                            setDeleteDialogOpen(true)
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No matching assessments" : "No saved assessments"}
            </h3>
            <p className="text-gray-600 mb-6">
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
          </div>
        )}

        {/* View Assessment Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Assessment Details</DialogTitle>
            </DialogHeader>
            {selectedAssessment && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Assessment Name</label>
                    <p className="text-sm text-gray-900">{selectedAssessment.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Job Role</label>
                    <p className="text-sm text-gray-900">{selectedAssessment.job_role_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Department</label>
                    <p className="text-sm text-gray-900">{selectedAssessment.department_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Completed</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedAssessment.created_at)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Progress</label>
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-900">
                        {selectedAssessment.completed_skills} of {selectedAssessment.total_skills} skills rated
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {getCompletionPercentage(selectedAssessment.completed_skills, selectedAssessment.total_skills)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${getCompletionPercentage(selectedAssessment.completed_skills, selectedAssessment.total_skills)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {selectedAssessment.assessment_data && selectedAssessment.assessment_data.ratings && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Rating Summary</label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {Object.entries(getRatingSummary(selectedAssessment.assessment_data.ratings)).map(
                        ([rating, count]) => {
                          if (count > 0) {
                            const label = RATING_OPTIONS.find((opt) => opt.value === rating)?.label || rating
                            return (
                              <div key={rating} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="text-sm text-gray-700">{label}</span>
                                <Badge variant="outline">{count}</Badge>
                              </div>
                            )
                          }
                          return null
                        },
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                    Close
                  </Button>
                  <Button onClick={() => generateAssessmentPDF(selectedAssessment)} disabled={isGeneratingPDF}>
                    {isGeneratingPDF ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Delete Assessment
              </DialogTitle>
            </DialogHeader>
            {assessmentToDelete && (
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Are you sure you want to delete "{assessmentToDelete.name}"? This action cannot be undone.
                  </AlertDescription>
                </Alert>
                <div className="text-sm text-gray-600">
                  <p>
                    <strong>Role:</strong> {assessmentToDelete.job_role_name}
                  </p>
                  <p>
                    <strong>Department:</strong> {assessmentToDelete.department_name}
                  </p>
                  <p>
                    <strong>Created:</strong> {formatDate(assessmentToDelete.created_at)}
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteAssessment} disabled={isDeleting}>
                    {isDeleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Assessment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
