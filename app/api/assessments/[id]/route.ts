import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    if (!sql) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

    const result = await sql`
      SELECT 
        sa.id,
        sa.user_id,
        sa.role_id,
        COALESCE(sa.assessment_name, 'Unnamed Assessment') as assessment_name,
        COALESCE(sa.job_role_name, jr.name, 'Unknown Role') as job_role_name,
        COALESCE(sa.department_name, d.name, 'Unknown Department') as department_name,
        COALESCE(sa.overall_score, 0) as overall_score,
        COALESCE(sa.completion_percentage, 0) as completion_percentage,
        COALESCE(sa.total_skills, 0) as total_skills,
        COALESCE(sa.completed_skills, 0) as completed_skills,
        CASE 
          WHEN sa.skills_data IS NOT NULL AND sa.skills_data != 'null'::jsonb 
          THEN sa.skills_data::text
          WHEN sa.assessment_data IS NOT NULL AND sa.assessment_data != 'null'::jsonb
          THEN sa.assessment_data::text
          ELSE '{}'
        END as skills_data,
        sa.created_at,
        COALESCE(sa.updated_at, sa.created_at) as updated_at
      FROM saved_assessments sa
      LEFT JOIN job_roles jr ON sa.role_id = jr.id
      LEFT JOIN departments d ON jr.department_id = d.id
      WHERE sa.id = ${id} AND sa.user_id = ${user.id}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    const assessment = result[0]

    // Parse skills_data safely
    let skillsData = {}
    try {
      if (assessment.skills_data && assessment.skills_data !== "null" && assessment.skills_data !== "{}") {
        skillsData = JSON.parse(assessment.skills_data)
      }
    } catch (error) {
      console.error("Error parsing skills_data:", error)
      skillsData = {}
    }

    return NextResponse.json({
      id: assessment.id,
      assessment_name: assessment.assessment_name,
      job_role_name: assessment.job_role_name,
      department_name: assessment.department_name,
      overall_score: Number.parseFloat(assessment.overall_score || "0"),
      completion_percentage: Number.parseInt(assessment.completion_percentage || "0"),
      total_skills: Number.parseInt(assessment.total_skills || "0"),
      completed_skills: Number.parseInt(assessment.completed_skills || "0"),
      skills_data: skillsData,
      created_at: assessment.created_at,
      updated_at: assessment.updated_at,
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

    const { id } = params
    const body = await request.json()

    if (!sql) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

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

    // Convert skills_data to JSON string
    const skillsDataJson = JSON.stringify(skillsData || {})

    const result = await sql`
      UPDATE saved_assessments 
      SET 
        assessment_name = COALESCE(${assessmentName}, assessment_name),
        job_role_name = COALESCE(${jobRoleName}, job_role_name),
        department_name = COALESCE(${departmentName}, department_name),
        skills_data = COALESCE(${skillsDataJson}::jsonb, skills_data),
        assessment_data = COALESCE(${skillsDataJson}::jsonb, assessment_data),
        overall_score = COALESCE(${overallScore}, overall_score),
        completion_percentage = COALESCE(${completionPercentage}, completion_percentage),
        total_skills = COALESCE(${totalSkills}, total_skills),
        completed_skills = COALESCE(${completedSkills}, completed_skills),
        updated_at = NOW()
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING *
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
      success: true,
      assessment: {
        ...assessment,
        skills_data: parsedSkillsData,
      },
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

    const { id } = params

    if (!sql) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

    const result = await sql`
      DELETE FROM saved_assessments 
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Assessment not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Assessment deleted successfully" })
  } catch (error) {
    console.error("Failed to delete assessment:", error)
    return NextResponse.json({ error: "Failed to delete assessment" }, { status: 500 })
  }
}
