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
        total: 0,
        stats: {
          total: 0,
          completed: 0,
          inProgress: 0,
          averageScore: 0,
        },
      })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const filter = searchParams.get("filter") || "all"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    // Ensure table exists
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

    // Build where clause
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
      whereClause += ` AND completion_percentage < 100`
    }

    // Get assessments
    const assessments = await sql`
      SELECT 
        id,
        assessment_name,
        job_role,
        department,
        overall_score,
        completion_percentage,
        created_at,
        updated_at
      FROM saved_assessments 
      ${sql.unsafe(whereClause)}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    // Get total count
    const totalResult = await sql`
      SELECT COUNT(*) as count 
      FROM saved_assessments 
      ${sql.unsafe(whereClause)}
    `

    // Get stats
    const statsResult = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN completion_percentage >= 100 THEN 1 END) as completed,
        COUNT(CASE WHEN completion_percentage < 100 THEN 1 END) as in_progress,
        COALESCE(AVG(overall_score), 0) as average_score
      FROM saved_assessments 
      WHERE user_id = ${user.id}
    `

    const total = Number.parseInt(totalResult[0]?.count || "0")
    const stats = statsResult[0] || { total: 0, completed: 0, in_progress: 0, average_score: 0 }

    return NextResponse.json({
      assessments: Array.isArray(assessments) ? assessments : [],
      total,
      stats: {
        total: Number.parseInt(stats.total || "0"),
        completed: Number.parseInt(stats.completed || "0"),
        inProgress: Number.parseInt(stats.in_progress || "0"),
        averageScore: Number.parseFloat(stats.average_score || "0"),
      },
    })
  } catch (error) {
    console.error("Database query failed:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch assessments",
        assessments: [],
        total: 0,
        stats: {
          total: 0,
          completed: 0,
          inProgress: 0,
          averageScore: 0,
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
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const body = await request.json()
    const { assessmentName, jobRole, department, skillsData, overallScore, completionPercentage } = body

    // Validate required fields
    if (!assessmentName || !jobRole || !department || !skillsData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Ensure table exists
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
        user_id, assessment_name, job_role, department, 
        skills_data, overall_score, completion_percentage
      ) VALUES (
        ${user.id}, ${assessmentName}, ${jobRole}, ${department},
        ${JSON.stringify(skillsData)}, ${overallScore || 0}, ${completionPercentage || 0}
      )
      RETURNING *
    `

    return NextResponse.json({ success: true, assessment: result[0] })
  } catch (error) {
    console.error("Failed to save assessment:", error)
    return NextResponse.json({ error: "Failed to save assessment" }, { status: 500 })
  }
}
