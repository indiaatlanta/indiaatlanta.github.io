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
import { Settings, Users, BarChart3, Shield } from "lucide-react"
import Link from "next/link"

interface User {
  id: number
  email: string
  name: string
  role: string
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
        const data = await response.json()
        if (data.user && (data.user.role === "admin" || data.user.role === "manager")) {
          setUser(data.user)
        }
      }
    } catch (error) {
      console.error("Error checking session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />
  }

  // Show admin button in demo mode or for admin/manager users
  if (!user && typeof window !== "undefined" && !window.location.pathname.includes("/admin")) {
    return null
  }

  // Show demo admin button if no user but we're in demo mode
  const isDemo = !user
  const displayUser = user || { role: "admin", name: "Demo Admin", email: "admin@demo.com" }

  if (displayUser.role === "admin") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Shield className="w-4 h-4 mr-2" />
            Admin
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1.5 text-sm font-medium">{isDemo ? "Demo Admin" : displayUser.name}</div>
          <div className="px-2 py-1.5 text-xs text-gray-500">{isDemo ? "admin@demo.com" : displayUser.email}</div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/admin" className="flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Admin Panel
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/admin/users" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              User Management
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/admin/analytics" className="flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (displayUser.role === "manager") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Users className="w-4 h-4 mr-2" />
            Manager
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1.5 text-sm font-medium">{displayUser.name}</div>
          <div className="px-2 py-1.5 text-xs text-gray-500">{displayUser.email}</div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/manager/team" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Team Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/manager/reports" className="flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Team Reports
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return null
}
