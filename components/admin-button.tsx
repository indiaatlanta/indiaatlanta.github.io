import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import Link from "next/link"

interface AdminButtonProps {
  user?: {
    id: number
    name: string
    email: string
    role: string
  } | null
}

export default function AdminButton({ user }: AdminButtonProps) {
  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <Button asChild variant="outline" size="sm">
      <Link href="/admin">
        <Settings className="h-4 w-4 mr-2" />
        Admin Panel
      </Link>
    </Button>
  )
}
