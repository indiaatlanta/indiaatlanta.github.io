import { Suspense } from "react"
import MainPageClient from "./main-page-client"

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MainPageClient />
    </Suspense>
  )
}
