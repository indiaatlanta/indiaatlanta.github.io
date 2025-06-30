import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import MainPageClient from "./main-page-client"

export default async function HomePage() {
  console.log("HomePage: Getting current user")
  const user = await getCurrentUser()

  if (!user) {
    console.log("HomePage: No user found, redirecting to login")
    redirect("/login")
  }

  console.log("HomePage: User found:", user.email)
  return <MainPageClient user={user} />
}
