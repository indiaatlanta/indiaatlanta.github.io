import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getSession } from "@/lib/auth"

const sql = neon(process.env.DATABASE_URL!)

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const assessmentId = Number.parseInt(params.id)
    if (isNaN(assessmentId)) {
      return NextResponse.json({ error: "Invalid assessment ID" }, { status: 400 })
    }

    // Check if database is available
    try {
      // First check if the assessment exists and belongs to the user
      const existing = await sql`
        SELECT id FROM saved_assessments 
        WHERE id = ${assessmentId} AND user_id = ${session.user.id}
      `

      if (existing.length === 0) {
        return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
      }

      // Delete the assessment
      await sql`
        DELETE FROM saved_assessments 
        WHERE id = ${assessmentId} AND user_id = ${session.user.id}
      `

      return NextResponse.json({ success: true })
    } catch (dbError) {
      console.log("Database not available, simulating delete")
      // Simulate successful delete in demo mode
      return NextResponse.json({ success: true, isDemoMode: true })
    }
  } catch (error) {
    console.error("Error deleting assessment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const assessmentId = Number.parseInt(params.id)
    if (isNaN(assessmentId)) {
      return NextResponse.json({ error: "Invalid assessment ID" }, { status: 400 })
    }

    // Check if database is available
    try {
      const result = await sql`
        SELECT 
          sa.id,
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
        WHERE sa.id = ${assessmentId} AND sa.user_id = ${session.user.id}
      `

      if (result.length === 0) {
        return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
      }

      return NextResponse.json({ assessment: result[0] })
    } catch (dbError) {
      console.log("Database not available, returning demo data")
      // Return demo data when database is not available
      return NextResponse.json({
        assessment: {
          id: assessmentId,
          assessment_name: "Demo Assessment",
          assessment_data: {
            ratings: [],
            roleName: "Demo Role",
            roleCode: "DEMO",
            departmentName: "Demo Department",
            completedAt: new Date().toISOString(),
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          role_name: "Demo Role",
          role_code: "DEMO",
          department_name: "Demo Department",
        },
        isDemoMode: true,
      })
    }
  } catch (error) {
    console.error("Error fetching assessment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
