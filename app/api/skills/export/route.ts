import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const jobRoleId = searchParams.get("jobRoleId")
    const format = searchParams.get("format") || "json"

    let query
    if (jobRoleId) {
      query = sql`
        SELECT 
          jr.name as job_role,
          sc.name as category,
          sm.name as skill_name,
          sd.level,
          sd.description,
          sd.full_description,
          sd.sort_order
        FROM skill_demonstrations sd
        JOIN skills_master sm ON sd.skill_id = sm.id
        JOIN skill_categories sc ON sm.category_id = sc.id
        JOIN job_roles jr ON sd.job_role_id = jr.id
        WHERE sd.job_role_id = ${Number.parseInt(jobRoleId)}
        ORDER BY sc.sort_order, sm.name
      `
    } else {
      query = sql`
        SELECT 
          jr.name as job_role,
          sc.name as category,
          sm.name as skill_name,
          sd.level,
          sd.description,
          sd.full_description,
          sd.sort_order
        FROM skill_demonstrations sd
        JOIN skills_master sm ON sd.skill_id = sm.id
        JOIN skill_categories sc ON sm.category_id = sc.id
        JOIN job_roles jr ON sd.job_role_id = jr.id
        ORDER BY jr.name, sc.sort_order, sm.name
      `
    }

    const skills = await query

    if (format === "csv") {
      const csvHeader = "job_role,category,skill_name,level,description,full_description,sort_order\n"
      const csvData = skills
        .map((skill) =>
          [
            `"${skill.job_role}"`,
            `"${skill.category}"`,
            `"${skill.skill_name}"`,
            `"${skill.level}"`,
            `"${skill.description?.replace(/"/g, '""') || ""}"`,
            `"${skill.full_description?.replace(/"/g, '""') || ""}"`,
            skill.sort_order || 0,
          ].join(","),
        )
        .join("\n")

      return new Response(csvHeader + csvData, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="skills-export-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    return NextResponse.json(skills, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="skills-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    })
  } catch (error) {
    console.error("Export skills error:", error)
    return NextResponse.json({ error: "Failed to export skills" }, { status: 500 })
  }
}
