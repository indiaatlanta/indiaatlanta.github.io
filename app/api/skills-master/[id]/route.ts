import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const skillId = Number.parseInt(params.id)

    if (isDatabaseConfigured()) {
      const skills = await sql!`
        SELECT * FROM skills_master WHERE id = ${skillId}
      `

      if (skills.length > 0) {
        return NextResponse.json(skills[0])
      }
    }

    return NextResponse.json({ error: "Skill not found" }, { status: 404 })
  } catch (error) {
    console.error("Get skill master error:", error)
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
    const { name, category, description } = body

    if (isDatabaseConfigured()) {
      const oldSkills = await sql!`SELECT * FROM skills_master WHERE id = ${skillId}`
      const oldSkill = oldSkills[0]

      const updatedSkills = await sql!`
        UPDATE skills_master 
        SET name = ${name}, category = ${category}, description = ${description},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${skillId}
        RETURNING *
      `

      if (updatedSkills.length > 0) {
        await createAuditLog(user.id, "UPDATE", "skills_master", skillId, oldSkill, updatedSkills[0])
        return NextResponse.json(updatedSkills[0])
      }
    }

    return NextResponse.json({ error: "Skill not found" }, { status: 404 })
  } catch (error) {
    console.error("Update skill master error:", error)
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
      const oldSkills = await sql!`SELECT * FROM skills_master WHERE id = ${skillId}`
      const oldSkill = oldSkills[0]

      const deletedSkills = await sql!`
        DELETE FROM skills_master WHERE id = ${skillId} RETURNING *
      `

      if (deletedSkills.length > 0) {
        await createAuditLog(user.id, "DELETE", "skills_master", skillId, oldSkill, null)
        return NextResponse.json({ success: true })
      }
    }

    return NextResponse.json({ error: "Skill not found" }, { status: 404 })
  } catch (error) {
    console.error("Delete skill master error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
