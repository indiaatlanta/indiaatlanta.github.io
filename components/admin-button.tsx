"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Settings, Users, BarChart3 } from "lucide-react"
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
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error("Session check failed:", error)
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
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          {user.role === "admin" ? "Admin" : "Manager"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {user.role === "admin" && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/admin" className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Admin Panel
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                User Management
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Reports
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
