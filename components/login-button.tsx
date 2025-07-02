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

interface RecentAssessment {
  assessment_name: string
  job_role_name: string
  department_name: string
  completion_percentage: number
  created_at: string
}

interface LoginButtonProps {
  user: any | null
}

export default function LoginButton({ user }: LoginButtonProps) {
  const [recentAssessments, setRecentAssessments] = useState<RecentAssessment[]>([])
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
        <div className="px-2 py-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Recent Assessments</span>
            {loading && <div className="w-3 h-3 border border-gray-300 border-t-blue-600 rounded-full animate-spin" />}
          </div>
          {recentAssessments.length > 0 ? (
            <div className="space-y-1">
              {recentAssessments.slice(0, 3).map((assessment, index) => (
                <div key={index} className="p-2 rounded-md hover:bg-gray-50 text-xs">
                  <div className="font-medium truncate">{assessment.assessment_name}</div>
                  <div className="text-muted-foreground truncate">
                    {assessment.job_role_name} • {assessment.department_name}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <Badge variant="outline" className="text-xs">
                      {Math.round(assessment.completion_percentage)}%
                    </Badge>
                    <span className="text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(assessment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              <DropdownMenuItem asChild>
                <Link href="/assessments" className="text-xs text-center w-full">
                  <FileText className="h-3 w-3 mr-2" />
                  View All Assessments
                </Link>
              </DropdownMenuItem>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground text-center py-2">
              No assessments yet
              <br />
              <Link href="/self-review" className="text-blue-600 hover:underline">
                Start your first assessment
              </Link>
            </div>
          )}
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <div className="mr-2 h-4 w-4">Profile Icon</div>
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
