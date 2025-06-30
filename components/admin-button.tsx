"use client"

import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { useRouter } from "next/navigation"

interface AdminButtonProps {
  userRole?: string
}

export default function AdminButton({ userRole }: AdminButtonProps) {
  const router = useRouter()

  if (userRole !== "admin") {
    return null
  }

  const handleAdminClick = () => {
    router.push("/admin")
  }

  return (
    <Button onClick={handleAdminClick} variant="outline" size="sm">
      <Settings className="h-4 w-4 mr-2" />
      Admin
    </Button>
  )
}
