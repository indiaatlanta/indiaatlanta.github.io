import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const assessmentId = Number.parseInt(params.id)
    if (isNaN(assessmentId)) {
      return NextResponse.json({ error: "Invalid assessment ID" }, { status: 400 })
    }

    if (!isDatabaseConfigured() || !sql) {
      console.log("Database not configured, simulating delete")
      return NextResponse.json({
        message: "Assessment deleted successfully (demo mode)",
        isDemoMode: true,
      })
    }

    try {
      const result = await sql`
        DELETE FROM saved_assessments 
        WHERE id = ${assessmentId} AND user_id = ${user.id}
        RETURNING id
      `

      if (result.length === 0) {
        return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
      }

      return NextResponse.json({
        message: "Assessment deleted successfully",
        isDemoMode: false,
      })
    } catch (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to delete assessment" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error deleting assessment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
