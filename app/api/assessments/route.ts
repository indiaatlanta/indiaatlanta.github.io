import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isDatabaseConfigured() || !sql) {
      // Return demo data
      const demoAssessments = [
        {
          id: 1,
          assessment_name: "Software Engineer Self-Assessment",
          job_role_name: "Software Engineer",
          department_name: "Engineering",
          overall_score: 75.5,
          completion_percentage: 100,
          total_skills: 14,
          completed_skills: 14,
          skills_data: {},
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z",
        },
      ]
      return NextResponse.json({ assessments: demoAssessments })
    }

    // Ensure tables exist
    await sql`
      CREATE TABLE IF NOT EXISTS saved_assessments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        assessment_name VARCHAR(255) NOT NULL,
        job_role_name VARCHAR(255),
        department_name VARCHAR(255),
        role_id INTEGER,
        skills_data JSONB DEFAULT '{}',
        overall_score DECIMAL(5,2) DEFAULT 0,
        completion_percentage INTEGER DEFAULT 0,
        total_skills INTEGER DEFAULT 0,
        completed_skills INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Ensure user exists
    await sql`
      INSERT INTO users (id, name, email, role, password_hash)
      VALUES (${user.id}, ${user.name}, ${user.email}, ${user.role}, 'demo_hash')
      ON CONFLICT (id) DO NOTHING
    `

    const result = await sql`
      SELECT 
        id,
        assessment_name,
        COALESCE(job_role_name, 'Unknown Role') as job_role_name,
        COALESCE(department_name, 'Unknown Department') as department_name,
        COALESCE(overall_score::numeric, 0) as overall_score,
        COALESCE(completion_percentage::integer, 0) as completion_percentage,
        COALESCE(total_skills::integer, 0) as total_skills,
        COALESCE(completed_skills::integer, 0) as completed_skills,
        COALESCE(skills_data, '{}') as skills_data,
        created_at,
        updated_at
      FROM saved_assessments
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `

    return NextResponse.json({ assessments: result })
  } catch (error) {
    console.error("Database query failed:", error)
    return NextResponse.json({ error: "Failed to fetch assessments" }, { status: 500 })
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
      roleId,
      skillsData,
      overallScore,
      completionPercentage,
      totalSkills,
      completedSkills,
    } = body

    if (!assessmentName) {
      return NextResponse.json({ error: "Assessment name is required" }, { status: 400 })
    }

    if (!isDatabaseConfigured() || !sql) {
      // Return demo response
      return NextResponse.json({
        assessment: {
          id: Date.now(),
          user_id: user.id,
          assessment_name: assessmentName,
          job_role_name: jobRoleName,
          department_name: departmentName,
          overall_score: overallScore || 0,
          completion_percentage: completionPercentage || 0,
          total_skills: totalSkills || 0,
          completed_skills: completedSkills || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      })
    }

    // Ensure user exists
    await sql`
      INSERT INTO users (id, name, email, role, password_hash)
      VALUES (${user.id}, ${user.name}, ${user.email}, ${user.role}, 'demo_hash')
      ON CONFLICT (id) DO NOTHING
    `

    const result = await sql`
      INSERT INTO saved_assessments (
        user_id,
        assessment_name,
        job_role_name,
        department_name,
        role_id,
        skills_data,
        overall_score,
        completion_percentage,
        total_skills,
        completed_skills
      )
      VALUES (
        ${user.id},
        ${assessmentName},
        ${jobRoleName || ""},
        ${departmentName || ""},
        ${roleId || null},
        ${JSON.stringify(skillsData || {})},
        ${overallScore || 0},
        ${completionPercentage || 0},
        ${totalSkills || 0},
        ${completedSkills || 0}
      )
      RETURNING *
    `

    return NextResponse.json({ assessment: result[0] })
  } catch (error) {
    console.error("Failed to create assessment:", error)
    return NextResponse.json({ error: "Failed to create assessment" }, { status: 500 })
  }
}
