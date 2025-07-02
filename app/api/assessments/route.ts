import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json({
        assessments: [],
        isDemoMode: true,
        message: "Database not configured - demo mode active",
      })
    }

    // Ensure the table exists
    await sql`
      CREATE TABLE IF NOT EXISTS saved_assessments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        assessment_name VARCHAR(255) NOT NULL,
        job_role VARCHAR(255) NOT NULL,
        department VARCHAR(255) NOT NULL,
        skills_data JSONB NOT NULL,
        overall_score DECIMAL(5,2) DEFAULT 0,
        completion_percentage DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Get assessments for the current user
    const assessments = await sql`
      SELECT 
        id,
        assessment_name,
        job_role,
        department,
        skills_data,
        overall_score,
        completion_percentage,
        created_at,
        updated_at
      FROM saved_assessments 
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `

    // Ensure we return an array
    const assessmentList = Array.isArray(assessments) ? assessments : []

    // Transform the data to ensure consistent structure
    const transformedAssessments = assessmentList.map((assessment) => ({
      id: assessment.id,
      assessment_name: assessment.assessment_name || "Untitled Assessment",
      job_role: assessment.job_role || "Unknown Role",
      department: assessment.department || "Unknown Department",
      skills_data: assessment.skills_data || {},
      overall_score: Number(assessment.overall_score) || 0,
      completion_percentage: Number(assessment.completion_percentage) || 0,
      created_at: assessment.created_at,
      updated_at: assessment.updated_at,
    }))

    return NextResponse.json({
      assessments: transformedAssessments,
      isDemoMode: false,
    })
  } catch (error) {
    console.error("Database query failed:", error)
    return NextResponse.json(
      {
        assessments: [],
        isDemoMode: true,
        error: "Failed to fetch assessments",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { assessment_name, job_role, department, skills_data, overall_score = 0, completion_percentage = 0 } = body

    if (!assessment_name || !job_role || !department || !skills_data) {
      return NextResponse.json(
        {
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    // Ensure the table exists
    await sql`
      CREATE TABLE IF NOT EXISTS saved_assessments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        assessment_name VARCHAR(255) NOT NULL,
        job_role VARCHAR(255) NOT NULL,
        department VARCHAR(255) NOT NULL,
        skills_data JSONB NOT NULL,
        overall_score DECIMAL(5,2) DEFAULT 0,
        completion_percentage DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    const result = await sql`
      INSERT INTO saved_assessments (
        user_id, 
        assessment_name, 
        job_role, 
        department, 
        skills_data, 
        overall_score, 
        completion_percentage
      )
      VALUES (
        ${user.id}, 
        ${assessment_name}, 
        ${job_role}, 
        ${department}, 
        ${JSON.stringify(skills_data)}, 
        ${overall_score}, 
        ${completion_percentage}
      )
      RETURNING *
    `

    return NextResponse.json({
      assessment: result[0],
      message: "Assessment saved successfully",
    })
  } catch (error) {
    console.error("Failed to save assessment:", error)
    return NextResponse.json(
      {
        error: "Failed to save assessment",
      },
      { status: 500 },
    )
  }
}
