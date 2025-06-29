import { NextResponse } from "next/server"
import { getAuditLog } from "@/lib/audit"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const table_name = searchParams.get("table_name") || undefined
    const user_id = searchParams.get("user_id") ? Number.parseInt(searchParams.get("user_id")!) : undefined

    const auditLog = await getAuditLog(limit, offset, table_name, user_id)

    return NextResponse.json({
      audit_log: auditLog,
      pagination: {
        limit,
        offset,
        has_more: auditLog.length === limit,
      },
    })
  } catch (error) {
    console.error("Get audit log error:", error)
    return NextResponse.json({ error: "Failed to get audit log" }, { status: 500 })
  }
}
