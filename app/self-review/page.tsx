import Link from "next/link"
import { ArrowLeft, Rocket, Settings } from "lucide-react"
import { getSession } from "@/lib/auth"
import SelfReviewClient from "./self-review-client"
import Image from "next/image"

// Force dynamic rendering since we use cookies and database
export const dynamic = "force-dynamic"

export default async function SelfReviewPage() {
  let session = null
  let isAdmin = false

  try {
    session = await getSession()
    isAdmin = session?.user?.role === "admin"
  } catch (error) {
    console.error("Error getting session:", error)
    // Continue without session
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-brand-800 px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/images/hs1-logo.png" alt="Henry Schein One" width={32} height={32} className="h-8 w-auto" />
              <Rocket className="w-4 h-4 text-white" />
              <span className="text-white text-sm">/ Self Review</span>
            </div>
            {isAdmin && (
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
      <SelfReviewClient />
    </div>
  )
}
