import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
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

    // Update existing records to populate the new columns from related tables
    await sql`
      UPDATE saved_assessments 
      SET 
          job_role_name = COALESCE(jr.name, 'Unknown Role'),
          department_name = COALESCE(d.name, 'Unknown Department')
      FROM job_roles jr
      JOIN departments d ON jr.department_id = d.id
      WHERE saved_assessments.role_id = jr.id
      AND (saved_assessments.job_role_name IS NULL OR saved_assessments.job_role_name = '')
    `

    const { rows } = await sql`
      SELECT 
        sa.id,
        COALESCE(sa.assessment_name, 'Unnamed Assessment') as assessment_name,
        COALESCE(sa.job_role_name, jr.name, 'Unknown Role') as job_role_name,
        COALESCE(sa.department_name, d.name, 'Unknown Department') as department_name,
        COALESCE(sa.overall_score, 0) as overall_score,
        COALESCE(sa.completion_percentage, 0) as completion_percentage,
        COALESCE(sa.total_skills, 0) as total_skills,
        COALESCE(sa.completed_skills, 0) as completed_skills,
        COALESCE(sa.skills_data, sa.assessment_data, '{}') as skills_data,
        sa.created_at,
        sa.updated_at
      FROM saved_assessments sa
      LEFT JOIN job_roles jr ON sa.role_id = jr.id
      LEFT JOIN departments d ON jr.department_id = d.id
      ORDER BY sa.created_at DESC
    `

    return NextResponse.json({ assessments: rows })
  } catch (error) {
    console.error("Database query failed:", error)
    return NextResponse.json({ error: "Failed to fetch assessments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
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
      userId = 1, // Default user ID for demo
      roleId = 1, // Default role ID for demo
    } = body

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

    const { rows } = await sql`
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
        completed_skills
      ) VALUES (
        ${userId},
        ${roleId},
        ${assessmentName || "Unnamed Assessment"},
        ${jobRoleName || "Unknown Role"},
        ${departmentName || "Unknown Department"},
        ${JSON.stringify(skillsData || {})},
        ${JSON.stringify(skillsData || {})},
        ${overallScore || 0},
        ${completionPercentage || 0},
        ${totalSkills || 0},
        ${completedSkills || 0}
      )
      RETURNING *
    `

    return NextResponse.json({ assessment: rows[0] })
  } catch (error) {
    console.error("Failed to create assessment:", error)
    return NextResponse.json({ error: "Failed to create assessment" }, { status: 500 })
  }
}
