import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin()

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const { skills } = await request.json()

    if (!Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json({ error: "Invalid skills data" }, { status: 400 })
    }

    let importedCount = 0

    for (const skillData of skills) {
      try {
        // Validate required fields
        if (!skillData.name || !skillData.jobRoleId) {
          console.warn("Skipping skill with missing required fields:", skillData)
          continue
        }

        // Check if skill master exists or create it
        const skillMaster = await sql`
          SELECT id FROM skills_master WHERE name = ${skillData.name}
        `

        let skillId
        if (skillMaster.length === 0) {
          // Create new skill master
          const newSkillMaster = await sql`
            INSERT INTO skills_master (name, category_id, description)
            VALUES (
              ${skillData.name}, 
              ${skillData.categoryId || 1}, 
              ${skillData.description || ""}
            )
            RETURNING id
          `
          skillId = newSkillMaster[0].id
        } else {
          skillId = skillMaster[0].id
        }

        // Check if demonstration already exists
        const existingDemo = await sql`
          SELECT id FROM skill_demonstrations 
          WHERE skill_id = ${skillId} AND job_role_id = ${skillData.jobRoleId}
        `

        if (existingDemo.length === 0) {
          // Create skill demonstration
          const result = await sql`
            INSERT INTO skill_demonstrations (
              skill_id,
              job_role_id,
              level,
              description,
              full_description,
              sort_order
            )
            VALUES (
              ${skillId},
              ${skillData.jobRoleId},
              ${skillData.level || "L1"},
              ${skillData.description || ""},
              ${skillData.fullDescription || skillData.description || ""},
              ${skillData.sortOrder || 0}
            )
            RETURNING id
          `

          // Create audit log
          await createAuditLog({
            userId: user.id,
            tableName: "skill_demonstrations",
            recordId: result[0].id,
            action: "CREATE",
            newValues: skillData,
          })

          importedCount++
        }
      } catch (skillError) {
        console.error("Error importing skill:", skillData, skillError)
        // Continue with next skill
      }
    }

    return NextResponse.json({
      success: true,
      count: importedCount,
      message: `Successfully imported ${importedCount} skills`,
    })
  } catch (error) {
    console.error("Bulk import error:", error)
    return NextResponse.json({ error: "Failed to import skills" }, { status: 500 })
  }
}
