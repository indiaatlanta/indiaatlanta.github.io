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
        return NextResponse.json({ error: "Assessment not found or unauthorized" }, { status: 404 })
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
      console.log("Database not configured, returning demo assessment")
      const demoAssessment = {
        id: assessmentId,
        user_id: user.id,
        role_id: 1,
        assessment_name: "Demo Assessment",
        assessment_data: {
          ratings: [
            { skillId: 1, rating: "proficient" },
            { skillId: 2, rating: "developing" },
          ],
          roleName: "Frontend Developer",
          roleCode: "FE-L2",
          departmentName: "Engineering",
          completedAt: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      return NextResponse.json({ assessment: demoAssessment, isDemoMode: true })
    }

    try {
      const result = await sql`
        SELECT 
          sa.id,
          sa.user_id,
          sa.role_id,
          sa.assessment_name,
          sa.assessment_data,
          sa.created_at,
          sa.updated_at,
          jr.name as role_name,
          jr.code as role_code,
          d.name as department_name
        FROM saved_assessments sa
        JOIN job_roles jr ON sa.role_id = jr.id
        JOIN departments d ON jr.department_id = d.id
        WHERE sa.id = ${assessmentId} AND sa.user_id = ${user.id}
      `

      if (result.length === 0) {
        return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
      }

      const assessment = result[0]
      return NextResponse.json({
        assessment: {
          ...assessment,
          assessment_data:
            typeof assessment.assessment_data === "string"
              ? JSON.parse(assessment.assessment_data)
              : assessment.assessment_data,
        },
        isDemoMode: false,
      })
    } catch (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch assessment" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error fetching assessment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
