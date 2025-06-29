"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, Users, BarChart3, FileText, ChevronDown } from "lucide-react"
import Link from "next/link"

interface User {
  id: number
  email: string
  role: string
  name: string
}

export default function AdminButton() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/session")
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error("Error checking session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Show for admin and manager roles, or in demo mode
  const shouldShow = user?.role === "admin" || user?.role === "manager" || !user

  if (isLoading) {
    return <div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />
  }

  if (!shouldShow) {
    return null
  }

  const isAdmin = user?.role === "admin"
  const isManager = user?.role === "manager"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          {isAdmin ? "Admin" : isManager ? "Manager" : "Admin"}
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {(isAdmin || !user) && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/admin" className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Admin Panel
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/users" className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {(isManager || isAdmin || !user) && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/manager/dashboard" className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Team Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/manager/reports" className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Team Reports
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
