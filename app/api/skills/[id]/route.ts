import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit"

// Demo skills data
const demoSkills = [
  {
    id: 1,
    name: "JavaScript",
    category: "Programming",
    level: "Advanced",
    description: "Modern JavaScript development",
  },
  { id: 2, name: "React", category: "Frontend", level: "Advanced", description: "React.js framework" },
  { id: 3, name: "Node.js", category: "Backend", level: "Intermediate", description: "Server-side JavaScript" },
  { id: 4, name: "Python", category: "Programming", level: "Intermediate", description: "Python programming" },
  { id: 5, name: "SQL", category: "Database", level: "Advanced", description: "Database management" },
]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const skillId = Number.parseInt(params.id)

    if (isDatabaseConfigured()) {
      const skills = await sql!`
        SELECT * FROM skills WHERE id = ${skillId}
      `

      if (skills.length > 0) {
        return NextResponse.json(skills[0])
      }
    }

    // Fallback to demo data
    const skill = demoSkills.find((s) => s.id === skillId)
    if (skill) {
      return NextResponse.json(skill)
    }

    return NextResponse.json({ error: "Skill not found" }, { status: 404 })
  } catch (error) {
    console.error("Get skill error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const skillId = Number.parseInt(params.id)
    const body = await request.json()
    const { name, category, level, description, full_description } = body

    if (isDatabaseConfigured()) {
      // Get old values for audit
      const oldSkills = await sql!`SELECT * FROM skills WHERE id = ${skillId}`
      const oldSkill = oldSkills[0]

      const updatedSkills = await sql!`
        UPDATE skills 
        SET name = ${name}, category = ${category}, level = ${level}, 
            description = ${description}, full_description = ${full_description || description},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${skillId}
        RETURNING *
      `

      if (updatedSkills.length > 0) {
        await createAuditLog(user.id, "UPDATE", "skills", skillId, oldSkill, updatedSkills[0])
        return NextResponse.json(updatedSkills[0])
      }
    }

    return NextResponse.json({ error: "Skill not found" }, { status: 404 })
  } catch (error) {
    console.error("Update skill error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const skillId = Number.parseInt(params.id)

    if (isDatabaseConfigured()) {
      // Get old values for audit
      const oldSkills = await sql!`SELECT * FROM skills WHERE id = ${skillId}`
      const oldSkill = oldSkills[0]

      const deletedSkills = await sql!`
        DELETE FROM skills WHERE id = ${skillId} RETURNING *
      `

      if (deletedSkills.length > 0) {
        await createAuditLog(user.id, "DELETE", "skills", skillId, oldSkill, null)
        return NextResponse.json({ success: true })
      }
    }

    return NextResponse.json({ error: "Skill not found" }, { status: 404 })
  } catch (error) {
    console.error("Delete skill error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
