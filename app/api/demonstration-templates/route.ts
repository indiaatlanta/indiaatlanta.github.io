import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit"

// Demo demonstration templates
const demoDemonstrationTemplates = [
  {
    id: 1,
    title: "Build a REST API",
    description: "Create a RESTful API with CRUD operations, authentication, and proper error handling",
    category: "Backend Development",
    created_at: new Date(),
  },
  {
    id: 2,
    title: "Create a React Dashboard",
    description: "Build a responsive dashboard with charts, data tables, and real-time updates",
    category: "Frontend Development",
    created_at: new Date(),
  },
  {
    id: 3,
    title: "Database Design Project",
    description: "Design and implement a normalized database schema with proper relationships",
    category: "Database Management",
    created_at: new Date(),
  },
  {
    id: 4,
    title: "DevOps Pipeline Setup",
    description: "Set up CI/CD pipeline with automated testing and deployment",
    category: "DevOps",
    created_at: new Date(),
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    if (isDatabaseConfigured()) {
      let query = `SELECT * FROM demonstration_templates`
      const params = []

      if (category) {
        query += ` WHERE category = $1`
        params.push(category)
      }

      query += ` ORDER BY category, title`

      const templates = await sql!`${query}`
      return NextResponse.json(templates)
    }

    // Fallback to demo data
    let filteredTemplates = demoDemonstrationTemplates
    if (category) {
      filteredTemplates = demoDemonstrationTemplates.filter((t) => t.category === category)
    }

    return NextResponse.json(filteredTemplates)
  } catch (error) {
    console.error("Get demonstration templates error:", error)
    return NextResponse.json(demoDemonstrationTemplates)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, category } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    if (isDatabaseConfigured()) {
      const newTemplates = await sql!`
        INSERT INTO demonstration_templates (title, description, category)
        VALUES (${title}, ${description || ""}, ${category || ""})
        RETURNING *
      `

      if (newTemplates.length > 0) {
        await createAuditLog(user.id, "CREATE", "demonstration_templates", newTemplates[0].id, null, newTemplates[0])
        return NextResponse.json(newTemplates[0])
      }
    }

    // Fallback response
    const newTemplate = {
      id: Date.now(),
      title,
      description: description || "",
      category: category || "",
      created_at: new Date(),
    }
    return NextResponse.json(newTemplate)
  } catch (error) {
    console.error("Create demonstration template error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
