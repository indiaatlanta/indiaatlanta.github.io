"use client"

import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import Link from "next/link"

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface AdminButtonProps {
  user: User
}

export default function AdminButton({ user }: AdminButtonProps) {
  // Only show admin button for admin users
  if (user.role !== "admin") {
    return null
  }

  return (
    <Button asChild variant="outline" size="sm">
      <Link href="/admin" className="flex items-center gap-2">
        <Settings className="h-4 w-4" />
        Admin Panel
      </Link>
    </Button>
  )
}
