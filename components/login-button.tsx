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
import { User, LogOut, FileText, Clock } from "lucide-react"
import Link from "next/link"

interface LoginButtonProps {
  user?: {
    id: number
    name: string
    email: string
    role: string
  } | null
}

interface SavedAssessment {
  id: number
  assessment_name: string
  job_role: string
  department: string
  created_at: string
  completion_percentage: number
}

export default function LoginButton({ user }: LoginButtonProps) {
  const [recentAssessments, setRecentAssessments] = useState<SavedAssessment[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadSavedAssessments()
    }
  }, [user])

  const loadSavedAssessments = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/assessments")
      if (response.ok) {
        const data = await response.json()
        // Get the 3 most recent assessments
        const recent = Array.isArray(data.assessments) ? data.assessments.slice(0, 3) : []
        setRecentAssessments(recent)
      }
    } catch (error) {
      console.error("Failed to load assessments:", error)
      setRecentAssessments([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout failed:", error)
      // Force redirect even if logout fails
      window.location.href = "/login"
    }
  }

  if (!user) {
    return (
      <Button asChild>
        <Link href="/login">Sign In</Link>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <User className="h-4 w-4" />
          {user.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {user.role === "admin" && <p className="text-xs text-blue-600 font-medium">Administrator</p>}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Recent Assessments Section */}
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Recent Assessments</DropdownMenuLabel>
        {isLoading ? (
          <DropdownMenuItem disabled>
            <Clock className="h-4 w-4 mr-2" />
            Loading...
          </DropdownMenuItem>
        ) : recentAssessments.length > 0 ? (
          <>
            {recentAssessments.map((assessment) => (
              <DropdownMenuItem key={assessment.id} asChild>
                <Link href={`/assessments`} className="flex flex-col items-start gap-1 py-2">
                  <div className="flex items-center gap-2 w-full">
                    <FileText className="h-3 w-3" />
                    <span className="text-sm font-medium truncate">{assessment.assessment_name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground ml-5">
                    {assessment.job_role} • {assessment.department}
                  </div>
                  <div className="text-xs text-muted-foreground ml-5">
                    {Math.round(assessment.completion_percentage)}% complete
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem asChild>
              <Link href="/assessments" className="text-sm text-blue-600">
                View all assessments →
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem disabled>
            <FileText className="h-4 w-4 mr-2" />
            No assessments yet
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
