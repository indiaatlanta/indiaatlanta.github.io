"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, FileText } from "lucide-react"

interface User {
  id: number
  email: string
  name: string
  role: "admin" | "manager" | "user"
  department?: string
}

export default function LoginButton() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Check if we're in demo mode
      const rolesResponse = await fetch("/api/roles")
      const rolesData = await rolesResponse.json()
      setIsDemoMode(rolesData.isDemoMode)

      // Check authentication status
      const response = await fetch("/api/auth/session")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Auth check error:", error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      // Clear demo session cookie if it exists
      document.cookie = "demo-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      setUser(null)
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "manager":
        return "bg-blue-100 text-blue-800"
      case "user":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return <div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />
  }

  if (!user) {
    if (isDemoMode) {
      return (
        <Button asChild variant="outline">
          <Link href="/login">Demo Login</Link>
        </Button>
      )
    }
    return (
      <Button asChild>
        <Link href="/login">Login</Link>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">{user.name}</span>
          <Badge className={`text-xs ${getRoleBadgeColor(user.role)}`}>{user.role}</Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
          {user.department && <p className="text-xs text-gray-500">{user.department}</p>}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        {user.role === "manager" && (
          <DropdownMenuItem asChild>
            <Link href="/team" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Team Dashboard
            </Link>
          </DropdownMenuItem>
        )}
        {user.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Admin Panel
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600">
          <LogOut className="w-4 h-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
