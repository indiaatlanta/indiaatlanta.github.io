import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const skillId = searchParams.get("skill_id")

    if (isDatabaseConfigured()) {
      let query = `SELECT * FROM skill_demonstrations`
      const params = []

      if (skillId) {
        query += ` WHERE skill_id = $1`
        params.push(Number.parseInt(skillId))
      }

      query += ` ORDER BY created_at DESC`

      const demonstrations = await sql!`${query}`
      return NextResponse.json(demonstrations)
    }

    // Fallback to demo data
    const demoDemonstrations = [
      { id: 1, skill_id: 1, demonstration: "Built a complex web application", created_at: new Date() },
      { id: 2, skill_id: 1, demonstration: "Implemented ES6+ features", created_at: new Date() },
      { id: 3, skill_id: 2, demonstration: "Created reusable React components", created_at: new Date() },
    ]

    return NextResponse.json(
      skillId ? demoDemonstrations.filter((d) => d.skill_id === Number.parseInt(skillId)) : demoDemonstrations,
    )
  } catch (error) {
    console.error("Get skill demonstrations error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { skill_id, demonstration } = body

    if (!skill_id || !demonstration) {
      return NextResponse.json({ error: "Skill ID and demonstration are required" }, { status: 400 })
    }

    if (isDatabaseConfigured()) {
      const newDemonstrations = await sql!`
        INSERT INTO skill_demonstrations (skill_id, demonstration)
        VALUES (${skill_id}, ${demonstration})
        RETURNING *
      `

      if (newDemonstrations.length > 0) {
        await createAuditLog(
          user.id,
          "CREATE",
          "skill_demonstrations",
          newDemonstrations[0].id,
          null,
          newDemonstrations[0],
        )
        return NextResponse.json(newDemonstrations[0])
      }
    }

    // Fallback response
    const newDemonstration = {
      id: Date.now(),
      skill_id,
      demonstration,
      created_at: new Date(),
    }
    return NextResponse.json(newDemonstration)
  } catch (error) {
    console.error("Create skill demonstration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
