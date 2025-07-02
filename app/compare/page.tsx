import { CompareClient } from "./compare-client"

// Force dynamic rendering since we use cookies and database
export const dynamic = "force-dynamic"

async function getAllRoles() {
  // This will be called from an API route instead
  return []
}

export default function ComparePage() {
  return <CompareClient />
}
