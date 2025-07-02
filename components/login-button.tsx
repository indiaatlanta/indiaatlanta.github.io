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
import { LogOut, FileText, Clock, ChevronDown } from "lucide-react"
import Link from "next/link"

interface Assessment {
  id: number
  assessment_name: string
  job_role: string
  department: string
  overall_score: number
  completion_percentage: number
  created_at: string
}

interface LoginButtonProps {
  user: any | null
}

export default function LoginButton({ user }: LoginButtonProps) {
  const [recentAssessments, setRecentAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadRecentAssessments()
    }
  }, [user])

  const loadRecentAssessments = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/assessments?limit=3")
      if (response.ok) {
        const data = await response.json()
        setRecentAssessments(Array.isArray(data.assessments) ? data.assessments : [])
      }
    } catch (error) {
      console.error("Failed to load recent assessments:", error)
      setRecentAssessments([])
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout failed:", error)
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
        <Button variant="ghost" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:inline">{user.name}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            {user.role === "admin" && (
              <Badge variant="secondary" className="w-fit text-xs">
                Administrator
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Recent Assessments Section */}
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Recent Assessments</DropdownMenuLabel>
        {loading ? (
          <DropdownMenuItem disabled>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              Loading...
            </div>
          </DropdownMenuItem>
        ) : recentAssessments.length > 0 ? (
          recentAssessments.map((assessment) => (
            <DropdownMenuItem key={assessment.id} asChild>
              <Link href="/assessments" className="flex flex-col items-start gap-1 p-2">
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-medium truncate">{assessment.assessment_name}</span>
                  <Badge
                    variant={assessment.completion_percentage >= 100 ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {Math.round(assessment.completion_percentage)}%
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {assessment.job_role} • {assessment.department}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(assessment.created_at).toLocaleDateString()}
                </div>
              </Link>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              No assessments yet
            </div>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/assessments" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            View All Assessments
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600">
          <LogOut className="h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
