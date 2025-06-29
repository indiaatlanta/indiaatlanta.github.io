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
import { LogOut, FileText, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface UserInterface {
  id: number
  email: string
  name: string
  role: string
}

export default function LoginButton() {
  const [user, setUser] = useState<UserInterface | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/session")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user || null)
      }
    } catch (error) {
      console.error("Error checking session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })
      if (response.ok) {
        setUser(null)
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  if (isLoading) {
    return <div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />
  }

  if (!user) {
    return (
      <Button asChild variant="outline" size="sm">
        <Link href="/login">Login</Link>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
          <LogOut className="w-4 h-4" />
          {user.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-sm text-gray-500">{user.email}</div>
        <div className="px-2 py-1.5 text-xs text-gray-400 capitalize">{user.role}</div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2 w-full">
            <LogOut className="w-4 h-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/self-review" className="flex items-center gap-2 w-full">
            <FileText className="w-4 h-4" />
            Self Assessment
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/compare" className="flex items-center gap-2 w-full">
            <BarChart3 className="w-4 h-4" />
            Compare Roles
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600">
          <LogOut className="w-4 h-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
