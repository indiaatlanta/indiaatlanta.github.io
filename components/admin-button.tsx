"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
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

      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      console.error("Error checking session:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return null
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <Button asChild variant="outline" size="sm">
      <Link href="/admin" className="flex items-center">
        <Settings className="w-4 h-4 mr-2" />
        Admin Panel
      </Link>
    </Button>
  )
}
