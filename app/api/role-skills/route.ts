import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roleId = searchParams.get("roleId")

    if (!roleId) {
      return NextResponse.json({ error: "Role ID is required" }, { status: 400 })
    }

    if (!isDatabaseConfigured() || !sql) {
      // Return mock skills for demo mode
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

      // Return different levels based on role ID for demo
      return NextResponse.json(
        mockSkills.map((skill) => ({
          ...skill,
          level: roleId === "1" ? "L1" : roleId === "2" ? "L2" : "L3",
          demonstration_description:
            roleId === "1"
              ? skill.demonstration_description
              : roleId === "2"
                ? skill.demonstration_description.replace("Understands", "Implements")
                : skill.demonstration_description.replace("Understands", "Designs and leads"),
        })),
      )
    }

    try {
      // Use the new skill demonstrations structure
      const skills = await sql`
        SELECT 
          sd.id,
          sm.name as skill_name,
          sd.level,
          sd.demonstration_description,
          sm.description as skill_description,
          sc.name as category_name,
          sc.color as category_color,
          sd.sort_order
        FROM skill_demonstrations sd
        JOIN skills_master sm ON sd.skill_master_id = sm.id
        JOIN skill_categories sc ON sm.category_id = sc.id
        WHERE sd.job_role_id = ${Number.parseInt(roleId)}
        ORDER BY sc.sort_order, sm.sort_order, sd.sort_order, sm.name
      `

      return NextResponse.json(skills)
    } catch (error) {
      console.error("Error fetching role skills:", error)

      // Fallback to old structure
      try {
        const fallbackSkills = await sql`
          SELECT 
            s.id,
            s.name as skill_name,
            s.level,
            s.description as demonstration_description,
            s.full_description as skill_description,
            sc.name as category_name,
            sc.color as category_color,
            s.sort_order
          FROM skills s
          JOIN skill_categories sc ON s.category_id = sc.id
          WHERE s.job_role_id = ${Number.parseInt(roleId)}
          ORDER BY sc.sort_order, s.sort_order, s.name
        `

        return NextResponse.json(fallbackSkills)
      } catch (fallbackError) {
        console.error("Error with fallback query:", fallbackError)
        return NextResponse.json([])
      }
    }
  } catch (error) {
    console.error("Error in role-skills API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
