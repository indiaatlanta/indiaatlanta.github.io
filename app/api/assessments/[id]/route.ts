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
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid assessment ID" }, { status: 400 })
    }

    const assessments = await sql`
      SELECT * FROM saved_assessments 
      WHERE id = ${id} AND user_id = ${user.id}
    `

    if (assessments.length === 0) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    return NextResponse.json({ assessment: assessments[0] })
  } catch (error) {
    console.error("Failed to fetch assessment:", error)
    return NextResponse.json({ error: "Failed to fetch assessment" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid assessment ID" }, { status: 400 })
    }

    const body = await request.json()
    const {
      assessmentName,
      jobRoleName,
      departmentName,
      skillsData,
      overallScore,
      completionPercentage,
      totalSkills,
      completedSkills,
    } = body

    const result = await sql`
      UPDATE saved_assessments 
      SET 
        assessment_name = ${assessmentName},
        job_role_name = ${jobRoleName},
        department_name = ${departmentName},
        skills_data = ${JSON.stringify(skillsData)},
        overall_score = ${overallScore},
        completion_percentage = ${completionPercentage},
        total_skills = ${totalSkills},
        completed_skills = ${completedSkills},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    return NextResponse.json({ assessment: result[0] })
  } catch (error) {
    console.error("Failed to update assessment:", error)
    return NextResponse.json({ error: "Failed to update assessment" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid assessment ID" }, { status: 400 })
    }

    const result = await sql`
      DELETE FROM saved_assessments 
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Assessment deleted successfully" })
  } catch (error) {
    console.error("Failed to delete assessment:", error)
    return NextResponse.json({ error: "Failed to delete assessment" }, { status: 500 })
  }
}
