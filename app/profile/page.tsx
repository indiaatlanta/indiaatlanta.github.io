import Link from "next/link"
import { ArrowLeft, User, Settings } from "lucide-react"
import { getSession } from "@/lib/auth"
import { ProfileClient } from "./profile-client"
import Image from "next/image"
import { redirect } from "next/navigation"

// Force dynamic rendering since we use cookies and database
export const dynamic = "force-dynamic"

export default async function ProfilePage() {
  let session = null

  try {
    session = await getSession()
    if (!session) {
      redirect("/login")
    }
  } catch (error) {
    console.error("Error getting session:", error)
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-brand-800 px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/images/hs1-logo.png" alt="Henry Schein One" width={32} height={32} className="h-8 w-auto" />
              <User className="w-4 h-4 text-white" />
              <span className="text-white text-sm">/ Profile</span>
            </div>
            {session.user.role === "admin" && (
              <Link
                href="/admin"
                className="ml-auto bg-brand-100 text-brand-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-brand-200 transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-6 py-3">
            <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Pass data to client component */}
      <ProfileClient user={session.user} />
    </div>
  )
}
