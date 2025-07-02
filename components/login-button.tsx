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
import { Badge } from "@/components/ui/badge"
import { User, LogOut, Settings, Trash2, Calendar, Target } from "lucide-react"
import Link from "next/link"

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
    name: string
    email: string
    role: string
  } | null
}

export default function LoginButton({ user }: LoginButtonProps) {
  const [savedAssessments, setSavedAssessments] = useState<SavedAssessment[]>([])
  const [loading, setLoading] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    if (user) {
      loadSavedAssessments()
    }
  }, [user])

  const loadSavedAssessments = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/assessments")
      if (response.ok) {
        const data = await response.json()
        setSavedAssessments(data.assessments || [])
        setIsDemoMode(data.isDemoMode || false)
      }
    } catch (error) {
      console.error("Failed to load saved assessments:", error)
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
        // Remove from local state
        setSavedAssessments((prev) => prev.filter((a) => a.id !== assessmentId))
      } else {
        alert("Failed to delete assessment")
      }
    } catch (error) {
      console.error("Failed to delete assessment:", error)
      alert("Failed to delete assessment")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getCompletionPercentage = (completed: number, total: number) => {
    if (total === 0) return 0
    return Math.round((completed / total) * 100)
  }

  if (!user) {
    return (
      <Link href="/login">
        <Button variant="outline" size="sm">
          Sign In
        </Button>
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <User className="w-4 h-4" />
          {user.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex flex-col">
          <span>{user.name}</span>
          <span className="text-xs text-gray-500 font-normal">{user.email}</span>
          {user.role === "admin" && (
            <Badge variant="secondary" className="w-fit mt-1">
              Admin
            </Badge>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Saved Assessments Section */}
        <DropdownMenuLabel className="flex items-center gap-2 text-sm">
          <Target className="w-4 h-4" />
          Saved Assessments
          {isDemoMode && (
            <Badge variant="outline" className="text-xs">
              Demo
            </Badge>
          )}
        </DropdownMenuLabel>

        {loading ? (
          <DropdownMenuItem disabled>
            <span className="text-sm text-gray-500">Loading...</span>
          </DropdownMenuItem>
        ) : savedAssessments.length > 0 ? (
          <>
            {savedAssessments.slice(0, 5).map((assessment) => (
              <DropdownMenuItem key={assessment.id} className="flex-col items-start p-3 space-y-1">
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium text-sm truncate flex-1">{assessment.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteAssessment(assessment.id, assessment.name)
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <div className="text-xs text-gray-500 w-full">
                  {assessment.job_role_name} • {assessment.department_name}
                </div>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {assessment.completed_skills}/{assessment.total_skills} skills
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {getCompletionPercentage(assessment.completed_skills, assessment.total_skills)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {formatDate(assessment.created_at)}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
            {savedAssessments.length > 5 && (
              <DropdownMenuItem className="text-center text-sm text-gray-500">
                +{savedAssessments.length - 5} more assessments
              </DropdownMenuItem>
            )}
          </>
        ) : (
          <DropdownMenuItem disabled>
            <span className="text-sm text-gray-500">No saved assessments</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {user.role === "admin" && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/admin" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Admin Panel
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem asChild>
          <form action="/api/auth/logout" method="POST" className="w-full">
            <button type="submit" className="flex items-center gap-2 w-full">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
