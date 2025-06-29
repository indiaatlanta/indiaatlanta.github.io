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
import { ChevronDown } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface UserData {
  id: number
  email: string
  role: string
  name: string
}

export default function LoginButton() {
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

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
      <Button asChild variant="default" size="sm">
        <Link href="/login">Login</Link>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <div className="w-4 h-4 mr-2" /> {/* Placeholder for User icon */}
          {user.name || user.email}
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center">
            <div className="w-4 h-4 mr-2" /> {/* Placeholder for User icon */}
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/self-review" className="flex items-center">
            <div className="w-4 h-4 mr-2" /> {/* Placeholder for FileText icon */}
            Self Assessment
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/compare" className="flex items-center">
            <div className="w-4 h-4 mr-2" /> {/* Placeholder for BarChart3 icon */}
            Compare Roles
          </Link>
        </DropdownMenuItem>

        {user.role === "manager" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/manager/dashboard" className="flex items-center">
                <div className="w-4 h-4 mr-2" /> {/* Placeholder for BarChart3 icon */}
                Team Dashboard
              </Link>
            </DropdownMenuItem>
          </>
        )}

        {user.role === "admin" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin" className="flex items-center">
                <div className="w-4 h-4 mr-2" /> {/* Placeholder for Settings icon */}
                Admin Panel
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="flex items-center text-red-600">
          <div className="w-4 h-4 mr-2" /> {/* Placeholder for LogOut icon */}
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
