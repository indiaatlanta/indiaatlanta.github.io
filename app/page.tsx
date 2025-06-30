import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import MainPageClient from "./main-page-client"

export default async function HomePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return <MainPageClient user={user} />
}
