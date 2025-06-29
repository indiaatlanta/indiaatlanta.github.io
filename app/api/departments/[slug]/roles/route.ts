import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const roles = await sql`
      SELECT 
        jr.id,
        jr.title,
        jr.level,
        jr.description,
        jr.full_description,
        d.name as department_name,
        d.slug as department_slug,
        d.color as department_color
      FROM job_roles jr
      JOIN departments d ON jr.department_id = d.id
      WHERE d.slug = ${slug}
      ORDER BY 
        CASE jr.level 
          WHEN 'Junior' THEN 1 
          WHEN 'Mid' THEN 2 
          WHEN 'Senior' THEN 3 
          WHEN 'Lead' THEN 4 
          WHEN 'Principal' THEN 5 
          ELSE 6 
        END,
        jr.title
    `

    return NextResponse.json({ roles })
  } catch (error) {
    console.error("Error fetching roles:", error)
    return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 })
  }
}
