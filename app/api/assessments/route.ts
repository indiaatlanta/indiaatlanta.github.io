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
      return NextResponse.json({
        assessments: [],
        total: 0,
        isDemoMode: true,
      })
    }

    // Ensure the table exists
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS saved_assessments (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          assessment_name VARCHAR(255) NOT NULL,
          job_role VARCHAR(255) NOT NULL,
          department VARCHAR(255) NOT NULL,
          skills_data JSONB NOT NULL,
          completion_percentage DECIMAL(5,2) DEFAULT 0,
          total_skills INTEGER DEFAULT 0,
          completed_skills INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
    } catch (createError) {
      console.log("Table creation info:", createError.message)
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const filter = searchParams.get("filter") || "all"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    let whereClause = `WHERE user_id = ${user.id}`

    if (search) {
      whereClause += ` AND (
        assessment_name ILIKE '%${search}%' OR 
        job_role ILIKE '%${search}%' OR 
        department ILIKE '%${search}%'
      )`
    }

    if (filter === "completed") {
      whereClause += ` AND completion_percentage >= 100`
    } else if (filter === "in-progress") {
      whereClause += ` AND completion_percentage > 0 AND completion_percentage < 100`
    } else if (filter === "not-started") {
      whereClause += ` AND completion_percentage = 0`
    }

    try {
      const assessmentsResult = await sql`
        SELECT 
          id,
          assessment_name,
          job_role,
          department,
          completion_percentage,
          total_skills,
          completed_skills,
          created_at,
          updated_at
        FROM saved_assessments 
        ${sql.unsafe(whereClause)}
        ORDER BY created_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `

      const countResult = await sql`
        SELECT COUNT(*) as total 
        FROM saved_assessments 
        ${sql.unsafe(whereClause)}
      `

      // Ensure we have arrays
      const assessments = Array.isArray(assessmentsResult) ? assessmentsResult : []
      const total = countResult[0]?.total || 0

      // Normalize the data structure
      const normalizedAssessments = assessments.map((assessment) => ({
        id: assessment.id,
        name: assessment.assessment_name,
        job_role_name: assessment.job_role,
        department_name: assessment.department,
        completed_skills: assessment.completed_skills || 0,
        total_skills: assessment.total_skills || 0,
        completion_percentage: assessment.completion_percentage || 0,
        created_at: assessment.created_at,
        updated_at: assessment.updated_at,
      }))

      return NextResponse.json({
        assessments: normalizedAssessments,
        total: Number.parseInt(total.toString()),
        page,
        limit,
        totalPages: Math.ceil(Number.parseInt(total.toString()) / limit),
      })
    } catch (queryError) {
      console.error("Database query failed:", queryError.message)
      return NextResponse.json({
        assessments: [],
        total: 0,
        error: "Failed to fetch assessments",
      })
    }
  } catch (error) {
    console.error("Assessments API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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
    const {
      assessment_name,
      job_role,
      department,
      skills_data,
      completion_percentage = 0,
      total_skills = 0,
      completed_skills = 0,
    } = body

    if (!assessment_name || !job_role || !department || !skills_data) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    try {
      const result = await sql`
        INSERT INTO saved_assessments (
          user_id,
          assessment_name,
          job_role,
          department,
          skills_data,
          completion_percentage,
          total_skills,
          completed_skills
        ) VALUES (
          ${user.id},
          ${assessment_name},
          ${job_role},
          ${department},
          ${JSON.stringify(skills_data)},
          ${completion_percentage},
          ${total_skills},
          ${completed_skills}
        )
        RETURNING *
      `

      return NextResponse.json({
        success: true,
        assessment: result[0],
      })
    } catch (insertError) {
      console.error("Failed to save assessment:", insertError)
      return NextResponse.json({ error: "Failed to save assessment" }, { status: 500 })
    }
  } catch (error) {
    console.error("Save assessment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
