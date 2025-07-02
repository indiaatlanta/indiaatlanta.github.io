import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { z } from "zod"

const assessmentSchema = z.object({
  name: z.string().min(1, "Assessment name is required").max(255, "Name too long"),
  jobRoleId: z.number().int().positive("Invalid job role").optional(),
  departmentName: z.string().min(1, "Department name is required"),
  jobRoleName: z.string().min(1, "Job role name is required"),
  assessmentData: z.record(z.any()),
  completedSkills: z.number().int().min(0),
  totalSkills: z.number().int().min(0),
})

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json({
        assessments: [],
        isDemoMode: false,
        message: "Database not configured",
      })
    }

    try {
      // Ensure the table exists first
      await sql`
        CREATE TABLE IF NOT EXISTS saved_assessments (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          job_role_name VARCHAR(255),
          department_name VARCHAR(255),
          completed_skills INTEGER DEFAULT 0,
          total_skills INTEGER DEFAULT 0,
          assessment_data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `

      // Get assessments from database
      const assessments = await sql`
        SELECT 
          id,
          name,
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

      console.log("Raw assessments from DB:", assessments)
      console.log("Assessments type:", typeof assessments)
      console.log("Is array:", Array.isArray(assessments))

      // Ensure we have an array
      const assessmentsArray = Array.isArray(assessments) ? assessments : []

      // Normalize the data to ensure all expected fields exist
      const normalizedAssessments = assessmentsArray.map((assessment) => ({
        id: assessment.id,
        name: assessment.name || "Untitled Assessment",
        job_role_name: assessment.job_role_name || "Unknown Role",
        department_name: assessment.department_name || "Unknown Department",
        completed_skills: assessment.completed_skills || 0,
        total_skills: assessment.total_skills || 0,
        created_at: assessment.created_at ? assessment.created_at.toISOString() : new Date().toISOString(),
        assessment_data: assessment.assessment_data || null,
      }))

      console.log("Normalized assessments:", normalizedAssessments)

      return NextResponse.json({
        assessments: normalizedAssessments,
        isDemoMode: false,
      })
    } catch (dbError) {
      console.error("Database query failed:", dbError)
      return NextResponse.json({
        assessments: [],
        isDemoMode: false,
        error: "Failed to load assessments from database",
      })
    }
  } catch (error) {
    console.error("Get assessments error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        assessments: [],
        isDemoMode: false,
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

    const body = await request.json()
    console.log("Received assessment data:", body)

    const validatedData = assessmentSchema.parse(body)

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json(
        {
          error: "Database not configured",
          isDemoMode: false,
        },
        { status: 500 },
      )
    }

    try {
      // Ensure table exists
      await sql`
        CREATE TABLE IF NOT EXISTS saved_assessments (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          job_role_name VARCHAR(255),
          department_name VARCHAR(255),
          completed_skills INTEGER DEFAULT 0,
          total_skills INTEGER DEFAULT 0,
          assessment_data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `

      // Save the assessment
      const result = await sql`
        INSERT INTO saved_assessments (
          user_id, 
          name, 
          job_role_name,
          department_name,
          completed_skills, 
          total_skills, 
          assessment_data,
          created_at,
          updated_at
        )
        VALUES (
          ${user.id}, 
          ${validatedData.name}, 
          ${validatedData.jobRoleName},
          ${validatedData.departmentName},
          ${validatedData.completedSkills}, 
          ${validatedData.totalSkills}, 
          ${JSON.stringify(validatedData.assessmentData)},
          NOW(),
          NOW()
        )
        RETURNING id, name, created_at
      `

      console.log("Assessment saved successfully:", result[0])

      return NextResponse.json({
        id: result[0].id,
        name: result[0].name,
        created_at: result[0].created_at,
        message: "Assessment saved successfully",
        isDemoMode: false,
      })
    } catch (dbError) {
      console.error("Database save failed:", dbError)
      return NextResponse.json(
        {
          error: "Failed to save assessment to database",
          isDemoMode: false,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Save assessment error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid data",
          details: error.errors,
          isDemoMode: false,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        isDemoMode: false,
      },
      { status: 500 },
    )
  }
}
