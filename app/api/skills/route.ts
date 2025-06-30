import { NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"

// Demo skills for when database is not configured
const demoSkills = [
  {
    id: 1,
    name: "React Development",
    category: "Frontend",
    level: 4,
    description: "Building user interfaces with React",
  },
  {
    id: 2,
    name: "API Design",
    category: "Backend",
    level: 3,
    description: "Designing RESTful APIs",
  },
  {
    id: 3,
    name: "User Research",
    category: "Design",
    level: 5,
    description: "Conducting user interviews and surveys",
  },
  {
    id: 4,
    name: "Data Analysis",
    category: "Analytics",
    level: 4,
    description: "Analyzing business metrics",
  },
  {
    id: 5,
    name: "Project Management",
    category: "Leadership",
    level: 3,
    description: "Managing cross-functional projects",
  },
  {
    id: 6,
    name: "JavaScript",
    category: "Programming",
    level: 5,
    description: "Core JavaScript programming",
  },
  {
    id: 7,
    name: "TypeScript",
    category: "Programming",
    level: 4,
    description: "Typed JavaScript development",
  },
  {
    id: 8,
    name: "Node.js",
    category: "Backend",
    level: 4,
    description: "Server-side JavaScript runtime",
  },
  {
    id: 9,
    name: "Database Design",
    category: "Backend",
    level: 3,
    description: "Designing efficient database schemas",
  },
  {
    id: 10,
    name: "UI/UX Design",
    category: "Design",
    level: 4,
    description: "User interface and experience design",
  },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const category = searchParams.get("category")

    let skills = []
    let total = 0

    // Try to fetch from database if configured
    if (isDatabaseConfigured()) {
      try {
        let query = `
          SELECT id, name, category, description, level
          FROM skills_master
        `
        let countQuery = `SELECT COUNT(*) as total FROM skills_master`
        const params = []

        if (category) {
          query += ` WHERE category = $${params.length + 1}`
          countQuery += ` WHERE category = $${params.length + 1}`
          params.push(category)
        }

        query += ` ORDER BY category, name LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
        params.push(limit, offset)

        const [skillsResult, countResult] = await Promise.all([
          sql!(query, ...params),
          sql!(countQuery, ...(category ? [category] : [])),
        ])

        skills = skillsResult
        total = countResult[0].total

        console.log("Fetched skills from database:", skills.length)
      } catch (dbError) {
        console.error("Database error fetching skills:", dbError)
        // Fall back to demo data
        let filteredSkills = demoSkills
        if (category) {
          filteredSkills = demoSkills.filter((skill) => skill.category === category)
        }
        skills = filteredSkills.slice(offset, offset + limit)
        total = filteredSkills.length
      }
    } else {
      // Use demo data when database is not configured
      let filteredSkills = demoSkills
      if (category) {
        filteredSkills = demoSkills.filter((skill) => skill.category === category)
      }
      skills = filteredSkills.slice(offset, offset + limit)
      total = filteredSkills.length
      console.log("Using demo skills data")
    }

    return NextResponse.json({
      skills,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Error fetching skills:", error)
    return NextResponse.json(
      {
        skills: demoSkills.slice(0, 5),
        total: demoSkills.length,
        limit: 5,
        offset: 0,
      },
      { status: 200 },
    )
  }
}
