import { neon } from "@neondatabase/serverless"

export const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not configured - database features will be disabled")
}

export async function withTransaction<T>(
  callback: (sql: NonNullable<typeof import("./db").sql>) => Promise<T>,
): Promise<T> {
  if (!sql) {
    throw new Error("Database not configured")
  }
  // Note: Neon doesn't support explicit transactions in the same way as traditional PostgreSQL
  // For production, you might want to use a different approach or library that supports transactions
  return callback(sql)
}

export function isDatabaseConfigured(): boolean {
  return !!process.env.DATABASE_URL && !!sql
}
