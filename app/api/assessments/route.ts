import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (!sql) {
      // Return empty array if no database connection
      return NextResponse.json({ assessments: [] })
    }

    // Use the correct column names from the saved_assessments table
    const assessments = await sql`
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
      WHERE sa.user_id = ${user.id}
      ORDER BY sa.created_at DESC 
      LIMIT ${limit}
    `

    // Parse skills_data safely
    const parsedAssessments = assessments.map((assessment: any) => {
      let skillsData = {}
      try {
        if (assessment.skills_data && assessment.skills_data !== "null" && assessment.skills_data !== "{}") {
          skillsData = JSON.parse(assessment.skills_data)
        }
      } catch (error) {
        console.error("Error parsing skills_data:", error)
        skillsData = {}
      }

      return {
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
      }
    })

    return NextResponse.json({ assessments: parsedAssessments })
  } catch (error) {
    console.error("Database query failed:", error)
    return NextResponse.json({ error: "Failed to fetch assessments", assessments: [] }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      assessmentName,
      jobRoleName,
      departmentName,
      skillsData,
      overallScore = 0,
      completionPercentage = 0,
      totalSkills = 0,
      completedSkills = 0,
      roleId = 1,
    } = body

    if (!assessmentName || !jobRoleName || !departmentName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!sql) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

    // Ensure the table has all required columns
    await sql`
      ALTER TABLE saved_assessments 
      ADD COLUMN IF NOT EXISTS job_role_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS department_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS skills_data JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS overall_score DECIMAL(5,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS total_skills INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS completed_skills INTEGER DEFAULT 0
    `

    // Convert skills_data to JSON string
    const skillsDataJson = JSON.stringify(skillsData || {})

    const result = await sql`
      INSERT INTO saved_assessments (
        user_id, 
        role_id,
        assessment_name,
        job_role_name,
        department_name,
        assessment_data,
        skills_data,
        overall_score,
        completion_percentage,
        total_skills,
        completed_skills,
        created_at,
        updated_at
      )
      VALUES (
        ${user.id}, 
        ${roleId},
        ${assessmentName},
        ${jobRoleName},
        ${departmentName},
        ${skillsDataJson}::jsonb,
        ${skillsDataJson}::jsonb,
        ${overallScore},
        ${completionPercentage},
        ${totalSkills},
        ${completedSkills},
        NOW(),
        NOW()
      )
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Failed to create assessment" }, { status: 500 })
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

    return NextResponse.json(
      {
        success: true,
        assessment: {
          ...assessment,
          skills_data: parsedSkillsData,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Failed to save assessment:", error)
    return NextResponse.json({ error: "Failed to save assessment" }, { status: 500 })
  }
}
