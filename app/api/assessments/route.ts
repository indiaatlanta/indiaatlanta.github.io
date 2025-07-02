import { type NextRequest, NextResponse } from "next/server"
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
    }),
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
    }),
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
        isDemoMode: true,
      })
    }

    // Get saved assessments for the current user
    // Using the correct column names from the database schema
    const assessments = await sql`
      SELECT 
        id,
        assessment_name,
        job_role_name,
        department_name,
        completed_skills,
        total_skills,
        created_at,
        assessment_data
      FROM saved_assessments
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      assessments: assessments.map((assessment) => ({
        ...assessment,
        created_at: assessment.created_at.toISOString(),
      })),
      isDemoMode: false,
    })
  } catch (error) {
    console.error("Get assessments error:", error)
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
    const { name, jobRoleId, departmentName, jobRoleName, assessmentData, completedSkills, totalSkills } = body

    if (!isDatabaseConfigured() || !sql) {
      console.log("Database not configured, simulating save")
      return NextResponse.json({
        id: Date.now(),
        message: "Assessment saved successfully (demo mode)",
      })
    }

    // Save the assessment using the correct column names
    const result = await sql`
      INSERT INTO saved_assessments (
        user_id, 
        assessment_name, 
        job_role_name,
        department_name,
        completed_skills, 
        total_skills, 
        assessment_data,
        created_at
      )
      VALUES (
        ${user.id}, 
        ${name}, 
        ${jobRoleName},
        ${departmentName},
        ${completedSkills}, 
        ${totalSkills}, 
        ${JSON.stringify(assessmentData)},
        NOW()
      )
      RETURNING id
    `

    return NextResponse.json({
      id: result[0].id,
      message: "Assessment saved successfully",
    })
  } catch (error) {
    console.error("Save assessment error:", error)
    return NextResponse.json({ error: "Failed to save assessment" }, { status: 500 })
  }
}
