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
      // Demo mode - simulate success
      return NextResponse.json({ message: "Assessment deleted successfully (demo mode)" })
    }

    // Delete the assessment (only if it belongs to the current user)
    const result = await sql`
      DELETE FROM saved_assessments 
      WHERE id = ${assessmentId} AND user_id = ${user.id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Assessment deleted successfully" })
  } catch (error) {
    console.error("Delete assessment error:", error)
    return NextResponse.json({ error: "Failed to delete assessment" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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
      // Demo mode - return demo data
      return NextResponse.json({
        id: assessmentId,
        assessment_name: "Demo Assessment",
        job_role_name: "Demo Role",
        department_name: "Demo Department",
        completed_skills: 5,
        total_skills: 10,
        created_at: new Date().toISOString(),
        assessment_data: JSON.stringify({ demo: true }),
      })
    }

    // Get the specific assessment
    const result = await sql`
      SELECT 
        id,
        assessment_name,
        job_role_name,
        department_name,
        completed_skills,
        total_skills,
        created_at,
        assessment_data
      FROM saved_assessments 
      WHERE id = ${assessmentId} AND user_id = ${user.id}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...result[0],
      created_at: result[0].created_at.toISOString(),
    })
  } catch (error) {
    console.error("Get assessment error:", error)
    return NextResponse.json({ error: "Failed to fetch assessment" }, { status: 500 })
  }
}
