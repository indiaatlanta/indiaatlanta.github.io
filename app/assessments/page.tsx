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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Saved Assessments</h1>
          <p className="text-gray-600 mt-2">
            View and manage your completed skill assessments and track your progress over time.
          </p>
        </div>
        <AssessmentsClient user={user} />
      </div>
    </div>
  )
}
