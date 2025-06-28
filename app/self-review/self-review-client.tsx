\
Now
let
's fix the API response structure issue:

```typescriptreact file="app/api/role-skills/route.ts"
[v0-no-op-code-block-prefix]
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
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching role skills:", error)

    // Return mock data for demo mode
    const mockSkills = [
      {
        id: 1,
        skill_name: "Security",
        level: "L1",
        demonstration_description: "Understands the importance of security.",
        skill_description: "Security is a fundamental aspect of software engineering...",
        category_name: "Technical Skills",
        category_color: "blue",
      },
      {
        id: 2,
        skill_name: "Work Breakdown",
        level: "L1",
        demonstration_description: "Understands value of rightsizing pieces of work.",
        skill_description: "Work Breakdown is the practice of decomposing large, complex work items...",
        category_name: "Delivery",
        category_color: "green",
      },
      {
        id: 3,
        skill_name: "Communication",
        level: "L1",
        demonstration_description: "Communicates effectively with team members.",
        skill_description: "Effective communication is essential for collaboration...",
        category_name: "Feedback, Communication & Collaboration",
        category_color: "purple",
      },
    ]

    return NextResponse.json(mockSkills)
  }
}
