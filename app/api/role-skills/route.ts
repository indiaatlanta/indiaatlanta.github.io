import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    if (!sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const roleId = searchParams.get("roleId")
    const departmentSlug = searchParams.get("departmentSlug")

    if (roleId) {
      // Get skills for a specific role
      const roleSkills = await sql`
        SELECT 
          rs.id,
          rs.required_level,
          rs.is_required,
          sm.id as skill_id,
          sm.name as skill_name,
          sm.category as skill_category,
          sm.description as skill_description
        FROM role_skills rs
        JOIN skills_master sm ON rs.skill_id = sm.id
        WHERE rs.role_id = ${roleId}
        ORDER BY sm.category, sm.name
      `

      return NextResponse.json({ roleSkills })
    }

    if (departmentSlug) {
      // Get all skills for roles in a department (skills matrix)
      const departmentSkills = await sql`
        SELECT DISTINCT
          sm.id as skill_id,
          sm.name as skill_name,
          sm.category as skill_category,
          sm.description as skill_description,
          jr.id as role_id,
          jr.title as role_title,
          jr.level as role_level,
          rs.required_level,
          rs.is_required
        FROM skills_master sm
        LEFT JOIN role_skills rs ON sm.id = rs.skill_id
        LEFT JOIN job_roles jr ON rs.role_id = jr.id
        LEFT JOIN departments d ON jr.department_id = d.id
        WHERE d.slug = ${departmentSlug} OR d.slug IS NULL
        ORDER BY sm.category, sm.name, jr.level
      `

      // Group skills by category and role
      const skillsMatrix: Record<string, any> = {}
      const roles: Record<number, any> = {}

      departmentSkills.forEach((row: any) => {
        // Track roles
        if (row.role_id && !roles[row.role_id]) {
          roles[row.role_id] = {
            id: row.role_id,
            title: row.role_title,
            level: row.role_level,
          }
        }

        // Track skills by category
        if (!skillsMatrix[row.skill_category]) {
          skillsMatrix[row.skill_category] = {}
        }

        if (!skillsMatrix[row.skill_category][row.skill_id]) {
          skillsMatrix[row.skill_category][row.skill_id] = {
            id: row.skill_id,
            name: row.skill_name,
            category: row.skill_category,
            description: row.skill_description,
            roles: {},
          }
        }

        // Add role requirement if it exists
        if (row.role_id && row.required_level) {
          skillsMatrix[row.skill_category][row.skill_id].roles[row.role_id] = {
            required_level: row.required_level,
            is_required: row.is_required,
          }
        }
      })

      return NextResponse.json({
        skillsMatrix,
        roles: Object.values(roles),
      })
    }

    // Get all skills
    const allSkills = await sql`
      SELECT 
        id,
        name,
        category,
        description
      FROM skills_master
      ORDER BY category, name
    `

    return NextResponse.json({ skills: allSkills })
  } catch (error) {
    console.error("Error fetching role skills:", error)
    return NextResponse.json({ error: "Failed to fetch role skills" }, { status: 500 })
  }
}
