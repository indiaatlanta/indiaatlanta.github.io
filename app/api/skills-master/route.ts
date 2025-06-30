import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit"

// Demo skills master data
const demoSkillsMaster = [
  {
    id: 1,
    name: "JavaScript",
    category: "Programming",
    description: "Modern JavaScript development",
    created_at: new Date(),
  },
  { id: 2, name: "React", category: "Frontend", description: "React.js framework", created_at: new Date() },
  { id: 3, name: "Node.js", category: "Backend", description: "Server-side JavaScript", created_at: new Date() },
  { id: 4, name: "Python", category: "Programming", description: "Python programming", created_at: new Date() },
  { id: 5, name: "SQL", category: "Database", description: "Database management", created_at: new Date() },
]

export async function GET() {
  try {
    if (isDatabaseConfigured()) {
      const skills = await sql!`
        SELECT * FROM skills_master ORDER BY category, name
      `
      return NextResponse.json(skills)
    }

    // Fallback to demo data
    return NextResponse.json(demoSkillsMaster)
  } catch (error) {
    console.error("Get skills master error:", error)
    return NextResponse.json(demoSkillsMaster)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, category, description } = body

    if (!name || !category) {
      return NextResponse.json({ error: "Name and category are required" }, { status: 400 })
    }

    if (isDatabaseConfigured()) {
      const newSkills = await sql!`
        INSERT INTO skills_master (name, category, description)
        VALUES (${name}, ${category}, ${description || ""})
        RETURNING *
      `

      if (newSkills.length > 0) {
        await createAuditLog(user.id, "CREATE", "skills_master", newSkills[0].id, null, newSkills[0])
        return NextResponse.json(newSkills[0])
      }
    }

    // Fallback response
    const newSkill = {
      id: Date.now(),
      name,
      category,
      description: description || "",
      created_at: new Date(),
    }
    return NextResponse.json(newSkill)
  } catch (error) {
    console.error("Create skill master error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
