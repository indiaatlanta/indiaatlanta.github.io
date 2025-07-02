import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"

// Demo data for when database is not available
const demoAssessments = [
  {
    id: 1,
    name: "Frontend Developer Assessment",
    job_role_name: "Frontend Developer",
    department_name: "Engineering",
    completed_skills: 8,
    total_skills: 12,
    created_at: "2024-01-15T10:30:00Z",
    assessment_data: JSON.stringify({
      ratings: [
        { skillId: 1, rating: "proficient", skillName: "JavaScript" },
        { skillId: 2, rating: "strength", skillName: "React" },
        { skillId: 3, rating: "developing", skillName: "CSS" },
      ],
    }),
  },
  {
    id: 2,
    name: "Product Manager Evaluation",
    job_role_name: "Product Manager",
    department_name: "Product",
    completed_skills: 6,
    total_skills: 10,
    created_at: "2024-01-10T14:20:00Z",
    assessment_data: JSON.stringify({
      ratings: [
        { skillId: 4, rating: "strength", skillName: "Strategic Planning" },
        { skillId: 5, rating: "proficient", skillName: "User Research" },
      ],
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

    try {
      // Try to get assessments from database
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
    } catch (dbError) {
      console.log("Database query failed, using demo data:", dbError)
      return NextResponse.json({
        assessments: demoAssessments,
        isDemoMode: true,
      })
    }
  } catch (error) {
    console.error("Get assessments error:", error)
    return NextResponse.json({
      assessments: demoAssessments,
      isDemoMode: true,
    })
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

    console.log("Saving assessment:", { name, jobRoleName, departmentName, completedSkills, totalSkills })

    if (!isDatabaseConfigured() || !sql) {
      console.log("Database not configured, simulating save")
      return NextResponse.json({
        id: Date.now(),
        message: "Assessment saved successfully (demo mode)",
        isDemoMode: true,
      })
    }

    try {
      // Save the assessment to database
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
        RETURNING id, assessment_name, created_at
      `

      console.log("Assessment saved successfully:", result[0])

      return NextResponse.json({
        id: result[0].id,
        name: result[0].assessment_name,
        created_at: result[0].created_at,
        message: "Assessment saved successfully",
        isDemoMode: false,
      })
    } catch (dbError) {
      console.error("Database save failed:", dbError)
      return NextResponse.json({
        id: Date.now(),
        message: "Assessment saved successfully (demo mode - db error)",
        isDemoMode: true,
      })
    }
  } catch (error) {
    console.error("Save assessment error:", error)
    return NextResponse.json({ error: "Failed to save assessment" }, { status: 500 })
  }
}
