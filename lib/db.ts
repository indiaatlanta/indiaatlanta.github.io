import { neon } from "@neondatabase/serverless"

export const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null

export function isDatabaseConfigured(): boolean {
  return !!process.env.DATABASE_URL && !!sql
}

// Test database connection
export async function testDatabaseConnection() {
  if (!isDatabaseConfigured() || !sql) {
    return { connected: false, error: "Database URL not configured" }
  }

  try {
    await sql`SELECT 1`
    return { connected: true }
  } catch (error) {
    console.error("Database connection error:", error)
    return { connected: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
