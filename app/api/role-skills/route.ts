import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    if (!sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const roleId = searchParams.get("roleId")
    const department = searchParams.get("department")

    if (roleId) {
      // Get skills for a specific role
      const skills = await sql`
        SELECT 
          sm.id,
          sm.name as skill_name,
          dt.level,
          dt.demonstration_description,
          sm.description as skill_description,
          sc.name as category_name,
          sc.color as category_color,
          sm.sort_order as skill_sort_order,
          sc.sort_order as category_sort_order,
          ${roleId}::integer as job_role_id
        FROM demonstration_job_roles djr
        JOIN demonstration_templates dt ON djr.demonstration_template_id = dt.id
        JOIN skills_master sm ON dt.skill_id = sm.id
        JOIN skill_categories sc ON sm.category_id = sc.id
        WHERE djr.job_role_id = ${roleId}
        ORDER BY sc.sort_order, sm.sort_order, sm.name
      `

      return NextResponse.json(skills)
    } else if (department) {
      // Get all skills for a department
      const skills = await sql`
        SELECT DISTINCT
          sm.id,
          sm.name as skill_name,
          dt.level,
          dt.demonstration_description,
          sm.description as skill_description,
          sc.name as category_name,
          sc.color as category_color,
          sm.sort_order as skill_sort_order,
          sc.sort_order as category_sort_order,
          djr.job_role_id
        FROM demonstration_job_roles djr
        JOIN demonstration_templates dt ON djr.demonstration_template_id = dt.id
        JOIN skills_master sm ON dt.skill_id = sm.id
        JOIN skill_categories sc ON sm.category_id = sc.id
        JOIN job_roles jr ON djr.job_role_id = jr.id
        JOIN departments d ON jr.department_id = d.id
        WHERE d.slug = ${department}
        ORDER BY sc.sort_order, sm.sort_order, sm.name
      `

      return NextResponse.json({
        skills,
        isDemoMode: false,
      })
    } else {
      return NextResponse.json({ error: "roleId or department parameter required" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error fetching skills:", error)
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 })
  }
}
