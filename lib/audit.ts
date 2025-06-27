import { sql } from "./db"
import { headers } from "next/headers"

export interface AuditLogEntry {
  userId: number
  tableName: string
  recordId: number
  action: "CREATE" | "UPDATE" | "DELETE"
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
}

export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  const headersList = headers()
  const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "127.0.0.1"
  const userAgent = headersList.get("user-agent") || ""

  await sql`
    INSERT INTO audit_logs (
      user_id, 
      table_name, 
      record_id, 
      action, 
      old_values, 
      new_values, 
      ip_address, 
      user_agent
    )
    VALUES (
      ${entry.userId},
      ${entry.tableName},
      ${entry.recordId},
      ${entry.action},
      ${entry.oldValues ? JSON.stringify(entry.oldValues) : null},
      ${entry.newValues ? JSON.stringify(entry.newValues) : null},
      ${ipAddress},
      ${userAgent}
    )
  `
}

export async function getAuditLogs(tableName?: string, recordId?: number, limit = 100) {
  let query = sql`
    SELECT 
      al.*,
      u.name as user_name,
      u.email as user_email
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
  `

  if (tableName && recordId) {
    query = sql`
      SELECT 
        al.*,
        u.name as user_name,
        u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.table_name = ${tableName} AND al.record_id = ${recordId}
    `
  } else if (tableName) {
    query = sql`
      SELECT 
        al.*,
        u.name as user_name,
        u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.table_name = ${tableName}
    `
  }

  const result = await query`
    ORDER BY al.created_at DESC
    LIMIT ${limit}
  `

  return result
}
