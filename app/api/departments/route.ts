import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    if (!sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const departments = await sql`
      SELECT 
        d.id,
        d.name,
        d.slug,
        d.description,
        d.color,
        COUNT(jr.id) as role_count
      FROM departments d
      LEFT JOIN job_roles jr ON d.id = jr.department_id
      GROUP BY d.id, d.name, d.slug, d.description, d.color, d.sort_order
      ORDER BY d.sort_order, d.name
    `

    return NextResponse.json({
      departments,
      isDemoMode: false,
    })
  } catch (error) {
    console.error("Error fetching departments:", error)
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 })
  }
}
