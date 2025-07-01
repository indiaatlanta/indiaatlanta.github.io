import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const jobRoleId = searchParams.get("jobRoleId")
    const format = searchParams.get("format") || "json"

    let query
    if (jobRoleId) {
      query = sql`
        SELECT 
          s.name,
          s.level,
          s.description,
          s.sort_order,
          sc.name as category_name,
          jr.name as job_role_name,
          jr.code as job_role_code,
          d.name as department_name
        FROM skills s
        JOIN skill_categories sc ON s.category_id = sc.id
        JOIN job_roles jr ON s.job_role_id = jr.id
        JOIN departments d ON jr.department_id = d.id
        WHERE s.job_role_id = ${Number.parseInt(jobRoleId)}
        ORDER BY sc.sort_order, s.sort_order, s.name
      `
    } else {
      query = sql`
        SELECT 
          s.name,
          s.level,
          s.description,
          s.sort_order,
          sc.name as category_name,
          jr.name as job_role_name,
          jr.code as job_role_code,
          d.name as department_name
        FROM skills s
        JOIN skill_categories sc ON s.category_id = sc.id
        JOIN job_roles jr ON s.job_role_id = jr.id
        JOIN departments d ON jr.department_id = d.id
        ORDER BY d.name, jr.name, sc.sort_order, s.sort_order, s.name
      `
    }

    const skills = await query

    if (format === "csv") {
      // Convert to CSV
      const headers = [
        "Department",
        "Job Role",
        "Job Code",
        "Category",
        "Skill Name",
        "Level",
        "Description",
        "Sort Order",
      ]
      const csvRows = [
        headers.join(","),
        ...skills.map((skill) =>
          [
            `"${skill.department_name}"`,
            `"${skill.job_role_name}"`,
            `"${skill.job_role_code}"`,
            `"${skill.category_name}"`,
            `"${skill.name}"`,
            `"${skill.level}"`,
            `"${skill.description.replace(/"/g, '""')}"`,
            skill.sort_order,
          ].join(","),
        ),
      ]

      return new NextResponse(csvRows.join("\n"), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="skills-export-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    return NextResponse.json(skills)
  } catch (error) {
    console.error("Export skills error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
