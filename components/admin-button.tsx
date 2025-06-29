"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, Users, Database, FileText, BarChart3, Shield } from "lucide-react"

interface User {
  id: number
  email: string
  name: string
  role: string
  department?: string
}

export default function AdminButton() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/session", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Session check error:", error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />
  }

  // Only show for admin and manager users
  if (!user || (user.role !== "admin" && user.role !== "manager")) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <Shield className="h-4 w-4" />
          {user.role === "admin" ? "Admin" : "Manager"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{user.role === "admin" ? "Admin Tools" : "Manager Tools"}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {user.role === "admin" && (
          <>
            <DropdownMenuItem onClick={() => router.push("/admin")}>
              <Settings className="mr-2 h-4 w-4" />
              Admin Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/admin/users")}>
              <Users className="mr-2 h-4 w-4" />
              User Management
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/admin/skills")}>
              <Database className="mr-2 h-4 w-4" />
              Skills Management
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/admin/audit")}>
              <FileText className="mr-2 h-4 w-4" />
              Audit Logs
            </DropdownMenuItem>
          </>
        )}

        {user.role === "manager" && (
          <>
            <DropdownMenuItem onClick={() => router.push("/manager")}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Team Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/manager/reviews")}>
              <FileText className="mr-2 h-4 w-4" />
              Team Reviews
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
