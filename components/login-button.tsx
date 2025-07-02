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
import { UserIcon, LogOut, FileText, Calendar, TrendingUp } from "lucide-react"
import Link from "next/link"

interface SavedAssessment {
  id: number
  assessment_name: string
  job_role: string
  department: string
  overall_score: number
  completion_percentage: number
  created_at: string
}

interface LoginButtonUser {
  id: number
  name: string
  email: string
  role: string
}

interface LoginButtonProps {
  user: LoginButtonUser
}

export default function LoginButton({ user }: LoginButtonProps) {
  const [recentAssessments, setRecentAssessments] = useState<SavedAssessment[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadRecentAssessments()
  }, [])

  const loadRecentAssessments = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/assessments")
      if (response.ok) {
        const data = await response.json()
        const assessments = Array.isArray(data.assessments) ? data.assessments.slice(0, 3) : []
        setRecentAssessments(assessments)
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

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      return "Unknown"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:inline">{user.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              {user.role === "admin" && (
                <Badge variant="secondary" className="text-xs mt-1">
                  Admin
                </Badge>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Recent Assessments Section */}
        <div className="px-2 py-2">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Recent Assessments</span>
          </div>
          {loading ? (
            <div className="text-xs text-gray-500 px-2">Loading...</div>
          ) : recentAssessments.length > 0 ? (
            <div className="space-y-2">
              {recentAssessments.map((assessment) => (
                <div key={assessment.id} className="px-2 py-2 rounded-md hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{assessment.assessment_name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {assessment.job_role} • {assessment.department}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Badge variant="outline" className="text-xs">
                        {Math.round(assessment.completion_percentage)}%
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(assessment.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Link href="/assessments">
                <div className="px-2 py-1 text-xs text-blue-600 hover:text-blue-700 cursor-pointer">
                  View all assessments →
                </div>
              </Link>
            </div>
          ) : (
            <div className="px-2 py-2 text-xs text-gray-500">
              No assessments yet.{" "}
              <Link href="/self-review" className="text-blue-600 hover:text-blue-700">
                Start one now →
              </Link>
            </div>
          )}
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/self-review" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            New Assessment
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/assessments" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            My Assessments
          </Link>
        </DropdownMenuItem>

        {user.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Admin Panel
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600">
          <LogOut className="h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
