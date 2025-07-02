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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, Settings, FileText, Loader2 } from "lucide-react"
import Link from "next/link"

interface User {
  id: string
  name: string
  email: string
  role: string
}

export function LoginButton() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [recentAssessments, setRecentAssessments] = useState<any[]>([])

  useEffect(() => {
    checkSession()
    if (user) {
      loadRecentAssessments()
    }
  }, [user])

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/session")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Session check failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadRecentAssessments = async () => {
    try {
      const response = await fetch("/api/assessments?limit=3")
      if (response.ok) {
        const data = await response.json()
        setRecentAssessments(data.assessments || [])
      }
    } catch (error) {
      console.error("Failed to load recent assessments:", error)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (response.ok) {
        setUser(null)
        setRecentAssessments([])
        // Force a hard redirect to ensure session is cleared
        window.location.href = "/login"
      }
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  if (isLoading) {
    return (
      <Button variant="ghost" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    )
  }

  if (!user) {
    return (
      <Link href="/login">
        <Button variant="default">
          <LogOut className="mr-2 h-4 w-4" />
          Sign In
        </Button>
      </Link>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            <p className="text-xs leading-none text-muted-foreground capitalize">Role: {user.role}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {recentAssessments.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
              Recent Assessments
            </DropdownMenuLabel>
            {recentAssessments.map((assessment) => (
              <DropdownMenuItem key={assessment.id} className="flex flex-col items-start space-y-1 p-3">
                <div className="flex items-center space-x-2">
                  <FileText className="h-3 w-3" />
                  <span className="text-xs font-medium">{assessment.assessment_name}</span>
                </div>
                <div className="text-xs text-muted-foreground ml-5">
                  {assessment.job_role_name} • {new Date(assessment.created_at).toLocaleDateString()}
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}

        <Link href="/assessments">
          <DropdownMenuItem>
            <FileText className="mr-2 h-4 w-4" />
            <span>My Assessments</span>
          </DropdownMenuItem>
        </Link>

        <Link href="/self-review">
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Self Review</span>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
