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

    // Ensure table exists with correct schema
    await sql`
      CREATE TABLE IF NOT EXISTS saved_assessments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER DEFAULT 1,
        role_id INTEGER DEFAULT 1,
        assessment_name VARCHAR(255) NOT NULL DEFAULT 'Unnamed Assessment',
        job_role_name VARCHAR(255) DEFAULT 'Unknown Role',
        department_name VARCHAR(255) DEFAULT 'Unknown Department',
        assessment_data JSONB DEFAULT '{}',
        skills_data JSONB DEFAULT '{}',
        overall_score DECIMAL(5,2) DEFAULT 0,
        completion_percentage INTEGER DEFAULT 0,
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
    const whereConditions = [`COALESCE(user_id, 1) = ${user.id}`]

    if (search) {
      whereConditions.push(`(
        COALESCE(assessment_name, '') ILIKE '%${search}%' OR 
        COALESCE(job_role_name, '') ILIKE '%${search}%' OR 
        COALESCE(department_name, '') ILIKE '%${search}%'
      )`)
    }

    if (filter === "completed") {
      whereConditions.push("COALESCE(completion_percentage, 0) >= 100")
    } else if (filter === "in-progress") {
      whereConditions.push("COALESCE(completion_percentage, 0) > 0 AND COALESCE(completion_percentage, 0) < 100")
    } else if (filter === "not-started") {
      whereConditions.push("COALESCE(completion_percentage, 0) = 0")
    }

    const whereClause = whereConditions.join(" AND ")

    // Get assessments with safe JSON handling
    const assessments = await sql`
      SELECT 
        id,
        COALESCE(assessment_name, 'Unnamed Assessment') as assessment_name,
        COALESCE(job_role_name, 'Unknown Role') as job_role_name,
        COALESCE(department_name, 'Unknown Department') as department_name,
        COALESCE(overall_score, 0) as overall_score,
        COALESCE(completion_percentage, 0) as completion_percentage,
        COALESCE(total_skills, 0) as total_skills,
        COALESCE(completed_skills, 0) as completed_skills,
        CASE 
          WHEN skills_data IS NOT NULL AND skills_data != 'null'::jsonb 
          THEN skills_data 
          ELSE '{}'::jsonb 
        END as skills_data,
        created_at,
        COALESCE(updated_at, created_at) as updated_at
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
        COUNT(CASE WHEN COALESCE(completion_percentage, 0) >= 100 THEN 1 END) as completed,
        COUNT(CASE WHEN COALESCE(completion_percentage, 0) > 0 AND COALESCE(completion_percentage, 0) < 100 THEN 1 END) as in_progress,
        COALESCE(AVG(NULLIF(overall_score, 0)), 0) as average_score
      FROM saved_assessments 
      WHERE COALESCE(user_id, 1) = ${user.id}
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

    if (!assessmentName || !jobRoleName || !departmentName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS saved_assessments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER DEFAULT 1,
        role_id INTEGER DEFAULT 1,
        assessment_name VARCHAR(255) NOT NULL DEFAULT 'Unnamed Assessment',
        job_role_name VARCHAR(255) DEFAULT 'Unknown Role',
        department_name VARCHAR(255) DEFAULT 'Unknown Department',
        assessment_data JSONB DEFAULT '{}',
        skills_data JSONB DEFAULT '{}',
        overall_score DECIMAL(5,2) DEFAULT 0,
        completion_percentage INTEGER DEFAULT 0,
        total_skills INTEGER DEFAULT 0,
        completed_skills INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Safely stringify the skills data
    const safeSkillsData = skillsData ? JSON.stringify(skillsData) : "{}"

    const result = await sql`
      INSERT INTO saved_assessments (
        user_id, assessment_name, job_role_name, department_name, 
        skills_data, assessment_data, overall_score, completion_percentage, 
        total_skills, completed_skills
      ) VALUES (
        ${user.id}, ${assessmentName}, ${jobRoleName}, ${departmentName},
        ${safeSkillsData}::jsonb, ${safeSkillsData}::jsonb, ${overallScore}, ${completionPercentage}, 
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
