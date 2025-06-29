import { neon } from "@neondatabase/serverless"

export const isDatabaseConfigured = () => {
  return !!process.env.DATABASE_URL
}

export const sql = isDatabaseConfigured() ? neon(process.env.DATABASE_URL!) : null

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
