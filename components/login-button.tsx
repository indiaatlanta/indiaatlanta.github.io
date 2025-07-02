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
import { User, LogOut, FileText, Clock, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface LoginButtonProps {
  user?: {
    id: number
    name: string
    email: string
    role: string
  } | null
}

interface Assessment {
  assessment_name: string
  job_role: string
  department: string
  completion_percentage: number
  created_at: string
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
    try {
      setLoading(true)
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
      router.push("/login")
      router.refresh()
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
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            <Badge variant="secondary" className="w-fit text-xs">
              {user.role}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Recent Assessments Section */}
        <div className="px-2 py-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Recent Assessments</span>
            {loading && <Loader2 className="h-3 w-3 animate-spin" />}
          </div>

          {recentAssessments.length > 0 ? (
            <div className="space-y-2">
              {recentAssessments.map((assessment, index) => (
                <div key={index} className="p-2 rounded-md bg-muted/50 text-xs">
                  <div className="font-medium truncate">{assessment.assessment_name}</div>
                  <div className="text-muted-foreground truncate">
                    {assessment.job_role} • {assessment.department}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <Badge variant="outline" className="text-xs">
                      {Math.round(assessment.completion_percentage)}% Complete
                    </Badge>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(assessment.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              <DropdownMenuItem asChild>
                <Link href="/assessments" className="text-xs">
                  <FileText className="h-3 w-3 mr-2" />
                  View All Assessments
                </Link>
              </DropdownMenuItem>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground py-2">No recent assessments</div>
          )}
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/self-review">
            <User className="h-4 w-4 mr-2" />
            Profile & Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
