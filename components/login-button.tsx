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
import { useRouter } from "next/navigation"

interface Assessment {
  id: number
  name: string
  job_role_name: string
  department_name: string
  completion_percentage: number
  created_at: string
}

interface LoginButtonProps {
  user?: {
    id: number
    name: string
    email: string
    role: string
  } | null
}

export default function LoginButton({ user }: LoginButtonProps) {
  const router = useRouter()
  const [recentAssessments, setRecentAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadSavedAssessments()
    }
  }, [user])

  const loadSavedAssessments = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await fetch("/api/assessments")
      if (response.ok) {
        const data = await response.json()
        const assessments = Array.isArray(data.assessments) ? data.assessments : []
        setRecentAssessments(assessments.slice(0, 3))
      }
    } catch (error) {
      console.error("Failed to load assessments:", error)
      setRecentAssessments([])
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
        router.push("/login")
        router.refresh()
      }
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
        <div className="px-2 py-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Recent Assessments</span>
            {loading && <div className="w-3 h-3 border border-gray-300 border-t-blue-600 rounded-full animate-spin" />}
          </div>

          {recentAssessments.length > 0 ? (
            <div className="space-y-2">
              {recentAssessments.map((assessment) => (
                <div key={assessment.id} className="p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{assessment.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {assessment.job_role_name} • {assessment.department_name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={assessment.completion_percentage >= 100 ? "default" : "secondary"}
                          className="text-xs px-1 py-0"
                        >
                          {Math.round(assessment.completion_percentage)}%
                        </Badge>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(assessment.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-2">No assessments yet</p>
          )}

          <Link href="/assessments">
            <Button variant="ghost" size="sm" className="w-full mt-2 text-xs">
              <FileText className="h-3 w-3 mr-2" />
              View All Assessments
            </Button>
          </Link>
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
