import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function HomePage() {
  console.log("HomePage: Getting current user")
  const user = await getCurrentUser()

  if (!user) {
    console.log("HomePage: No user found, redirecting to login")
    redirect("/login")
  }

  console.log("HomePage: User found, redirecting to dashboard")
  redirect("/dashboard")
}
