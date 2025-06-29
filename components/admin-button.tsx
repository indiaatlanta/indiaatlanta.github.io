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
import { Settings, Users, Database, BarChart3, Shield } from "lucide-react"

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
  const router = useRouter()

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/session")
      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      console.error("Session check error:", error)
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
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <Shield className="w-4 h-4" />
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
          </>
        )}

        {user.role === "manager" && (
          <>
            <DropdownMenuItem onClick={() => router.push("/team")}>
              <Users className="mr-2 h-4 w-4" />
              Team Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/team/reports")}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Team Reports
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
