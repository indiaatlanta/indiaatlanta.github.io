import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const assessmentId = parseInt(params.id)

    if (!isDatabaseConfigured() || !sql) {
      console.log("Database not configured, simulating delete")
      return NextResponse.json({ message: "Assessment deleted successfully (demo mode)" })
    }

    // Delete the assessment (only if it belongs to the current user)
    const result = await sql`
      DELETE FROM saved_assessments 
      WHERE id = ${assessmentId} AND user_id = ${user.id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Assessment not found or access denied" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Assessment deleted successfully" })

  } catch (error) {
    console.error("Delete assessment error:", error)
    return NextResponse.json(
      { error: "Failed to delete assessment" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const assessmentId = parseInt(params.id)

    if (!isDatabaseConfigured() || !sql) {
      console.log("Database not configured, using demo data")
      const demoAssessment = {
        id: assessmentId,
        assessment_name: "Demo Assessment",
        job_role_name: "Demo Role",
        department_name: "Demo Department",
        completed_skills: 5,
        total_skills: 10,
        created_at: new Date().toISOString(),
        assessment_data: JSON.stringify({})
      }
      return NextResponse.json({ assessment: demoAssessment })
    }

    // Get specific assessment
    const result = await sql`
      SELECT 
        sa.id,
        sa.assessment_name,
        jr.name as job_role_name,
        d.name as department_name,
        sa.completed_skills,
        sa.total_skills,
        sa.created_at,
        sa.assessment_data
      FROM saved_assessments sa
      JOIN job_roles jr ON sa.job_role_id = jr.id
      JOIN departments d ON jr.department_id = d.id
      WHERE sa.id = ${assessmentId} AND sa.user_id = ${user.id}
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      assessment: {
        ...result[0],
        created_at: result[0].created_at.toISOString(),
      }
    })

  } catch (error) {
    console.error("Get assessment error:", error)
    return NextResponse.json(
      { error: "Failed to fetch assessment" },
      { status: 500 }
    )
  }
}
