import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const checkOnly = searchParams.get("checkOnly")

    // If this is just a database connectivity check, don't require auth
    if (checkOnly === "true") {
      const isDemoMode = !isDatabaseConfigured() || !sql
      return NextResponse.json({ isDemoMode })
    }

    // For actual data requests, require admin auth
    await requireAdmin()

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json({
        skills: [],
        isDemoMode: true,
      })
    }

    const skills = await sql`
      SELECT 
        sm.id,
        sm.name,
        sm.category,
        sm.description,
        sm.created_at,
        sm.updated_at
      FROM skills_master sm
      ORDER BY sm.category, sm.name
    `

    return NextResponse.json({
      skills: skills || [],
      isDemoMode: false,
    })
  } catch (error) {
    console.error("Get skills error:", error)
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const { name, category, description } = await request.json()

    if (!name || !category) {
      return NextResponse.json({ error: "Name and category are required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO skills_master (name, category, description)
      VALUES (${name}, ${category}, ${description || ""})
      RETURNING id, name, category, description, created_at, updated_at
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Create skill error:", error)
    return NextResponse.json({ error: "Failed to create skill" }, { status: 500 })
  }
}
