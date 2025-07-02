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
        stats: {
          total: 0,
          completed: 0,
          inProgress: 0,
          averageScore: 0,
        },
      })
    }

    // Ensure table exists with correct schema
    await sql`
      CREATE TABLE IF NOT EXISTS saved_assessments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        assessment_name VARCHAR(255) NOT NULL,
        job_role_name VARCHAR(255) NOT NULL,
        department_name VARCHAR(255) NOT NULL,
        skills_data JSONB NOT NULL DEFAULT '{}',
        overall_score DECIMAL(5,2) DEFAULT 0,
        completion_percentage DECIMAL(5,2) DEFAULT 0,
        total_skills INTEGER DEFAULT 0,
        completed_skills INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const filter = searchParams.get("filter") || "all"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    // Build where clause
    const whereConditions = [`user_id = ${user.id}`]

    if (search) {
      whereConditions.push(`(
        assessment_name ILIKE '%${search}%' OR 
        job_role_name ILIKE '%${search}%' OR 
        department_name ILIKE '%${search}%'
      )`)
    }

    if (filter === "completed") {
      whereConditions.push("completion_percentage >= 100")
    } else if (filter === "in-progress") {
      whereConditions.push("completion_percentage > 0 AND completion_percentage < 100")
    } else if (filter === "not-started") {
      whereConditions.push("completion_percentage = 0")
    }

    const whereClause = whereConditions.join(" AND ")

    // Get assessments
    const assessments = await sql`
      SELECT 
        id,
        assessment_name,
        job_role_name,
        department_name,
        overall_score,
        completion_percentage,
        total_skills,
        completed_skills,
        created_at,
        updated_at
      FROM saved_assessments 
      WHERE ${sql.unsafe(whereClause)}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    // Get total count
    const totalResult = await sql`
      SELECT COUNT(*) as count 
      FROM saved_assessments 
      WHERE ${sql.unsafe(whereClause)}
    `

    // Get stats for this user
    const statsResult = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN completion_percentage >= 100 THEN 1 END) as completed,
        COUNT(CASE WHEN completion_percentage > 0 AND completion_percentage < 100 THEN 1 END) as in_progress,
        COALESCE(AVG(overall_score), 0) as average_score
      FROM saved_assessments 
      WHERE user_id = ${user.id}
    `

    const total = Number.parseInt(totalResult[0]?.count || "0")
    const stats = statsResult[0] || { total: 0, completed: 0, in_progress: 0, average_score: 0 }

    return NextResponse.json({
      assessments: Array.isArray(assessments) ? assessments : [],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
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
    const {
      assessmentName,
      jobRoleName,
      departmentName,
      skillsData,
      overallScore = 0,
      completionPercentage = 0,
      totalSkills = 0,
      completedSkills = 0,
    } = body

    if (!assessmentName || !jobRoleName || !departmentName || !skillsData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS saved_assessments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        assessment_name VARCHAR(255) NOT NULL,
        job_role_name VARCHAR(255) NOT NULL,
        department_name VARCHAR(255) NOT NULL,
        skills_data JSONB NOT NULL DEFAULT '{}',
        overall_score DECIMAL(5,2) DEFAULT 0,
        completion_percentage DECIMAL(5,2) DEFAULT 0,
        total_skills INTEGER DEFAULT 0,
        completed_skills INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    const result = await sql`
      INSERT INTO saved_assessments (
        user_id, assessment_name, job_role_name, department_name, 
        skills_data, overall_score, completion_percentage, total_skills, completed_skills
      ) VALUES (
        ${user.id}, ${assessmentName}, ${jobRoleName}, ${departmentName},
        ${JSON.stringify(skillsData)}, ${overallScore}, ${completionPercentage}, 
        ${totalSkills}, ${completedSkills}
      )
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      assessment: result[0],
    })
  } catch (error) {
    console.error("Failed to create assessment:", error)
    return NextResponse.json({ error: "Failed to create assessment" }, { status: 500 })
  }
}
