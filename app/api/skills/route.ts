import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (isDatabaseConfigured()) {
      try {
        const skills = await sql!`
          SELECT 
            s.id,
            s.name,
            s.category,
            s.level,
            s.description
          FROM skills s
          ORDER BY s.created_at DESC
          LIMIT ${limit}
        `

        const total = await sql!`SELECT COUNT(*) as count FROM skills`

        return NextResponse.json({
          skills: skills.map((skill) => ({
            id: skill.id,
            name: skill.name,
            category: skill.category,
            level: skill.level,
            description: skill.description,
          })),
          total: total[0].count,
        })
      } catch (error) {
        console.error("Database error:", error)
        // Fall through to demo data
      }
    }

    // Demo data fallback
    const demoSkills = [
      {
        id: 1,
        name: "React Development",
        category: "Frontend",
        level: 4,
        description: "Building user interfaces with React framework",
      },
      {
        id: 2,
        name: "Node.js",
        category: "Backend",
        level: 3,
        description: "Server-side JavaScript development",
      },
      {
        id: 3,
        name: "UI/UX Design",
        category: "Design",
        level: 5,
        description: "User interface and experience design",
      },
      {
        id: 4,
        name: "Data Analysis",
        category: "Analytics",
        level: 4,
        description: "Analyzing and interpreting data",
      },
      {
        id: 5,
        name: "Project Management",
        category: "Leadership",
        level: 3,
        description: "Managing projects and teams",
      },
    ]

    return NextResponse.json({
      skills: demoSkills.slice(0, limit),
      total: 195,
    })
  } catch (error) {
    console.error("Skills API error:", error)
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 })
  }
}
