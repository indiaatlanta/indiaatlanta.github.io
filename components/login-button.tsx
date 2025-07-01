"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { LogIn, User, LogOut, Settings, FileText, Calendar, Trash2 } from "lucide-react"
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
import { formatDistanceToNow } from "date-fns"

interface UserInterface {
  id: number
  email: string
  name: string
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
  updated_at: string
}

export function LoginButton() {
  const [user, setUser] = useState<UserInterface | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [hasDemoSession, setHasDemoSession] = useState(false)
  const [savedAssessments, setSavedAssessments] = useState<SavedAssessment[]>([])
  const [isLoadingAssessments, setIsLoadingAssessments] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Check if we're in demo mode first
      const rolesResponse = await fetch("/api/roles")
      const rolesData = await rolesResponse.json()

      if (rolesData.isDemoMode) {
        setIsDemoMode(true)
        // Check for demo session cookie
        const demoSession = document.cookie.includes("demo-session=true")
        setHasDemoSession(demoSession)
        if (demoSession) {
          setUser({ id: 1, email: "demo@henryscheinone.com", name: "Demo User", role: "admin" })
        }
        setIsLoading(false)
        return
      }

      // Check actual session
      const response = await fetch("/api/auth/session")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Auth check error:", error)
      // Assume demo mode on error
      setIsDemoMode(true)
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
      }
    } catch (error) {
      console.error("Error fetching assessments:", error)
    } finally {
      setIsLoadingAssessments(false)
    }
  }

  const handleDeleteAssessment = async (assessmentId: number, event: React.MouseEvent) => {
    event.stopPropagation()

    if (!confirm("Are you sure you want to delete this assessment?")) {
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
      if (isDemoMode) {
        // Clear demo session cookie
        document.cookie = "demo-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        setHasDemoSession(false)
        setUser(null)
      } else {
        await fetch("/api/auth/logout", { method: "POST" })
        setUser(null)
      }
      setSavedAssessments([])
      // Refresh the page to update admin button visibility
      window.location.reload()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const handleDemoLogin = () => {
    // Set demo session cookie and redirect
    document.cookie = "demo-session=true; path=/; max-age=86400" // 24 hours
    window.location.href = "/admin"
  }

  if (isLoading) {
    return <div className="w-20 h-8 bg-brand-700 rounded animate-pulse"></div>
  }

  // In demo mode
  if (isDemoMode) {
    if (hasDemoSession && user) {
      // Show logged in state for demo
      return (
        <div className="flex items-center gap-3">
          <DropdownMenu
            onOpenChange={(open) => {
              if (open) {
                fetchSavedAssessments()
              }
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-white hover:bg-brand-700 flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{user.name}</span>
                <Badge className="bg-brand-100 text-brand-800 px-2 py-0.5 rounded text-xs font-medium">
                  {user.role}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user.name}</span>
                  <span className="text-sm font-normal text-gray-500">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuLabel className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Saved Assessments
              </DropdownMenuLabel>

              {isLoadingAssessments ? (
                <DropdownMenuItem disabled>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    Loading assessments...
                  </div>
                </DropdownMenuItem>
              ) : savedAssessments.length > 0 ? (
                savedAssessments.slice(0, 5).map((assessment) => (
                  <DropdownMenuItem key={assessment.id} className="flex-col items-start p-3">
                    <div className="flex items-start justify-between w-full">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{assessment.assessment_name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {assessment.assessment_data.roleName} ({assessment.assessment_data.roleCode})
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(assessment.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                        onClick={(e) => handleDeleteAssessment(assessment.id, e)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>
                  <div className="text-sm text-gray-500">No saved assessments</div>
                </DropdownMenuItem>
              )}

              {savedAssessments.length > 5 && (
                <DropdownMenuItem>
                  <Link href="/assessments" className="text-sm text-blue-600">
                    View all assessments ({savedAssessments.length})
                  </Link>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    } else {
      // Show demo login button
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDemoLogin}
          className="text-white hover:bg-brand-700 flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Demo Admin
        </Button>
      )
    }
  }

  // If user is logged in, show user info and logout
  if (user) {
    return (
      <div className="flex items-center gap-3">
        <DropdownMenu
          onOpenChange={(open) => {
            if (open) {
              fetchSavedAssessments()
            }
          }}
        >
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-white hover:bg-brand-700 flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{user.name}</span>
              {user.role === "admin" && (
                <Badge className="bg-brand-100 text-brand-800 px-2 py-0.5 rounded text-xs font-medium">Admin</Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user.name}</span>
                <span className="text-sm font-normal text-gray-500">{user.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuLabel className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Saved Assessments
            </DropdownMenuLabel>

            {isLoadingAssessments ? (
              <DropdownMenuItem disabled>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  Loading assessments...
                </div>
              </DropdownMenuItem>
            ) : savedAssessments.length > 0 ? (
              savedAssessments.slice(0, 5).map((assessment) => (
                <DropdownMenuItem key={assessment.id} className="flex-col items-start p-3">
                  <div className="flex items-start justify-between w-full">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{assessment.assessment_name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {assessment.assessment_data.roleName} ({assessment.assessment_data.roleCode})
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(assessment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                      onClick={(e) => handleDeleteAssessment(assessment.id, e)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>
                <div className="text-sm text-gray-500">No saved assessments</div>
              </DropdownMenuItem>
            )}

            {savedAssessments.length > 5 && (
              <DropdownMenuItem>
                <Link href="/assessments" className="text-sm text-blue-600">
                  View all assessments ({savedAssessments.length})
                </Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  // Show login button
  return (
    <Link href="/login">
      <Button variant="ghost" size="sm" className="text-white hover:bg-brand-700">
        <LogIn className="w-4 h-4 mr-2" />
        Login
      </Button>
    </Link>
  )
}
