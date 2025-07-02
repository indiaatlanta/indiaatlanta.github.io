"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, FileText, Clock } from "lucide-react"

interface SavedAssessment {
  id: number
  name: string
  job_role_name: string
  department_name: string
  completed_skills: number
  total_skills: number
  created_at: string
}

interface LoginButtonProps {
  user: {
    id: number
    name: string
    email: string
    role: string
  }
}

export default function LoginButton({ user }: LoginButtonProps) {
  const [savedAssessments, setSavedAssessments] = useState<SavedAssessment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSavedAssessments()
  }, [])

  const loadSavedAssessments = async () => {
    try {
      const response = await fetch("/api/assessments")
      if (response.ok) {
        const data = await response.json()
        setSavedAssessments(data.assessments?.slice(0, 3) || []) // Show only latest 3
      }
    } catch (error) {
      console.error("Failed to load saved assessments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })
      if (response.ok) {
        window.location.href = "/login"
      }
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const getCompletionPercentage = (completed: number, total: number) => {
    if (total === 0) return 0
    return Math.round((completed / total) * 100)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Recent Assessments Section */}
        <div className="p-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Recent Assessments</h4>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-300 mx-auto"></div>
              <p className="text-xs text-muted-foreground mt-2">Loading...</p>
            </div>
          ) : savedAssessments.length > 0 ? (
            <div className="space-y-2">
              {savedAssessments.map((assessment) => (
                <Card key={assessment.id} className="p-2">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-medium truncate">{assessment.name}</h5>
                      <Badge variant="outline" className="text-xs">
                        {getCompletionPercentage(assessment.completed_skills, assessment.total_skills)}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{assessment.job_role_name}</span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(assessment.created_at)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-blue-600 h-1 rounded-full"
                        style={{
                          width: `${getCompletionPercentage(assessment.completed_skills, assessment.total_skills)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </Card>
              ))}
              <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
                <a href="/assessments">View All Assessments</a>
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground mb-2">No assessments yet</p>
              <Button variant="ghost" size="sm" className="text-xs" asChild>
                <a href="/self-review">Start Assessment</a>
              </Button>
            </div>
          )}
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
