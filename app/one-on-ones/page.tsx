import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import OneOnOnesClient from "./one-on-ones-client"

export const dynamic = "force-dynamic"

export default async function OneOnOnesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return <OneOnOnesClient user={user} />
}
