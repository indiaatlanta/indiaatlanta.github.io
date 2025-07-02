"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FileText, Search, Calendar, Target, Download, Trash2, Eye, ArrowLeft, BarChart3, Clock, User, Building2 } from 'lucide-react'
import Link from "next/link"

interface SavedAssessment {
  id: number
  assessment_name: string
  job_role_name: string
  department_name: string
  completed_skills: number
  total_skills: number
  created_at: string
  assessment_data?: string
}

interface AssessmentData {
  [skillId: string]: {
    rating: number
    notes?: string
  }
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
  const [filteredAssessments, setFilteredAssessments] = useState<SavedAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAssessment, setSelectedAssessment] = useState<SavedAssessment | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    loadAssessments()
  }, [])

  useEffect(() => {
    // Filter assessments based on search term
    const filtered = assessments.filter(assessment =>
      assessment.assessment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.job_role_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.department_name.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleDeleteAssessment = async (assessmentId: number, assessmentName: string) => {
    if (!confirm(`Are you sure you want to delete "${assessmentName}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/assessments/${assessmentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setAssessments(prev => prev.filter(a => a.id !== assessmentId))
      } else {
        alert("Failed to delete assessment")
      }
    } catch (error) {
      console.error("Failed to delete assessment:", error)
      alert("Failed to delete assessment")
    }
  }

  const handleExportPDF = async (assessment: SavedAssessment) => {
    try {
      // Create a simple PDF export (you could enhance this with a proper PDF library)
      const content = `
Assessment Report
================

Name: ${assessment.assessment_name}
Role: ${assessment.job_role_name}
Department: ${assessment.department_name}
Date: ${formatDate(assessment.created_at)}
Progress: ${assessment.completed_skills}/${assessment.total_skills} skills (${getCompletionPercentage(assessment.completed_skills, assessment.total_skills)}%)

Generated on ${new Date().toLocaleDateString()}
      `.trim()

      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${assessment.assessment_name.replace(/[^a-z0-9]/gi, '_')}_assessment.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export assessment:", error)
      alert("Failed to export assessment")
    }
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

  const getAssessmentData = (assessment: SavedAssessment): AssessmentData => {
    if (!assessment.assessment_data) return {}
    try {
      return JSON.parse(assessment.assessment_data)
    } catch {
      return {}
    }
  }

  const getRatingsSummary = (assessmentData: AssessmentData) => {
    const ratings = Object.values(assessmentData).map(skill => skill.rating).filter(Boolean)
    if (ratings.length === 0) return null

    const summary = {
      1: ratings.filter(r => r === 1).length,
      2: ratings.filter(r => r === 2).length,
      3: ratings.filter(r => r === 3).length,
      4: ratings.filter(r => r === 4).length,
      5: ratings.filter(r => r === 5).length,
    }

    return summary
  }

  const totalAssessments = assessments.length
  const avgCompletion = assessments.length > 0 
    ? Math.round(assessments.reduce((sum, a) => sum + getCompletionPercentage(a.completed_skills, a.total_skills), 0) / assessments.length)
    : 0
  const lastAssessment = assessments.length > 0 
    ? assessments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    : null

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
              <div className="h-6 w-px bg-gray-300" />
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAssessments}</div>
              <p className="text-xs text-muted-foreground">Saved assessments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Completion</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgCompletion}%</div>
              <p className="text-xs text-muted-foreground">Across all assessments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Assessment</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lastAssessment ? formatDate(lastAssessment.created_at).split(',')[0] : 'None'}
              </div>
              <p className="text-xs text-muted-foreground">
                {lastAssessment ? lastAssessment.assessment_name : 'No assessments yet'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search assessments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Link href="/self-review">
            <Button>
              <Target className="h-4 w-4 mr-2" />
              New Assessment
            </Button>
          </Link>
        </div>

        {/* Assessments List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading assessments...</p>
          </div>
        ) : filteredAssessments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? "No matching assessments" : "No saved assessments"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? "Try adjusting your search terms"
                  : "Start by taking your first skill assessment"
                }
              </p>
              {!searchTerm && (
                <Link href="/self-review">
                  <Button>
                    <Target className="h-4 w-4 mr-2" />
                    Start Assessment
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssessments.map((assessment) => (
              <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{assessment.assessment_name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        {assessment.job_role_name}
                      </CardDescription>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Building2 className="h-3 w-3" />
                        {assessment.department_name}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Progress</span>
                        <Badge variant="outline">
                          {getCompletionPercentage(assessment.completed_skills, assessment.total_skills)}%
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${getCompletionPercentage(assessment.completed_skills, assessment.total_skills)}%` 
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {assessment.completed_skills} of {assessment.total_skills} skills assessed
                      </p>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {formatDate(assessment.created_at)}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => setSelectedAssessment(assessment)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{selectedAssessment?.assessment_name}</DialogTitle>
                            <DialogDescription>
                              Assessment details and progress summary
                            </DialogDescription>
                          </DialogHeader>
                          {selectedAssessment && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Role</label>
                                  <p className="text-sm text-gray-900">{selectedAssessment.job_role_name}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Department</label>
                                  <p className="text-sm text-gray-900">{selectedAssessment.department_name}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Date Created</label>
                                  <p className="text-sm text-gray-900">{formatDate(selectedAssessment.created_at)}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Completion</label>
                                  <p className="text-sm text-gray-900">
                                    {getCompletionPercentage(selectedAssessment.completed_skills, selectedAssessment.total_skills)}%
                                  </p>
                                </div>
                              </div>
                              
                              {(() => {
                                const assessmentData = getAssessmentData(selectedAssessment)
                                const ratingsSummary = getRatingsSummary(assessmentData)
                                
                                return ratingsSummary && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Rating Distribution</label>
                                    <div className="grid grid-cols-5 gap-2">
                                      {[1, 2, 3, 4, 5].map(rating => (
                                        <div key={rating} className="text-center">
                                          <div className="text-lg font-bold text-gray-900">
                                            {ratingsSummary[rating as keyof typeof ratingsSummary]}
                                          </div>
                                          <div className="text-xs text-gray-600">
                                            {rating} star{rating !== 1 ? 's' : ''}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )
                              })()}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExportPDF(assessment)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>

                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteAssessment(assessment.id, assessment.assessment_name)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
