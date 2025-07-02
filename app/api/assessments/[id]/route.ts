import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const assessmentId = Number.parseInt(params.id)
    if (isNaN(assessmentId)) {
      return NextResponse.json({ error: "Invalid assessment ID" }, { status: 400 })
    }

    const assessment = await sql`
      SELECT 
        id,
        name,
        job_role_name,
        department_name,
        completed_skills,
        total_skills,
        assessment_data,
        created_at,
        updated_at
      FROM saved_assessments
      WHERE id = ${assessmentId} AND user_id = ${user.id}
    `

    if (assessment.length === 0) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    return NextResponse.json({
      assessment: {
        ...assessment[0],
        created_at: assessment[0].created_at.toISOString(),
        updated_at: assessment[0].updated_at.toISOString(),
        assessment_data: assessment[0].assessment_data ? JSON.parse(assessment[0].assessment_data) : null,
      },
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

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const assessmentId = Number.parseInt(params.id)
    if (isNaN(assessmentId)) {
      return NextResponse.json({ error: "Invalid assessment ID" }, { status: 400 })
    }

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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const assessmentId = Number.parseInt(params.id)
    if (isNaN(assessmentId)) {
      return NextResponse.json({ error: "Invalid assessment ID" }, { status: 400 })
    }

    const body = await request.json()
    const { name, job_role_name, department_name, completed_skills, total_skills, assessment_data } = body

    const result = await sql`
      UPDATE saved_assessments
      SET 
        name = ${name},
        job_role_name = ${job_role_name},
        department_name = ${department_name},
        completed_skills = ${completed_skills},
        total_skills = ${total_skills},
        assessment_data = ${assessment_data ? JSON.stringify(assessment_data) : null},
        updated_at = NOW()
      WHERE id = ${assessmentId} AND user_id = ${user.id}
      RETURNING id, name, created_at, updated_at
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    return NextResponse.json({
      assessment: {
        ...result[0],
        created_at: result[0].created_at.toISOString(),
        updated_at: result[0].updated_at.toISOString(),
      },
      message: "Assessment updated successfully",
    })
  } catch (error) {
    console.error("Update assessment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
