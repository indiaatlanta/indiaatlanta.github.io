import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    if (!sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const department = await sql`
      SELECT 
        d.id,
        d.name,
        d.slug,
        d.description,
        d.color
      FROM departments d
      WHERE d.slug = ${params.slug}
      LIMIT 1
    `

    if (department.length === 0) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 })
    }

    return NextResponse.json({ department: department[0] })
  } catch (error) {
    console.error("Error fetching department:", error)
    return NextResponse.json({ error: "Failed to fetch department" }, { status: 500 })
  }
}
