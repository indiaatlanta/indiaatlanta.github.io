import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    if (!sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const departments = await sql`
      SELECT id, name, slug, description, color
      FROM departments
      WHERE slug = ${params.slug}
    `

    if (departments.length === 0) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 })
    }

    return NextResponse.json({
      department: departments[0],
      isDemoMode: false,
    })
  } catch (error) {
    console.error("Error fetching department:", error)
    return NextResponse.json({ error: "Failed to fetch department" }, { status: 500 })
  }
}
