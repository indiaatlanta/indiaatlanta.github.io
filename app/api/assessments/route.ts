import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { z } from "zod"

const saveAssessmentSchema = z.object({
  roleId: z.number().int().positive("Invalid role ID"),
  assessmentName: z.string().min(1, "Assessment name is required").max(255, "Name too long"),
  assessmentData: z.object({
    ratings: z.array(
      z.object({
        skillId: z.number().int().positive(),
        rating: z.string().min(1),
      }),
    ),
    roleName: z.string(),
    roleCode: z.string(),
    departmentName: z.string(),
    completedAt: z.string(),
  }),
})

// Demo data for when database is not available
const demoAssessments = [
  {
    id: 1,
    user_id: 1,
    role_id: 1,
    assessment_name: "Frontend Developer Assessment - Dec 2024",
    assessment_data: {
      ratings: [
        { skillId: 1, rating: "proficient" },
        { skillId: 2, rating: "developing" },
        { skillId: 3, rating: "strength" },
      ],
      roleName: "Frontend Developer",
      roleCode: "FE-L2",
      departmentName: "Engineering",
      completedAt: "2024-12-15T10:30:00Z",
    },
    created_at: "2024-12-15T10:30:00Z",
    updated_at: "2024-12-15T10:30:00Z",
  },
  {
    id: 2,
    user_id: 1,
    role_id: 2,
    assessment_name: "Senior Developer Assessment - Nov 2024",
    assessment_data: {
      ratings: [
        { skillId: 4, rating: "strength" },
        { skillId: 5, rating: "proficient" },
        { skillId: 6, rating: "developing" },
      ],
      roleName: "Senior Frontend Developer",
      roleCode: "FE-L3",
      departmentName: "Engineering",
      completedAt: "2024-11-20T14:15:00Z",
    },
    created_at: "2024-11-20T14:15:00Z",
    updated_at: "2024-11-20T14:15:00Z",
  },
]

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isDatabaseConfigured() || !sql) {
      console.log("Database not configured, returning demo assessments")
      return NextResponse.json({
        assessments: demoAssessments.filter((a) => a.user_id === user.id),
        isDemoMode: true,
      })
    }

    try {
      const assessments = await sql`
        SELECT 
          sa.id,
          sa.user_id,
          sa.role_id,
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
        WHERE sa.user_id = ${user.id}
        ORDER BY sa.created_at DESC
      `

      return NextResponse.json({
        assessments: assessments.map((assessment) => ({
          ...assessment,
          assessment_data:
            typeof assessment.assessment_data === "string"
              ? JSON.parse(assessment.assessment_data)
              : assessment.assessment_data,
        })),
        isDemoMode: false,
      })
    } catch (error) {
      console.error("Database error, falling back to demo data:", error.message)
      return NextResponse.json({
        assessments: demoAssessments.filter((a) => a.user_id === user.id),
        isDemoMode: true,
      })
    }
  } catch (error) {
    console.error("Error fetching assessments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = saveAssessmentSchema.parse(body)

    if (!isDatabaseConfigured() || !sql) {
      console.log("Database not configured, simulating save")
      const newAssessment = {
        id: Date.now(),
        user_id: user.id,
        role_id: validatedData.roleId,
        assessment_name: validatedData.assessmentName,
        assessment_data: validatedData.assessmentData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      return NextResponse.json({
        assessment: newAssessment,
        message: "Assessment saved successfully (demo mode)",
        isDemoMode: true,
      })
    }

    try {
      const result = await sql`
        INSERT INTO saved_assessments (user_id, role_id, assessment_name, assessment_data)
        VALUES (${user.id}, ${validatedData.roleId}, ${validatedData.assessmentName}, ${JSON.stringify(validatedData.assessmentData)})
        RETURNING id, user_id, role_id, assessment_name, assessment_data, created_at, updated_at
      `

      return NextResponse.json({
        assessment: {
          ...result[0],
          assessment_data:
            typeof result[0].assessment_data === "string"
              ? JSON.parse(result[0].assessment_data)
              : result[0].assessment_data,
        },
        message: "Assessment saved successfully",
        isDemoMode: false,
      })
    } catch (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to save assessment" }, { status: 500 })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 })
    }
    console.error("Error saving assessment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
