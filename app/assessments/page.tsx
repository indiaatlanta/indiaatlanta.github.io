import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import AssessmentsClient from "./assessments-client"

export default async function AssessmentsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return <AssessmentsClient />
}
