import { getCurrentUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, Settings } from "lucide-react"
import Link from "next/link"

async function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="POST">
      <button type="submit" className="flex w-full items-center px-2 py-1.5 text-sm">
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </button>
    </form>
  )
}

export default async function LoginButton() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <Link href="/login">
        <Button variant="outline" size="sm">
          Login
        </Button>
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <User className="h-4 w-4 mr-2" />
          {user.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <Settings className="h-4 w-4 mr-2" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <LogoutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
