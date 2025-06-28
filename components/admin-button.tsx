"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Settings } from "lucide-react"

export function AdminButton() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Check for demo session cookie
        const demoSession = document.cookie.includes("demo-session=true")
        if (demoSession) {
          setIsAdmin(true)
          setIsLoading(false)
          return
        }

        // In demo mode (development or no database), always show admin button
        if (process.env.NODE_ENV === "development") {
          setIsAdmin(true)
          setIsLoading(false)
          return
        }

        // Check if database is configured by trying to fetch roles
        try {
          const rolesResponse = await fetch("/api/roles")
          const rolesData = await rolesResponse.json()

          // If we're in demo mode (no database), show admin button
          if (rolesData.isDemoMode) {
            setIsAdmin(true)
            setIsLoading(false)
            return
          }
        } catch (error) {
          // If API fails, assume demo mode
          setIsAdmin(true)
          setIsLoading(false)
          return
        }

        // Try to check session via API call for database mode
        const response = await fetch("/api/auth/session")
        if (response.ok) {
          const data = await response.json()
          setIsAdmin(data.user?.role === "admin")
        } else {
          setIsAdmin(false)
        }
      } catch (error) {
        // On any error, show admin button in development
        console.log("Admin check error:", error)
        setIsAdmin(process.env.NODE_ENV === "development")
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminStatus()
  }, [])

  // Don't render anything while loading
  if (isLoading) {
    return null
  }

  // Don't render if user is not admin
  if (!isAdmin) {
    return null
  }

  return (
    <Link
      href="/admin"
      className="bg-brand-100 text-brand-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-brand-200 transition-colors flex items-center gap-2"
    >
      <Settings className="w-4 h-4" />
      Admin Panel
      {process.env.NODE_ENV === "development" && <span className="text-xs opacity-75">(Demo)</span>}
    </Link>
  )
}
