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
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    try {
      // Delete the assessment (only if it belongs to the current user)
      const result = await sql`
        DELETE FROM saved_assessments 
        WHERE id = ${assessmentId} AND user_id = ${user.id}
        RETURNING id
      `

      if (result.length === 0) {
        return NextResponse.json({ error: "Assessment not found or access denied" }, { status: 404 })
      }

      return NextResponse.json({
        message: "Assessment deleted successfully",
        id: result[0].id,
      })
    } catch (dbError) {
      console.error("Database delete failed:", dbError)
      return NextResponse.json({ error: "Failed to delete assessment" }, { status: 500 })
    }
  } catch (error) {
    console.error("Delete assessment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    try {
      // Get the specific assessment
      const result = await sql`
        SELECT 
          id,
          name,
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
        return NextResponse.json({ error: "Assessment not found or access denied" }, { status: 404 })
      }

      const assessment = result[0]

      return NextResponse.json({
        assessment: {
          id: assessment.id,
          name: assessment.name,
          job_role_name: assessment.job_role_name || "Unknown Role",
          department_name: assessment.department_name || "Unknown Department",
          completed_skills: assessment.completed_skills || 0,
          total_skills: assessment.total_skills || 0,
          created_at: assessment.created_at.toISOString(),
          assessment_data: assessment.assessment_data || null,
        },
      })
    } catch (dbError) {
      console.error("Database query failed:", dbError)
      return NextResponse.json({ error: "Failed to load assessment" }, { status: 500 })
    }
  } catch (error) {
    console.error("Get assessment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
