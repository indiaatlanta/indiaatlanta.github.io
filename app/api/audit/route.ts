import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getAuditLogs } from "@/lib/audit"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    const logs = await getAuditLogs(limit)
    return NextResponse.json(logs)
  } catch (error) {
    console.error("Audit logs API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
