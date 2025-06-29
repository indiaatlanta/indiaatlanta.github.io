import { getCurrentUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Settings, Users, Database } from "lucide-react"
import Link from "next/link"

export default async function AdminButton() {
  const user = await getCurrentUser()

  if (!user || (user.role !== "admin" && user.role !== "manager")) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          {user.role === "admin" ? "Admin" : "Manager"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {user.role === "admin" && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <Database className="h-4 w-4 mr-2" />
                Admin Panel
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/users">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Link>
            </DropdownMenuItem>
          </>
        )}
        {user.role === "manager" && (
          <DropdownMenuItem asChild>
            <Link href="/manager">
              <Users className="h-4 w-4 mr-2" />
              Team Management
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
