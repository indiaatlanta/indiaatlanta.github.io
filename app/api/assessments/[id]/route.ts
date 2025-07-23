import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!sql) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

    const assessments = await sql`
      SELECT 
        id,
        user_id,
        job_role_id,
        assessment_type,
        COALESCE(skills_data, '{}')::text as skills_data,
        created_at,
        updated_at
      FROM saved_assessments 
      WHERE id = ${params.id} AND user_id = ${user.id}
    `

    if (assessments.length === 0) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    const assessment = assessments[0]

    // Parse skills_data safely
    let skillsData = {}
    try {
      if (assessment.skills_data && assessment.skills_data !== "null") {
        skillsData = JSON.parse(assessment.skills_data)
      }
    } catch (error) {
      console.error("Error parsing skills_data:", error)
      skillsData = {}
    }

    return NextResponse.json({
      ...assessment,
      skills_data: skillsData,
    })
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

    const body = await request.json()
    const { job_role_id, assessment_type, skills_data } = body

    if (!sql) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

    // Convert skills_data to JSON string
    const skillsDataJson = JSON.stringify(skills_data)

    const result = await sql`
      UPDATE saved_assessments 
      SET 
        job_role_id = ${job_role_id},
        assessment_type = ${assessment_type},
        skills_data = ${skillsDataJson}::jsonb,
        updated_at = NOW()
      WHERE id = ${params.id} AND user_id = ${user.id}
      RETURNING id, user_id, job_role_id, assessment_type, skills_data, created_at, updated_at
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Assessment not found or unauthorized" }, { status: 404 })
    }

    const assessment = result[0]

    // Parse skills_data for response
    let parsedSkillsData = {}
    try {
      if (assessment.skills_data) {
        parsedSkillsData =
          typeof assessment.skills_data === "string" ? JSON.parse(assessment.skills_data) : assessment.skills_data
      }
    } catch (error) {
      console.error("Error parsing skills_data in response:", error)
    }

    return NextResponse.json({
      ...assessment,
      skills_data: parsedSkillsData,
    })
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

    if (!sql) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

    const result = await sql`
      DELETE FROM saved_assessments 
      WHERE id = ${params.id} AND user_id = ${user.id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Assessment not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete assessment:", error)
    return NextResponse.json({ error: "Failed to delete assessment" }, { status: 500 })
  }
}
