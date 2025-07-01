import { NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function GET() {
  try {
    if (!isDatabaseConfigured() || !sql) {
      // Return mock data for demo mode
      return NextResponse.json({
        roles: [
          { id: 1, name: "Junior Engineer", code: "E1", level: 1, department_name: "Engineering", skill_count: 25 },
          { id: 2, name: "Software Engineer", code: "E2", level: 2, department_name: "Engineering", skill_count: 30 },
          { id: 3, name: "Senior Engineer", code: "E3", level: 3, department_name: "Engineering", skill_count: 35 },
          { id: 4, name: "Lead Engineer", code: "E4", level: 4, department_name: "Engineering", skill_count: 40 },
          { id: 5, name: "Principal Engineer", code: "E5", level: 5, department_name: "Engineering", skill_count: 45 },
        ],
        isDemoMode: true,
      })
    }

    // Get all roles that have skill demonstrations
    const roles = await sql`
      SELECT 
        jr.id,
        jr.name,
        jr.code,
        jr.level,
        jr.salary_min,
        jr.salary_max,
        jr.location_type,
        d.name as department_name,
        COUNT(sd.id) as skill_count
      FROM job_roles jr
      JOIN departments d ON jr.department_id = d.id
      LEFT JOIN skill_demonstrations sd ON jr.id = sd.job_role_id
      GROUP BY jr.id, jr.name, jr.code, jr.level, jr.salary_min, jr.salary_max, jr.location_type, d.name
      HAVING COUNT(sd.id) > 0
      ORDER BY d.name, jr.level, jr.name
    `

    return NextResponse.json({
      roles,
      isDemoMode: false,
    })
  } catch (error) {
    console.error("Error fetching roles:", error)

    // Fallback to old structure
    try {
      if (sql) {
        const fallbackRoles = await sql`
          SELECT 
            jr.id,
            jr.name,
            jr.code,
            jr.level,
            jr.salary_min,
            jr.salary_max,
            jr.location_type,
            d.name as department_name,
            COUNT(s.id) as skill_count
          FROM job_roles jr
          JOIN departments d ON jr.department_id = d.id
          LEFT JOIN skills s ON jr.id = s.job_role_id
          GROUP BY jr.id, jr.name, jr.code, jr.level, jr.salary_min, jr.salary_max, jr.location_type, d.name
          HAVING COUNT(s.id) > 0
          ORDER BY d.name, jr.level, jr.name
        `

        return NextResponse.json({
          roles: fallbackRoles,
          isDemoMode: false,
        })
      }
    } catch (fallbackError) {
      console.error("Error with fallback query:", fallbackError)
    }

    // Return mock data as final fallback
    return NextResponse.json({
      roles: [
        { id: 1, name: "Junior Engineer", code: "E1", level: 1, department_name: "Engineering", skill_count: 25 },
        { id: 2, name: "Software Engineer", code: "E2", level: 2, department_name: "Engineering", skill_count: 30 },
        { id: 3, name: "Senior Engineer", code: "E3", level: 3, department_name: "Engineering", skill_count: 35 },
      ],
      isDemoMode: true,
    })
  }
}
