import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

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
      // Demo mode - simulate success
      console.log(`Demo mode: Simulating deletion of assessment ${assessmentId}`)
      return NextResponse.json({
        message: "Assessment deleted successfully (demo mode)",
        isDemoMode: true,
      })
    }

    const result = await sql`
      DELETE FROM saved_assessments 
      WHERE id = ${assessmentId} AND user_id = ${user.id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Assessment not found or unauthorized" }, { status: 404 })
    }

    console.log(`Assessment ${assessmentId} deleted successfully`)

    return NextResponse.json({
      message: "Assessment deleted successfully",
      isDemoMode: false,
    })
  } catch (error) {
    console.error("Delete assessment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
