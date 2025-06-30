import { sql, isDatabaseConfigured } from "@/lib/db"

export interface AuditLog {
  id: number
  user_id: number
  action: string
  table_name: string
  record_id?: number
  old_values?: any
  new_values?: any
  created_at: Date
  user_name?: string
  user_email?: string
}

export async function createAuditLog(
  userId: number,
  action: string,
  tableName: string,
  recordId?: number,
  oldValues?: any,
  newValues?: any,
): Promise<void> {
  if (!isDatabaseConfigured()) {
    console.log("Database not configured, skipping audit log")
    return
  }

  try {
    await sql!`
      INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
      VALUES (${userId}, ${action}, ${tableName}, ${recordId || null}, ${JSON.stringify(oldValues) || null}, ${JSON.stringify(newValues) || null})
    `
    console.log(`Audit log created: ${action} on ${tableName}`)
  } catch (error) {
    console.error("Failed to create audit log:", error)
  }
}

export async function getAuditLogs(limit = 100): Promise<AuditLog[]> {
  if (!isDatabaseConfigured()) {
    return []
  }

  try {
    const logs = await sql!`
      SELECT 
        al.*,
        u.name as user_name,
        u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT ${limit}
    `

    return logs.map((log: any) => ({
      id: log.id,
      user_id: log.user_id,
      action: log.action,
      table_name: log.table_name,
      record_id: log.record_id,
      old_values: log.old_values ? JSON.parse(log.old_values) : null,
      new_values: log.new_values ? JSON.parse(log.new_values) : null,
      created_at: log.created_at,
      user_name: log.user_name,
      user_email: log.user_email,
    }))
  } catch (error) {
    console.error("Failed to get audit logs:", error)
    return []
  }
}
