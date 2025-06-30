import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"

// Demo role skills mapping
const demoRoleSkills = [
  // Frontend Developer
  { role_id: 1, skill_name: "JavaScript", required_level: "Advanced", importance: "High" },
  { role_id: 1, skill_name: "React", required_level: "Advanced", importance: "High" },
  { role_id: 1, skill_name: "HTML", required_level: "Advanced", importance: "High" },
  { role_id: 1, skill_name: "CSS", required_level: "Advanced", importance: "High" },
  { role_id: 1, skill_name: "Git", required_level: "Intermediate", importance: "Medium" },

  // Backend Developer
  { role_id: 2, skill_name: "Node.js", required_level: "Advanced", importance: "High" },
  { role_id: 2, skill_name: "Python", required_level: "Advanced", importance: "High" },
  { role_id: 2, skill_name: "SQL", required_level: "Advanced", importance: "High" },
  { role_id: 2, skill_name: "REST APIs", required_level: "Advanced", importance: "High" },
  { role_id: 2, skill_name: "Git", required_level: "Intermediate", importance: "Medium" },

  // Full Stack Developer
  { role_id: 3, skill_name: "JavaScript", required_level: "Advanced", importance: "High" },
  { role_id: 3, skill_name: "React", required_level: "Advanced", importance: "High" },
  { role_id: 3, skill_name: "Node.js", required_level: "Advanced", importance: "High" },
  { role_id: 3, skill_name: "SQL", required_level: "Intermediate", importance: "Medium" },
  { role_id: 3, skill_name: "Git", required_level: "Advanced", importance: "High" },

  // DevOps Engineer
  { role_id: 4, skill_name: "Docker", required_level: "Advanced", importance: "High" },
  { role_id: 4, skill_name: "Kubernetes", required_level: "Advanced", importance: "High" },
  { role_id: 4, skill_name: "AWS", required_level: "Advanced", importance: "High" },
  { role_id: 4, skill_name: "Jenkins", required_level: "Intermediate", importance: "Medium" },
  { role_id: 4, skill_name: "Terraform", required_level: "Intermediate", importance: "Medium" },

  // Data Analyst
  { role_id: 5, skill_name: "Python", required_level: "Advanced", importance: "High" },
  { role_id: 5, skill_name: "SQL", required_level: "Advanced", importance: "High" },
  { role_id: 5, skill_name: "Excel", required_level: "Advanced", importance: "High" },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roleId = searchParams.get("role_id")

    if (isDatabaseConfigured()) {
      let query = `
        SELECT rs.*, s.name as skill_name, s.category as skill_category
        FROM role_skills rs
        JOIN skills s ON rs.skill_id = s.id
      `
      const params = []

      if (roleId) {
        query += ` WHERE rs.role_id = $1`
        params.push(Number.parseInt(roleId))
      }

      query += ` ORDER BY rs.importance DESC, s.name`

      const roleSkills = await sql!`${query}`
      return NextResponse.json(roleSkills)
    }

    // Fallback to demo data
    let filteredRoleSkills = demoRoleSkills
    if (roleId) {
      filteredRoleSkills = demoRoleSkills.filter((rs) => rs.role_id === Number.parseInt(roleId))
    }

    return NextResponse.json(filteredRoleSkills)
  } catch (error) {
    console.error("Get role skills error:", error)
    return NextResponse.json(demoRoleSkills)
  }
}
