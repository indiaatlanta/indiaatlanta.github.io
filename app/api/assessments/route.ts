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
      return NextResponse.json({ assessments: [] })
    }

    // Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS saved_assessments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        job_role_name VARCHAR(255) NOT NULL,
        department_name VARCHAR(255) NOT NULL,
        skills_data JSONB NOT NULL,
        overall_score DECIMAL(5,2) DEFAULT 0,
        completion_percentage DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const filter = searchParams.get("filter") || "all"

    let whereClause = sql`WHERE user_id = ${user.id}`

    if (search) {
      whereClause = sql`WHERE user_id = ${user.id} AND (
        name ILIKE ${`%${search}%`} OR 
        job_role_name ILIKE ${`%${search}%`} OR 
        department_name ILIKE ${`%${search}%`}
      )`
    }

    if (filter === "completed") {
      whereClause = sql`${whereClause} AND completion_percentage >= 100`
    } else if (filter === "in-progress") {
      whereClause = sql`${whereClause} AND completion_percentage < 100`
    }

    const assessments = await sql`
      SELECT 
        id,
        name,
        job_role_name,
        department_name,
        overall_score,
        completion_percentage,
        created_at,
        updated_at
      FROM saved_assessments 
      ${whereClause}
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      assessments: Array.isArray(assessments) ? assessments : [],
    })
  } catch (error) {
    console.error("Database query failed:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch assessments",
        assessments: [],
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
    const { name, job_role_name, department_name, skills_data, overall_score, completion_percentage } = body

    if (!name || !job_role_name || !department_name || !skills_data) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS saved_assessments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        job_role_name VARCHAR(255) NOT NULL,
        department_name VARCHAR(255) NOT NULL,
        skills_data JSONB NOT NULL,
        overall_score DECIMAL(5,2) DEFAULT 0,
        completion_percentage DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    const result = await sql`
      INSERT INTO saved_assessments (
        user_id, name, job_role_name, department_name, skills_data, overall_score, completion_percentage
      ) VALUES (
        ${user.id}, ${name}, ${job_role_name}, ${department_name}, 
        ${JSON.stringify(skills_data)}, ${overall_score || 0}, ${completion_percentage || 0}
      )
      RETURNING *
    `

    return NextResponse.json({ assessment: result[0] })
  } catch (error) {
    console.error("Failed to create assessment:", error)
    return NextResponse.json({ error: "Failed to create assessment" }, { status: 500 })
  }
}
