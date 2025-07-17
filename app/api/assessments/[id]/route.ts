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
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid assessment ID" }, { status: 400 })
    }

    const result = await sql`
      SELECT 
        id,
        COALESCE(assessment_name, 'Unnamed Assessment') as assessment_name,
        COALESCE(job_role_name, 'Unknown Role') as job_role_name,
        COALESCE(department_name, 'Unknown Department') as department_name,
        COALESCE(overall_score, 0) as overall_score,
        COALESCE(completion_percentage, 0) as completion_percentage,
        COALESCE(total_skills, 0) as total_skills,
        COALESCE(completed_skills, 0) as completed_skills,
        CASE 
          WHEN skills_data IS NOT NULL AND skills_data != 'null'::jsonb 
          THEN skills_data 
          ELSE '{}'::jsonb 
        END as skills_data,
        created_at,
        COALESCE(updated_at, created_at) as updated_at
      FROM saved_assessments 
      WHERE id = ${id} AND COALESCE(user_id, 1) = ${user.id}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    return NextResponse.json({ assessment: result[0] })
  } catch (error) {
    console.error("Failed to fetch assessment:", error)
    return NextResponse.json({ error: "Failed to fetch assessment" }, { status: 500 })
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
      WHERE id = ${id} AND COALESCE(user_id, 1) = ${user.id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete assessment:", error)
    return NextResponse.json({ error: "Failed to delete assessment" }, { status: 500 })
  }
}
