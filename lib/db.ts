import { neon } from "@neondatabase/serverless"

export const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null

export function isDatabaseConfigured(): boolean {
  return !!process.env.DATABASE_URL && !!sql
}

export async function testDatabaseConnection(): Promise<boolean> {
  if (!isDatabaseConfigured()) {
    return false
  }

  try {
    await sql!`SELECT 1`
    return true
  } catch (error) {
    console.error("Database connection test failed:", error)
    return false
  }
}
