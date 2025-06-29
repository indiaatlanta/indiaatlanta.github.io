import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { getAuditLogs } from "@/lib/audit"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const tableName = searchParams.get("tableName") || undefined
    const recordId = searchParams.get("recordId") ? Number.parseInt(searchParams.get("recordId")!) : undefined
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 100

    const auditLogs = await getAuditLogs(tableName, recordId, limit)

    return NextResponse.json(auditLogs)
  } catch (error) {
    console.error("Get audit logs error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
