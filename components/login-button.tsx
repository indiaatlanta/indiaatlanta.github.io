"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { LogIn, User, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UserInterface {
  id: number
  email: string
  name: string
  role: string
}

export function LoginButton() {
  const [user, setUser] = useState<UserInterface | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [hasDemoSession, setHasDemoSession] = useState(false)

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

  const handleLogout = async () => {
    try {
      if (isDemoMode) {
        // Clear demo session cookie
        document.cookie = "demo-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        setHasDemoSession(false)
      } else {
        await fetch("/api/auth/logout", { method: "POST" })
        setUser(null)
      }
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
    if (hasDemoSession) {
      // Show logged in state for demo
      return (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-white text-sm">
            <User className="w-4 h-4" />
            <span>Demo Admin</span>
            <span className="bg-brand-100 text-brand-800 px-2 py-0.5 rounded text-xs font-medium">Admin</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-brand-700 h-8">
            <LogOut className="w-4 h-4" />
          </Button>
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
        <div className="flex items-center gap-2 text-white text-sm">
          <User className="w-4 h-4" />
          <span>{user.name}</span>
          {user.role === "admin" && (
            <span className="bg-brand-100 text-brand-800 px-2 py-0.5 rounded text-xs font-medium">Admin</span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-brand-700 h-8">
          <LogOut className="w-4 h-4" />
        </Button>
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
