import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { z } from "zod"

const assessmentSchema = z.object({
  name: z.string().min(1, "Assessment name is required").max(255, "Name too long"),
  jobRoleId: z.number().int().positive("Invalid job role"),
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
      // Return demo data
      return NextResponse.json({
        assessments: [
          {
            id: 1,
            name: "Frontend Developer Assessment",
            job_role_name: "Frontend Developer",
            department_name: "Engineering",
            completed_skills: 15,
            total_skills: 20,
            created_at: new Date().toISOString(),
          },
          {
            id: 2,
            name: "Senior Engineer Review",
            job_role_name: "Senior Engineer",
            department_name: "Engineering",
            completed_skills: 25,
            total_skills: 30,
            created_at: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
        isDemoMode: true,
      })
    }

    const assessments = await sql`
      SELECT 
        id,
        name,
        job_role_name,
        department_name,
        completed_skills,
        total_skills,
        created_at
      FROM saved_assessments 
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 10
    `

    return NextResponse.json({
      assessments,
      isDemoMode: false,
    })
  } catch (error) {
    console.error("Get assessments error:", error)
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
    console.log("Received assessment data:", body)

    const validatedData = assessmentSchema.parse(body)

    if (!isDatabaseConfigured() || !sql) {
      // Demo mode - simulate success
      console.log("Demo mode: Simulating assessment save")
      return NextResponse.json({
        id: Math.floor(Math.random() * 1000),
        message: "Assessment saved successfully (demo mode)",
        isDemoMode: true,
      })
    }

    const result = await sql`
      INSERT INTO saved_assessments (
        user_id,
        name,
        job_role_id,
        job_role_name,
        department_name,
        assessment_data,
        completed_skills,
        total_skills
      ) VALUES (
        ${user.id},
        ${validatedData.name},
        ${validatedData.jobRoleId},
        ${validatedData.jobRoleName},
        ${validatedData.departmentName},
        ${JSON.stringify(validatedData.assessmentData)},
        ${validatedData.completedSkills},
        ${validatedData.totalSkills}
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
  } catch (error) {
    console.error("Save assessment error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
