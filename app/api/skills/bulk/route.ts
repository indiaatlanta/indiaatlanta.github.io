import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { bulkSkillsSchema } from "@/lib/validation"
import { createAuditLog } from "@/lib/audit"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin()
    const body = await request.json()
    const { skills } = bulkSkillsSchema.parse(body)

    const insertedSkills = []

    // Insert skills one by one (in production, you might want to use a transaction)
    for (const skillData of skills) {
      const result = await sql`
        INSERT INTO skills (job_role_id, category_id, name, level, description, full_description, sort_order)
        VALUES (${skillData.jobRoleId}, ${skillData.categoryId}, ${skillData.name}, ${skillData.level}, ${skillData.description}, ${skillData.fullDescription}, ${skillData.sortOrder || 0})
        RETURNING *
      `

      const newSkill = result[0]
      insertedSkills.push(newSkill)

      // Create audit log for each skill
      await createAuditLog({
        userId: user.id,
        tableName: "skills",
        recordId: newSkill.id,
        action: "CREATE",
        newValues: skillData,
      })
    }

    return NextResponse.json(
      {
        success: true,
        count: insertedSkills.length,
        skills: insertedSkills,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Bulk create skills error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
