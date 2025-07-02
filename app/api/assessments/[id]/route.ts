import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json(
        {
          error: "Database not configured",
          isDemoMode: true,
        },
        { status: 503 },
      )
    }

    const assessmentId = Number.parseInt(params.id)
    if (isNaN(assessmentId)) {
      return NextResponse.json({ error: "Invalid assessment ID" }, { status: 400 })
    }

    const result = await sql`
      SELECT * FROM saved_assessments 
      WHERE id = ${assessmentId} AND user_id = ${user.id}
    `

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    return NextResponse.json({ assessment: result[0] })
  } catch (error) {
    console.error("Failed to fetch assessment:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch assessment",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json(
        {
          error: "Database not configured",
          isDemoMode: true,
        },
        { status: 503 },
      )
    }

    const assessmentId = Number.parseInt(params.id)
    if (isNaN(assessmentId)) {
      return NextResponse.json({ error: "Invalid assessment ID" }, { status: 400 })
    }

    const body = await request.json()
    const { assessment_name, job_role, department, skills_data, overall_score, completion_percentage } = body

    const result = await sql`
      UPDATE saved_assessments 
      SET 
        assessment_name = ${assessment_name},
        job_role = ${job_role},
        department = ${department},
        skills_data = ${JSON.stringify(skills_data)},
        overall_score = ${overall_score},
        completion_percentage = ${completion_percentage},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${assessmentId} AND user_id = ${user.id}
      RETURNING *
    `

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    return NextResponse.json({
      assessment: result[0],
      message: "Assessment updated successfully",
    })
  } catch (error) {
    console.error("Failed to update assessment:", error)
    return NextResponse.json(
      {
        error: "Failed to update assessment",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json(
        {
          error: "Database not configured",
          isDemoMode: true,
        },
        { status: 503 },
      )
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

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Assessment deleted successfully",
    })
  } catch (error) {
    console.error("Failed to delete assessment:", error)
    return NextResponse.json(
      {
        error: "Failed to delete assessment",
      },
      { status: 500 },
    )
  }
}
