import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { logAuditEvent } from "@/lib/audit"

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }

  try {
    const { skills } = await request.json()

    if (!Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json({ error: "Invalid skills data" }, { status: 400 })
    }

    let successCount = 0
    const errors: string[] = []

    for (const skill of skills) {
      try {
        // First, check if skill exists in skills_master
        let skillMasterId
        const existingSkill = await sql!`
          SELECT id FROM skills_master 
          WHERE name = ${skill.name} AND category_id = ${skill.categoryId}
        `

        if (existingSkill.length > 0) {
          skillMasterId = existingSkill[0].id
        } else {
          // Create new skill in skills_master
          const newSkill = await sql!`
            INSERT INTO skills_master (name, description, category_id, sort_order)
            VALUES (${skill.name}, ${skill.fullDescription || skill.description}, ${skill.categoryId}, ${skill.sortOrder || 0})
            RETURNING id
          `
          skillMasterId = newSkill[0].id
        }

        // Create skill demonstration
        await sql!`
          INSERT INTO skill_demonstrations (skill_id, job_role_id, level, description, sort_order)
          VALUES (${skillMasterId}, ${skill.jobRoleId}, ${skill.level}, ${skill.description}, ${skill.sortOrder || 0})
          ON CONFLICT (skill_id, job_role_id) 
          DO UPDATE SET 
            level = EXCLUDED.level,
            description = EXCLUDED.description,
            sort_order = EXCLUDED.sort_order,
            updated_at = CURRENT_TIMESTAMP
        `

        successCount++

        // Log audit event
        await logAuditEvent({
          userId: 1, // Default admin user for bulk operations
          action: "CREATE",
          tableName: "skill_demonstrations",
          recordId: skillMasterId,
          newValues: skill,
        })
      } catch (error) {
        console.error(`Error importing skill ${skill.name}:`, error)
        errors.push(`Failed to import ${skill.name}: ${error}`)
      }
    }

    return NextResponse.json({
      count: successCount,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error("Bulk import error:", error)
    return NextResponse.json({ error: "Failed to import skills" }, { status: 500 })
  }
}
