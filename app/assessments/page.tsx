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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Assessments</h1>
          <p className="text-gray-600">
            View and manage your completed skill assessments and track your progress over time.
          </p>
        </div>
        <AssessmentsClient />
      </div>
    </div>
  )
}
