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
import { LogOut, Settings, UserCircle, LogIn } from "lucide-react"

interface User {
  id: number
  email: string
  name: string
  role: "admin" | "manager" | "user"
  department?: string
}

export default function LoginButton() {
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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (loading) {
    return (
      <Button variant="outline" disabled>
        Loading...
      </Button>
    )
  }

  if (!user) {
    return (
      <Button onClick={() => router.push("/login")} className="bg-brand-600 hover:bg-brand-700">
        <LogIn className="w-4 h-4 mr-2" />
        Sign In
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <UserCircle className="w-4 h-4" />
          {user.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            {user.department && <p className="text-xs leading-none text-muted-foreground">{user.department}</p>}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <UserCircle className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        {user.role === "admin" && (
          <DropdownMenuItem onClick={() => router.push("/admin")}>
            <Settings className="mr-2 h-4 w-4" />
            Admin Panel
          </DropdownMenuItem>
        )}
        {user.role === "manager" && (
          <DropdownMenuItem onClick={() => router.push("/team")}>
            <UserCircle className="mr-2 h-4 w-4" />
            Team Dashboard
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
