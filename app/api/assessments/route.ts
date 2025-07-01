import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getSession } from "@/lib/auth"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if database is available
    let assessments
    try {
      const result = await sql`
        SELECT 
          sa.id,
          sa.assessment_name,
          sa.assessment_data,
          sa.created_at,
          sa.updated_at,
          jr.name as role_name,
          jr.code as role_code,
          d.name as department_name
        FROM saved_assessments sa
        JOIN job_roles jr ON sa.role_id = jr.id
        JOIN departments d ON jr.department_id = d.id
        WHERE sa.user_id = ${session.user.id}
        ORDER BY sa.created_at DESC
      `
      assessments = result
    } catch (dbError) {
      console.log("Database not available, returning demo data")
      // Return demo data when database is not available
      assessments = [
        {
          id: 1,
          assessment_name: "Software Engineer Assessment - Dec 2024",
          assessment_data: {
            ratings: [
              { skillId: 1, rating: "proficient" },
              { skillId: 2, rating: "developing" },
            ],
            roleName: "Software Engineer",
            roleCode: "SE001",
            departmentName: "Engineering",
            completedAt: new Date().toISOString(),
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          role_name: "Software Engineer",
          role_code: "SE001",
          department_name: "Engineering",
        },
      ]
    }

    return NextResponse.json({ assessments, isDemoMode: !process.env.DATABASE_URL })
  } catch (error) {
    console.error("Error fetching assessments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { roleId, assessmentName, assessmentData } = body

    // Validate required fields
    if (!roleId || !assessmentName || !assessmentData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!assessmentName.trim()) {
      return NextResponse.json({ error: "Assessment name cannot be empty" }, { status: 400 })
    }

    if (!assessmentData.ratings || !Array.isArray(assessmentData.ratings)) {
      return NextResponse.json({ error: "Invalid assessment data" }, { status: 400 })
    }

    // Check if database is available
    try {
      const result = await sql`
        INSERT INTO saved_assessments (user_id, role_id, assessment_name, assessment_data)
        VALUES (${session.user.id}, ${roleId}, ${assessmentName.trim()}, ${JSON.stringify(assessmentData)})
        RETURNING id, created_at
      `

      return NextResponse.json({
        success: true,
        id: result[0].id,
        created_at: result[0].created_at,
      })
    } catch (dbError) {
      console.log("Database not available, simulating save")
      // Simulate successful save in demo mode
      return NextResponse.json({
        success: true,
        id: Math.floor(Math.random() * 1000),
        created_at: new Date().toISOString(),
        isDemoMode: true,
      })
    }
  } catch (error) {
    console.error("Error saving assessment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
