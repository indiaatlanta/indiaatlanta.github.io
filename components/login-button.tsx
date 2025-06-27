import Link from "next/link"
import { LogIn, User } from "lucide-react"
import { getSession } from "@/lib/auth"
import { Button } from "@/components/ui/button"

export async function LoginButton() {
  const session = await getSession()

  if (session) {
    return (
      <div className="flex items-center gap-2 text-white text-sm">
        <User className="w-4 h-4" />
        <span>{session.user.name}</span>
      </div>
    )
  }

  return (
    <Link href="/login">
      <Button variant="ghost" size="sm" className="text-white hover:bg-amber-800">
        <LogIn className="w-4 h-4 mr-2" />
        Login
      </Button>
    </Link>
  )
}
