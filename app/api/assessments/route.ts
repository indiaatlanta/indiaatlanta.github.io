import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    // First, ensure the table exists
    await sql`
      CREATE TABLE IF NOT EXISTS saved_assessments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        assessment_name VARCHAR(255) NOT NULL,
        job_role VARCHAR(255) NOT NULL,
        department VARCHAR(255) NOT NULL,
        skills_data JSONB,
        overall_score DECIMAL(5,2) DEFAULT 0,
        completion_percentage DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Get all assessments
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
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      success: true,
      assessments: Array.isArray(assessments) ? assessments : [],
      isDemoMode: false,
    })
  } catch (error) {
    console.error("Database error:", error)

    // Return demo data if database fails
    const demoAssessments = [
      {
        id: 1,
        assessment_name: "Frontend Developer Assessment",
        job_role: "Frontend Developer",
        department: "Engineering",
        skills_data: {},
        overall_score: 85.5,
        completion_percentage: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        assessment_name: "UI/UX Designer Assessment",
        job_role: "UI/UX Designer",
        department: "Design",
        skills_data: {},
        overall_score: 78.2,
        completion_percentage: 90,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ]

    return NextResponse.json({
      success: true,
      assessments: demoAssessments,
      isDemoMode: true,
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assessment_name, job_role, department, skills_data, overall_score, completion_percentage } = body

    // Ensure the table exists
    await sql`
      CREATE TABLE IF NOT EXISTS saved_assessments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        assessment_name VARCHAR(255) NOT NULL,
        job_role VARCHAR(255) NOT NULL,
        department VARCHAR(255) NOT NULL,
        skills_data JSONB,
        overall_score DECIMAL(5,2) DEFAULT 0,
        completion_percentage DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    const result = await sql`
      INSERT INTO saved_assessments (
        assessment_name, 
        job_role, 
        department, 
        skills_data, 
        overall_score, 
        completion_percentage
      )
      VALUES (
        ${assessment_name}, 
        ${job_role}, 
        ${department}, 
        ${JSON.stringify(skills_data)}, 
        ${overall_score || 0}, 
        ${completion_percentage || 0}
      )
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      assessment: result[0],
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save assessment",
      },
      { status: 500 },
    )
  }
}
