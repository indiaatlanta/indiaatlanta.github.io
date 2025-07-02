import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid assessment ID" }, { status: 400 })
    }

    if (!isDatabaseConfigured() || !sql) {
      // Demo mode - return mock data
      return NextResponse.json({
        assessment: {
          id: id,
          assessment_name: "Demo Assessment",
          job_role_name: "Demo Role",
          department_name: "Demo Department",
          completed_skills: 10,
          total_skills: 15,
          created_at: new Date().toISOString(),
          assessment_data: { ratings: [] },
        },
        isDemoMode: true,
      })
    }

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
      WHERE id = ${id} AND user_id = ${user.id}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    return NextResponse.json({
      assessment: result[0],
      isDemoMode: false,
    })
  } catch (error) {
    console.error("Get assessment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid assessment ID" }, { status: 400 })
    }

    if (!isDatabaseConfigured() || !sql) {
      // Demo mode - simulate success
      return NextResponse.json({
        message: "Assessment deleted successfully (demo mode)",
        isDemoMode: true,
      })
    }

    const result = await sql`
      DELETE FROM saved_assessments 
      WHERE id = ${id} AND user_id = ${user.id}
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
    console.error("Delete assessment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
