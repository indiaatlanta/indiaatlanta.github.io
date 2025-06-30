import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import DashboardClient from "./dashboard-client"

export default async function DashboardPage() {
  console.log("DashboardPage: Getting current user")
  const user = await getCurrentUser()

  if (!user) {
    console.log("DashboardPage: No user found, redirecting to login")
    redirect("/login")
  }

  console.log("DashboardPage: User found:", user.email)
  return <DashboardClient user={user} />
}
