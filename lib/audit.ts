import { sql } from "./db"

export interface AuditLogEntry {
  id?: number
  user_id?: number
  action: string
  table_name: string
  record_id?: number
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  created_at?: Date
}

export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  if (!sql) return

  try {
    await sql`
      INSERT INTO audit_log (user_id, action, table_name, record_id, old_values, new_values)
      VALUES (
        ${entry.user_id || null},
        ${entry.action},
        ${entry.table_name},
        ${entry.record_id || null},
        ${entry.old_values ? JSON.stringify(entry.old_values) : null},
        ${entry.new_values ? JSON.stringify(entry.new_values) : null}
      )
    `
  } catch (error) {
    console.error("Failed to log audit event:", error)
  }
}

export async function getAuditLog(
  limit = 100,
  offset = 0,
  table_name?: string,
  user_id?: number,
): Promise<AuditLogEntry[]> {
  if (!sql) return []

  try {
    let query = sql`
      SELECT 
        al.*,
        u.email as user_email,
        u.first_name,
        u.last_name
      FROM audit_log al
      LEFT JOIN users u ON al.user_id = u.id
    `

    const conditions = []
    if (table_name) conditions.push(sql`al.table_name = ${table_name}`)
    if (user_id) conditions.push(sql`al.user_id = ${user_id}`)

    if (conditions.length > 0) {
      query = sql`${query} WHERE ${sql.join(conditions, sql` AND `)}`
    }

    query = sql`${query} ORDER BY al.created_at DESC LIMIT ${limit} OFFSET ${offset}`

    const results = await query
    return results
  } catch (error) {
    console.error("Failed to get audit log:", error)
    return []
  }
}
