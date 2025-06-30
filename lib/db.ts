import { neon } from "@neondatabase/serverless"

export let sql: ReturnType<typeof neon> | null = null

export function isDatabaseConfigured(): boolean {
  return !!process.env.DATABASE_URL
}

// Initialize database connection if URL is provided
if (process.env.DATABASE_URL) {
  try {
    sql = neon(process.env.DATABASE_URL)
    console.log("Database connection initialized")
  } catch (error) {
    console.error("Failed to initialize database connection:", error)
    sql = null
  }
} else {
  console.log("No DATABASE_URL provided, running in demo mode")
}
