"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Settings, Users, FileText, BarChart3 } from "lucide-react"
import Link from "next/link"

interface User {
  id: number
  email: string
  name: string
  role: string
}

export function AdminButton() {
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
      // In demo mode, show admin button
      setUser({
        id: 1,
        email: "admin@henryscheinone.com",
        name: "Admin User",
        role: "admin",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />
  }

  if (!user || (user.role !== "admin" && user.role !== "manager")) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
          <Settings className="w-4 h-4" />
          {user.role === "admin" ? "Admin" : "Manager"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {user.role === "admin" && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/admin" className="flex items-center gap-2 w-full">
                <Settings className="w-4 h-4" />
                Admin Panel
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/users" className="flex items-center gap-2 w-full">
                <Users className="w-4 h-4" />
                Manage Users
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/reports" className="flex items-center gap-2 w-full">
                <BarChart3 className="w-4 h-4" />
                Reports
              </Link>
            </DropdownMenuItem>
          </>
        )}
        {user.role === "manager" && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/manager/team" className="flex items-center gap-2 w-full">
                <Users className="w-4 h-4" />
                Team Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/manager/reports" className="flex items-center gap-2 w-full">
                <FileText className="w-4 h-4" />
                Team Reports
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
