import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit"

// Demo job roles data
const demoJobRoles = [
  {
    id: 1,
    title: "Frontend Developer",
    department_id: 1,
    department_name: "Engineering",
    description: "Develop user-facing web applications",
    requirements: "React, JavaScript, CSS, HTML",
    created_at: new Date(),
  },
  {
    id: 2,
    title: "Backend Developer",
    department_id: 1,
    department_name: "Engineering",
    description: "Develop server-side applications and APIs",
    requirements: "Node.js, Python, SQL, REST APIs",
    created_at: new Date(),
  },
  {
    id: 3,
    title: "Full Stack Developer",
    department_id: 1,
    department_name: "Engineering",
    description: "Develop both frontend and backend applications",
    requirements: "React, Node.js, JavaScript, SQL, Git",
    created_at: new Date(),
  },
  {
    id: 4,
    title: "DevOps Engineer",
    department_id: 1,
    department_name: "Engineering",
    description: "Manage infrastructure and deployment pipelines",
    requirements: "Docker, Kubernetes, AWS, Jenkins, Terraform",
    created_at: new Date(),
  },
  {
    id: 5,
    title: "Data Analyst",
    department_id: 2,
    department_name: "Data Science",
    description: "Analyze data to provide business insights",
    requirements: "Python, SQL, Excel, Tableau, Statistics",
    created_at: new Date(),
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get("department_id")

    if (isDatabaseConfigured()) {
      let query = `
        SELECT jr.*, d.name as department_name 
        FROM job_roles jr
        LEFT JOIN departments d ON jr.department_id = d.id
      `
      const params = []

      if (departmentId) {
        query += ` WHERE jr.department_id = $1`
        params.push(Number.parseInt(departmentId))
      }

      query += ` ORDER BY jr.title`

      const roles = await sql!`${query}`
      return NextResponse.json(roles)
    }

    // Fallback to demo data
    let filteredRoles = demoJobRoles
    if (departmentId) {
      filteredRoles = demoJobRoles.filter((role) => role.department_id === Number.parseInt(departmentId))
    }

    return NextResponse.json(filteredRoles)
  } catch (error) {
    console.error("Get job roles error:", error)
    return NextResponse.json(demoJobRoles)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, department_id, description, requirements } = body

    if (!title || !department_id) {
      return NextResponse.json({ error: "Title and department ID are required" }, { status: 400 })
    }

    if (isDatabaseConfigured()) {
      const newRoles = await sql!`
        INSERT INTO job_roles (title, department_id, description, requirements)
        VALUES (${title}, ${department_id}, ${description || ""}, ${requirements || ""})
        RETURNING *
      `

      if (newRoles.length > 0) {
        await createAuditLog(user.id, "CREATE", "job_roles", newRoles[0].id, null, newRoles[0])
        return NextResponse.json(newRoles[0])
      }
    }

    // Fallback response
    const newRole = {
      id: Date.now(),
      title,
      department_id,
      description: description || "",
      requirements: requirements || "",
      created_at: new Date(),
    }
    return NextResponse.json(newRole)
  } catch (error) {
    console.error("Create job role error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
