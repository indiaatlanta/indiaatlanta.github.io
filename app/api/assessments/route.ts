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
      return NextResponse.json([])
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
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `

    // Parse skills_data safely
    const parsedAssessments = assessments.map((assessment: any) => {
      let skillsData = {}
      try {
        if (assessment.skills_data && assessment.skills_data !== "null") {
          skillsData = JSON.parse(assessment.skills_data)
        }
      } catch (error) {
        console.error("Error parsing skills_data:", error)
        skillsData = {}
      }

      return {
        ...assessment,
        skills_data: skillsData,
      }
    })

    return NextResponse.json(parsedAssessments)
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
    const { job_role_id, assessment_type, skills_data } = body

    if (!job_role_id || !assessment_type || !skills_data) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!sql) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

    // Convert skills_data to JSON string
    const skillsDataJson = JSON.stringify(skills_data)

    const result = await sql`
      INSERT INTO saved_assessments (
        user_id, 
        job_role_id, 
        assessment_type, 
        skills_data,
        created_at,
        updated_at
      )
      VALUES (
        ${user.id}, 
        ${job_role_id}, 
        ${assessment_type}, 
        ${skillsDataJson}::jsonb,
        NOW(),
        NOW()
      )
      RETURNING id, user_id, job_role_id, assessment_type, skills_data, created_at, updated_at
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
        ...assessment,
        skills_data: parsedSkillsData,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Failed to save assessment:", error)
    return NextResponse.json({ error: "Failed to save assessment" }, { status: 500 })
  }
}
