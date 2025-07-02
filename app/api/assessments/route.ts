import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"

// Demo data for when database is not available
const demoAssessments = [
  {
    id: 1,
    assessment_name: "Frontend Developer Assessment",
    job_role_name: "Frontend Developer",
    department_name: "Engineering",
    completed_skills: 8,
    total_skills: 12,
    created_at: "2024-01-15T10:30:00Z",
    assessment_data: JSON.stringify({
      "1": { rating: 4, notes: "Strong in React" },
      "2": { rating: 3, notes: "Good CSS skills" },
      "3": { rating: 5, notes: "Excellent JavaScript" },
    })
  },
  {
    id: 2,
    assessment_name: "Product Manager Evaluation",
    job_role_name: "Product Manager",
    department_name: "Product",
    completed_skills: 6,
    total_skills: 10,
    created_at: "2024-01-10T14:20:00Z",
    assessment_data: JSON.stringify({
      "4": { rating: 4, notes: "Good strategic thinking" },
      "5": { rating: 3, notes: "Developing user research skills" },
    })
  },
]

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isDatabaseConfigured() || !sql) {
      console.log("Database not configured, using demo assessments")
      return NextResponse.json({
        assessments: demoAssessments,
        isDemoMode: true
      })
    }

    // Get saved assessments for the current user
    const assessments = await sql`
      SELECT 
        sa.id,
        sa.assessment_name,
        jr.name as job_role_name,
        d.name as department_name,
        sa.completed_skills,
        sa.total_skills,
        sa.created_at,
        sa.assessment_data
      FROM saved_assessments sa
      JOIN job_roles jr ON sa.job_role_id = jr.id
      JOIN departments d ON jr.department_id = d.id
      WHERE sa.user_id = ${user.id}
      ORDER BY sa.created_at DESC
    `

    return NextResponse.json({
      assessments: assessments.map(assessment => ({
        ...assessment,
        created_at: assessment.created_at.toISOString(),
      })),
      isDemoMode: false
    })

  } catch (error) {
    console.error("Get assessments error:", error)
    return NextResponse.json(
      { error: "Failed to fetch assessments" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { assessment_name, job_role_id, completed_skills, total_skills, assessment_data } = body

    if (!isDatabaseConfigured() || !sql) {
      console.log("Database not configured, simulating save")
      return NextResponse.json({
        id: Date.now(),
        message: "Assessment saved successfully (demo mode)"
      })
    }

    // Save the assessment
    const result = await sql`
      INSERT INTO saved_assessments (
        user_id, 
        assessment_name, 
        job_role_id, 
        completed_skills, 
        total_skills, 
        assessment_data,
        created_at
      )
      VALUES (
        ${user.id}, 
        ${assessment_name}, 
        ${job_role_id}, 
        ${completed_skills}, 
        ${total_skills}, 
        ${JSON.stringify(assessment_data)},
        NOW()
      )
      RETURNING id
    `

    return NextResponse.json({
      id: result[0].id,
      message: "Assessment saved successfully"
    })

  } catch (error) {
    console.error("Save assessment error:", error)
    return NextResponse.json(
      { error: "Failed to save assessment" },
      { status: 500 }
    )
  }
}
