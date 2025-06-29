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
import { Settings, Users, Database, FileText } from "lucide-react"
import Link from "next/link"

interface User {
  id: number
  email: string
  name: string
  role: "admin" | "manager" | "user"
  department?: string
}

export default function AdminButton() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/session")

      if (!response.ok) {
        setUser(null)
        return
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        setUser(null)
        return
      }

      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      console.error("Admin session check error:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !user || (user.role !== "admin" && user.role !== "manager")) {
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
      <DropdownMenuContent align="end" className="w-48">
        {user.role === "admin" && (
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
                User Management
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/skills" className="flex items-center">
                <Database className="w-4 h-4 mr-2" />
                Skills Management
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {(user.role === "admin" || user.role === "manager") && (
          <DropdownMenuItem asChild>
            <Link href="/reports" className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Reports
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
