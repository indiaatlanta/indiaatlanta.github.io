import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function GET(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const jobRoleId = searchParams.get("jobRoleId")
    const format = searchParams.get("format") || "json"

    let query
    if (jobRoleId) {
      query = sql!`
        SELECT 
          sm.name as skill_name,
          sd.level,
          sd.description as demonstration_description,
          sm.description as skill_description,
          sc.name as category_name,
          sc.id as category_id,
          jr.name as job_role_name,
          sd.sort_order
        FROM skill_demonstrations sd
        JOIN skills_master sm ON sd.skill_id = sm.id
        JOIN skill_categories sc ON sm.category_id = sc.id
        JOIN job_roles jr ON sd.job_role_id = jr.id
        WHERE sd.job_role_id = ${Number.parseInt(jobRoleId)}
        ORDER BY sc.sort_order, sm.sort_order, sd.sort_order
      `
    } else {
      query = sql!`
        SELECT 
          sm.name as skill_name,
          sd.level,
          sd.description as demonstration_description,
          sm.description as skill_description,
          sc.name as category_name,
          sc.id as category_id,
          jr.name as job_role_name,
          sd.sort_order
        FROM skill_demonstrations sd
        JOIN skills_master sm ON sd.skill_id = sm.id
        JOIN skill_categories sc ON sm.category_id = sc.id
        JOIN job_roles jr ON sd.job_role_id = jr.id
        ORDER BY jr.name, sc.sort_order, sm.sort_order, sd.sort_order
      `
    }

    const skills = await query

    if (format === "csv") {
      const headers = [
        "skill_name",
        "level",
        "demonstration_description",
        "skill_description",
        "category_name",
        "job_role_name",
        "sort_order",
      ]

      const csvContent = [
        headers.join(","),
        ...skills.map((skill) =>
          headers.map((header) => `"${String(skill[header] || "").replace(/"/g, '""')}"`).join(","),
        ),
      ].join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="skills-export-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    // Default to JSON
    return NextResponse.json(skills, {
      headers: {
        "Content-Disposition": `attachment; filename="skills-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Failed to export skills" }, { status: 500 })
  }
}
