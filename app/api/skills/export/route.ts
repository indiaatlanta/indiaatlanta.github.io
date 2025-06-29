import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "csv"
    const departmentSlug = searchParams.get("departmentSlug")

    if (!sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    // Get skills matrix data
    const skillsData = await sql`
      SELECT DISTINCT
        sm.id as skill_id,
        sm.name as skill_name,
        sc.name as category_name,
        sc.color as category_color,
        dt.level,
        dt.demonstration_description,
        jr.id as role_id,
        jr.title as role_title,
        jr.code as role_code
      FROM skills_master sm
      JOIN skill_categories sc ON sm.category_id = sc.id
      JOIN demonstration_templates dt ON sm.id = dt.skill_id
      JOIN demonstration_job_roles djr ON dt.id = djr.demonstration_template_id
      JOIN job_roles jr ON djr.job_role_id = jr.id
      JOIN departments d ON jr.department_id = d.id
      WHERE d.slug = ${departmentSlug}
      ORDER BY sc.sort_order, sm.sort_order, jr.level
    `

    if (format === "csv") {
      // Generate CSV
      const roles = [
        ...new Set(skillsData.map((row: any) => ({ id: row.role_id, title: row.role_title, code: row.role_code }))),
      ]
      const skills = [...new Set(skillsData.map((row: any) => row.skill_name))]

      const headers = ["Skill", "Category", ...roles.map((role) => role.title)]
      const csvRows = [headers.join(",")]

      skills.forEach((skillName) => {
        const skillRow = skillsData.find((row: any) => row.skill_name === skillName)
        const row = [
          `"${skillName}"`,
          `"${skillRow?.category_name || ""}"`,
          ...roles.map((role) => {
            const skillForRole = skillsData.find((row: any) => row.skill_name === skillName && row.role_id === role.id)
            return skillForRole ? `"${skillForRole.level}"` : '""'
          }),
        ]
        csvRows.push(row.join(","))
      })

      const csvContent = csvRows.join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${departmentSlug}-skills-matrix.csv"`,
        },
      })
    }

    return NextResponse.json({ error: "Unsupported format" }, { status: 400 })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
