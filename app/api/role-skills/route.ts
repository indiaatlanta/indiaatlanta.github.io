import { sql } from "@vercel/postgres"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const roleId = searchParams.get("roleId")

  if (!roleId) {
    return NextResponse.json({ error: "roleId is required" }, { status: 400 })
  }

  try {
    const query = sql`
      SELECT 
        dt.id,
        dt.skill_master_id,
        sm.name as skill_name,
        dt.level,
        dt.demonstration_description,
        sm.description as skill_description,
        sc.name as category_name,
        sc.color as category_color,
        djr.sort_order
      FROM demonstration_templates dt
      JOIN demonstration_job_roles djr ON dt.id = djr.demonstration_template_id
      JOIN skills_master sm ON dt.skill_master_id = sm.id
      JOIN skill_categories sc ON sm.category_id = sc.id
      WHERE djr.job_role_id = ${Number.parseInt(roleId)}
      ORDER BY sc.sort_order, sm.sort_order, djr.sort_order, sm.name
    `
    const result = await query
    return NextResponse.json({ data: result.rows }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
