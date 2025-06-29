import { getCurrentUser } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"

async function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="POST">
      <Button type="submit" variant="outline" size="sm">
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </form>
  )
}

export default async function LoginButton() {
  const user = await getCurrentUser()

  if (user) {
    return (
      <div className="flex items-center space-x-3">
        <Link href="/profile">
          <Button variant="ghost" size="sm">
            <User className="h-4 w-4 mr-2" />
            {user.name}
          </Button>
        </Link>
        <LogoutButton />
      </div>
    )
  }

  return (
    <Link href="/login">
      <Button size="sm">
        <User className="h-4 w-4 mr-2" />
        Login
      </Button>
    </Link>
  )
}
