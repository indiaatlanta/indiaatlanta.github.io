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
      console.log("Database not configured, returning empty assessments")
      return NextResponse.json({
        assessments: [],
        stats: {
          total: 0,
          averageCompletion: 0,
          lastAssessment: null,
        },
      })
    }

    // Get assessments for the current user
    const assessments = await sql`
      SELECT 
        id,
        assessment_name as name,
        role_name,
        department_name,
        completion_percentage,
        assessment_data,
        created_at,
        updated_at
      FROM saved_assessments 
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `

    // Calculate stats
    const total = assessments.length
    const averageCompletion =
      total > 0 ? Math.round(assessments.reduce((sum, a) => sum + (a.completion_percentage || 0), 0) / total) : 0
    const lastAssessment = total > 0 ? assessments[0].created_at : null

    return NextResponse.json({
      assessments: assessments.map((assessment) => ({
        ...assessment,
        assessment_data: assessment.assessment_data ? JSON.parse(assessment.assessment_data) : null,
      })),
      stats: {
        total,
        averageCompletion,
        lastAssessment,
      },
    })
  } catch (error) {
    console.error("Get assessments error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch assessments",
        assessments: [],
        stats: {
          total: 0,
          averageCompletion: 0,
          lastAssessment: null,
        },
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
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const body = await request.json()
    const { assessment_name, role_name, department_name, completion_percentage, assessment_data } = body

    if (!assessment_name || !role_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO saved_assessments (
        user_id,
        assessment_name,
        role_name,
        department_name,
        completion_percentage,
        assessment_data,
        created_at,
        updated_at
      ) VALUES (
        ${user.id},
        ${assessment_name},
        ${role_name},
        ${department_name || null},
        ${completion_percentage || 0},
        ${assessment_data ? JSON.stringify(assessment_data) : null},
        NOW(),
        NOW()
      )
      RETURNING id, assessment_name as name, role_name, department_name, completion_percentage, created_at
    `

    return NextResponse.json({
      success: true,
      assessment: result[0],
    })
  } catch (error) {
    console.error("Save assessment error:", error)
    return NextResponse.json({ error: "Failed to save assessment" }, { status: 500 })
  }
}
