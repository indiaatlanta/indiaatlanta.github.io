import { neon } from "@neondatabase/serverless"

// Make database connection optional for preview environments
let sql: ReturnType<typeof neon> | null = null

if (process.env.DATABASE_URL) {
  sql = neon(process.env.DATABASE_URL)
} else {
  console.warn("DATABASE_URL not configured - database features will be disabled")
}

export { sql }

// Database helper functions
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
  return !!sql
}
