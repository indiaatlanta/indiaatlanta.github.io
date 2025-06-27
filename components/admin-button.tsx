import Link from "next/link"
import { Settings } from "lucide-react"
import { getSession } from "@/lib/auth"

export async function AdminButton() {
  const session = await getSession()
  const isAdmin = session?.user?.role === "admin"

  if (!isAdmin) {
    return null
  }

  return (
    <Link
      href="/admin"
      className="bg-amber-100 text-amber-900 px-3 py-1 rounded-md text-sm font-medium hover:bg-amber-200 transition-colors flex items-center gap-2"
    >
      <Settings className="w-4 h-4" />
      Admin Panel
    </Link>
  )
}
