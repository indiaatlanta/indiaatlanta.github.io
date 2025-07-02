import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import AssessmentsClient from "./assessments-client"

export default async function AssessmentsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/images/hs1-logo.png" alt="Henry Schein One" className="h-8" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Saved Assessments</h1>
                <p className="text-gray-600">View and manage your completed skill assessments</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium">{user.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <AssessmentsClient user={user} />
      </div>
    </div>
  )
}
