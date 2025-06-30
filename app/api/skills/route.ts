import { NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (isDatabaseConfigured()) {
      try {
        const skills = await sql!`
          SELECT id, name, category, level, description
          FROM skills
          ORDER BY created_at DESC
          LIMIT ${limit}
        `

        return NextResponse.json({
          skills: skills.map((skill) => ({
            id: skill.id,
            name: skill.name,
            category: skill.category,
            level: skill.level || 3,
            description: skill.description,
          })),
          total: skills.length,
        })
      } catch (error) {
        console.error("Database error fetching skills:", error)
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
    ].slice(0, limit)

    return NextResponse.json({
      skills: demoSkills,
      total: demoSkills.length,
    })
  } catch (error) {
    console.error("Error fetching skills:", error)
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 })
  }
}
