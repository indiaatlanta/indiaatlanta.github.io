import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const templateId = Number.parseInt(params.id)

    if (isDatabaseConfigured()) {
      const jobRoles = await sql!`
        SELECT jr.*, djr.is_required, djr.weight
        FROM job_roles jr
        JOIN demonstration_job_roles djr ON jr.id = djr.job_role_id
        WHERE djr.demonstration_id = ${templateId}
        ORDER BY jr.title
      `

      return NextResponse.json(jobRoles)
    }

    // Fallback to demo data
    return NextResponse.json([])
  } catch (error) {
    console.error("Get demonstration job roles error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const templateId = Number.parseInt(params.id)
    const body = await request.json()
    const { job_role_id, is_required, weight } = body

    if (!job_role_id) {
      return NextResponse.json({ error: "Job role ID is required" }, { status: 400 })
    }

    if (isDatabaseConfigured()) {
      const newRelations = await sql!`
        INSERT INTO demonstration_job_roles (demonstration_id, job_role_id, is_required, weight)
        VALUES (${templateId}, ${job_role_id}, ${is_required || false}, ${weight || 1})
        ON CONFLICT (demonstration_id, job_role_id) 
        DO UPDATE SET 
          is_required = EXCLUDED.is_required,
          weight = EXCLUDED.weight
        RETURNING *
      `

      if (newRelations.length > 0) {
        return NextResponse.json(newRelations[0])
      }
    }

    return NextResponse.json({ error: "Failed to create relation" }, { status: 500 })
  } catch (error) {
    console.error("Create demonstration job role relation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
