"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, FileText, Trash2, Calendar, Building } from "lucide-react"
import Link from "next/link"

interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: string
}

interface SavedAssessment {
  id: number
  assessment_name: string
  assessment_data: {
    roleName: string
    roleCode: string
    departmentName: string
    completedAt: string
    ratings: Array<{ skillId: number; rating: string }>
  }
  created_at: string
  role_name: string
  role_code: string
  department_name: string
}

export function LoginButton() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [savedAssessments, setSavedAssessments] = useState<SavedAssessment[]>([])
  const [isLoadingAssessments, setIsLoadingAssessments] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/session")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsDemoMode(data.isDemoMode || false)
      }
    } catch (error) {
      console.error("Error checking session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSavedAssessments = async () => {
    if (!user) return

    setIsLoadingAssessments(true)
    try {
      const response = await fetch("/api/assessments")
      if (response.ok) {
        const data = await response.json()
        setSavedAssessments(data.assessments || [])
        setIsDemoMode(data.isDemoMode || false)
      }
    } catch (error) {
      console.error("Error fetching saved assessments:", error)
    } finally {
      setIsLoadingAssessments(false)
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
        setSavedAssessments((prev) => prev.filter((a) => a.id !== assessmentId))
      } else {
        alert("Failed to delete assessment")
      }
    } catch (error) {
      console.error("Error deleting assessment:", error)
      alert("Failed to delete assessment")
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" })
      if (response.ok) {
        setUser(null)
        setSavedAssessments([])
        window.location.href = "/"
      }
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
  }

  if (!user) {
    return (
      <Link href="/login">
        <Button variant="outline" size="sm">
          <User className="w-4 h-4 mr-2" />
          Login
        </Button>
      </Link>
    )
  }

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open && savedAssessments.length === 0) {
          fetchSavedAssessments()
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
          <User className="w-4 h-4" />
          {user.first_name} {user.last_name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>
          <div>
            <div className="font-medium">
              {user.first_name} {user.last_name}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
            <div className="text-xs text-gray-400 capitalize">{user.role}</div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-sm font-medium text-gray-700">Saved Assessments</DropdownMenuLabel>

        {isLoadingAssessments ? (
          <DropdownMenuItem disabled>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              Loading assessments...
            </div>
          </DropdownMenuItem>
        ) : savedAssessments.length > 0 ? (
          <>
            {savedAssessments.slice(0, 5).map((assessment) => (
              <DropdownMenuItem key={assessment.id} className="p-0">
                <div className="w-full p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{assessment.assessment_name}</div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Building className="w-3 h-3" />
                        <span className="truncate">
                          {assessment.department_name} - {assessment.role_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(assessment.created_at)}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {assessment.assessment_data.ratings?.length || 0} skills rated
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteAssessment(assessment.id, assessment.assessment_name)
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
            {savedAssessments.length > 5 && (
              <DropdownMenuItem>
                <div className="text-sm text-blue-600 font-medium">View all {savedAssessments.length} assessments</div>
              </DropdownMenuItem>
            )}
          </>
        ) : (
          <DropdownMenuItem disabled>
            <div className="text-sm text-gray-500">No saved assessments</div>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/self-review" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            New Assessment
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
