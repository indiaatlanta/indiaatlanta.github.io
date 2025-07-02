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
      // First, let's check what columns exist in the saved_assessments table
      const tableInfo = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'saved_assessments'
        ORDER BY ordinal_position
      `

      console.log(
        "Available columns in saved_assessments:",
        tableInfo.map((col) => col.column_name),
      )

      // Get assessments from database using only the columns that exist
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

      return NextResponse.json({
        assessments: assessments.map((assessment) => ({
          ...assessment,
          created_at: assessment.created_at.toISOString(),
        })),
        isDemoMode: false,
      })
    } catch (dbError) {
      console.error("Database query failed:", dbError)

      // Try alternative column names
      try {
        const assessments = await sql`
          SELECT 
            id,
            assessment_name as name,
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
      } catch (secondError) {
        console.error("Second attempt failed:", secondError)

        // Try with minimal columns that should exist
        try {
          const assessments = await sql`
            SELECT 
              id,
              name,
              created_at
            FROM saved_assessments
            WHERE user_id = ${user.id}
            ORDER BY created_at DESC
          `

          return NextResponse.json({
            assessments: assessments.map((assessment) => ({
              ...assessment,
              job_role_name: "Unknown Role",
              department_name: "Unknown Department",
              completed_skills: 0,
              total_skills: 0,
              assessment_data: "{}",
              created_at: assessment.created_at.toISOString(),
            })),
            isDemoMode: false,
          })
        } catch (finalError) {
          console.error("All attempts failed:", finalError)
          return NextResponse.json({
            assessments: [],
            isDemoMode: false,
            error: "Failed to load assessments from database",
          })
        }
      }
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
      // Try to save with the expected column names
      const result = await sql`
        INSERT INTO saved_assessments (
          user_id, 
          name, 
          job_role_name,
          department_name,
          completed_skills, 
          total_skills, 
          assessment_data,
          created_at
        )
        VALUES (
          ${user.id}, 
          ${validatedData.name}, 
          ${validatedData.jobRoleName},
          ${validatedData.departmentName},
          ${validatedData.completedSkills}, 
          ${validatedData.totalSkills}, 
          ${JSON.stringify(validatedData.assessmentData)},
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
    } catch (insertError) {
      console.error("Insert failed, trying with assessment_name:", insertError)

      // Try with assessment_name instead of name
      try {
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
            ${validatedData.name}, 
            ${validatedData.jobRoleName},
            ${validatedData.departmentName},
            ${validatedData.completedSkills}, 
            ${validatedData.totalSkills}, 
            ${JSON.stringify(validatedData.assessmentData)},
            NOW()
          )
          RETURNING id, assessment_name as name, created_at
        `

        return NextResponse.json({
          id: result[0].id,
          name: result[0].name,
          created_at: result[0].created_at,
          message: "Assessment saved successfully",
          isDemoMode: false,
        })
      } catch (finalError) {
        console.error("All insert attempts failed:", finalError)
        return NextResponse.json(
          {
            error: "Failed to save assessment to database",
            isDemoMode: false,
          },
          { status: 500 },
        )
      }
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
