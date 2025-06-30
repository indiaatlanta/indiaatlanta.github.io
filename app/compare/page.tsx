import { Suspense } from "react"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import CompareClient from "./compare-client"

export default async function ComparePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Compare Skills</h1>
        <p className="text-gray-600 mt-2">Compare your skills against job role requirements</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <CompareClient user={user} />
      </Suspense>
    </div>
  )
}
