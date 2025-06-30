import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const demonstrationId = Number.parseInt(params.id)
    const body = await request.json()
    const { demonstration } = body

    if (isDatabaseConfigured()) {
      const oldDemonstrations = await sql!`SELECT * FROM skill_demonstrations WHERE id = ${demonstrationId}`
      const oldDemonstration = oldDemonstrations[0]

      const updatedDemonstrations = await sql!`
        UPDATE skill_demonstrations 
        SET demonstration = ${demonstration}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${demonstrationId}
        RETURNING *
      `

      if (updatedDemonstrations.length > 0) {
        await createAuditLog(
          user.id,
          "UPDATE",
          "skill_demonstrations",
          demonstrationId,
          oldDemonstration,
          updatedDemonstrations[0],
        )
        return NextResponse.json(updatedDemonstrations[0])
      }
    }

    return NextResponse.json({ error: "Demonstration not found" }, { status: 404 })
  } catch (error) {
    console.error("Update skill demonstration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const demonstrationId = Number.parseInt(params.id)

    if (isDatabaseConfigured()) {
      const oldDemonstrations = await sql!`SELECT * FROM skill_demonstrations WHERE id = ${demonstrationId}`
      const oldDemonstration = oldDemonstrations[0]

      const deletedDemonstrations = await sql!`
        DELETE FROM skill_demonstrations WHERE id = ${demonstrationId} RETURNING *
      `

      if (deletedDemonstrations.length > 0) {
        await createAuditLog(user.id, "DELETE", "skill_demonstrations", demonstrationId, oldDemonstration, null)
        return NextResponse.json({ success: true })
      }
    }

    return NextResponse.json({ error: "Demonstration not found" }, { status: 404 })
  } catch (error) {
    console.error("Delete skill demonstration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
