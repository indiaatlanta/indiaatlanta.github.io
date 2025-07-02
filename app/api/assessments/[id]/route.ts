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

    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    try {
      const result = await sql`
        SELECT * FROM saved_assessments 
        WHERE id = ${id} AND user_id = ${user.id}
      `

      if (result.length === 0) {
        return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
      }

      return NextResponse.json({ assessment: result[0] })
    } catch (queryError) {
      console.error("Failed to fetch assessment:", queryError)
      return NextResponse.json({ error: "Failed to fetch assessment" }, { status: 500 })
    }
  } catch (error) {
    console.error("Get assessment error:", error)
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

    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const body = await request.json()
    const {
      assessment_name,
      job_role,
      department,
      skills_data,
      completion_percentage,
      total_skills,
      completed_skills,
    } = body

    try {
      const result = await sql`
        UPDATE saved_assessments 
        SET 
          assessment_name = ${assessment_name},
          job_role = ${job_role},
          department = ${department},
          skills_data = ${JSON.stringify(skills_data)},
          completion_percentage = ${completion_percentage},
          total_skills = ${total_skills},
          completed_skills = ${completed_skills},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id} AND user_id = ${user.id}
        RETURNING *
      `

      if (result.length === 0) {
        return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        assessment: result[0],
      })
    } catch (updateError) {
      console.error("Failed to update assessment:", updateError)
      return NextResponse.json({ error: "Failed to update assessment" }, { status: 500 })
    }
  } catch (error) {
    console.error("Update assessment error:", error)
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

    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    try {
      const result = await sql`
        DELETE FROM saved_assessments 
        WHERE id = ${id} AND user_id = ${user.id}
        RETURNING *
      `

      if (result.length === 0) {
        return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
      }

      return NextResponse.json({ success: true })
    } catch (deleteError) {
      console.error("Failed to delete assessment:", deleteError)
      return NextResponse.json({ error: "Failed to delete assessment" }, { status: 500 })
    }
  } catch (error) {
    console.error("Delete assessment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
