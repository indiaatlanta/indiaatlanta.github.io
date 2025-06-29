import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roleId = searchParams.get("roleId")
    const departmentSlug = searchParams.get("department")

    if (!isDatabaseConfigured() || !sql) {
      // Return mock skills for demo mode
      const mockSkills = [
        {
          id: 1,
          skill_name: "JavaScript/TypeScript",
          level: "Intermediate",
          demonstration_description: "Proficient in modern JavaScript and TypeScript development",
          skill_description:
            "Strong understanding of ES6+ features, async/await, and TypeScript type system. Can build complex applications with proper type safety.",
          category_name: "Technical Skills",
          category_color: "blue",
          skill_sort_order: 1,
          category_sort_order: 1,
        },
        {
          id: 2,
          skill_name: "React/Next.js",
          level: "Intermediate",
          demonstration_description: "Experience building React applications with Next.js",
          skill_description:
            "Comfortable with React hooks, component lifecycle, and Next.js features including SSR, SSG, and API routes.",
          category_name: "Technical Skills",
          category_color: "blue",
          skill_sort_order: 2,
          category_sort_order: 1,
        },
        {
          id: 3,
          skill_name: "Problem Solving",
          level: "Intermediate",
          demonstration_description: "Ability to break down complex problems and find solutions",
          skill_description:
            "Can analyze requirements, identify edge cases, and implement effective solutions with proper testing.",
          category_name: "Delivery",
          category_color: "green",
          skill_sort_order: 1,
          category_sort_order: 2,
        },
        {
          id: 4,
          skill_name: "Team Collaboration",
          level: "Advanced",
          demonstration_description: "Works effectively with cross-functional teams",
          skill_description:
            "Excellent communication skills, provides constructive feedback, and mentors junior team members.",
          category_name: "Feedback, Communication & Collaboration",
          category_color: "purple",
          skill_sort_order: 1,
          category_sort_order: 3,
        },
        {
          id: 5,
          skill_name: "Technical Leadership",
          level: "Advanced",
          demonstration_description: "Leads technical decisions and architecture",
          skill_description:
            "Makes strategic technical decisions, defines architecture patterns, and guides team technical direction.",
          category_name: "Leadership",
          category_color: "indigo",
          skill_sort_order: 1,
          category_sort_order: 4,
        },
      ]

      return NextResponse.json(mockSkills)
    }

    let query
    let params: any[] = []

    if (roleId) {
      // Get skills for a specific role
      query = `
        SELECT DISTINCT
          sm.id,
          sm.name as skill_name,
          dt.level,
          dt.description as demonstration_description,
          sm.description as skill_description,
          sc.name as category_name,
          sc.color as category_color,
          sm.sort_order as skill_sort_order,
          sc.sort_order as category_sort_order
        FROM skills_master sm
        JOIN demonstration_templates dt ON sm.id = dt.skill_id
        JOIN demonstration_job_roles djr ON dt.id = djr.demonstration_template_id
        JOIN skill_categories sc ON sm.category_id = sc.id
        WHERE djr.job_role_id = $1
        ORDER BY sc.sort_order, sm.sort_order, sm.name
      `
      params = [roleId]
    } else if (departmentSlug) {
      // Get all skills for a department
      query = `
        SELECT DISTINCT
          sm.id,
          sm.name as skill_name,
          dt.level,
          dt.description as demonstration_description,
          sm.description as skill_description,
          sc.name as category_name,
          sc.color as category_color,
          sm.sort_order as skill_sort_order,
          sc.sort_order as category_sort_order,
          djr.job_role_id
        FROM skills_master sm
        JOIN demonstration_templates dt ON sm.id = dt.skill_id
        JOIN demonstration_job_roles djr ON dt.id = djr.demonstration_template_id
        JOIN job_roles jr ON djr.job_role_id = jr.id
        JOIN departments d ON jr.department_id = d.id
        JOIN skill_categories sc ON sm.category_id = sc.id
        WHERE d.slug = $1
        ORDER BY sc.sort_order, sm.sort_order, sm.name
      `
      params = [departmentSlug]
    } else {
      // Get all skills
      query = `
        SELECT DISTINCT
          sm.id,
          sm.name as skill_name,
          dt.level,
          dt.description as demonstration_description,
          sm.description as skill_description,
          sc.name as category_name,
          sc.color as category_color,
          sm.sort_order as skill_sort_order,
          sc.sort_order as category_sort_order
        FROM skills_master sm
        JOIN demonstration_templates dt ON sm.id = dt.skill_id
        JOIN skill_categories sc ON sm.category_id = sc.id
        ORDER BY sc.sort_order, sm.sort_order, sm.name
      `
    }

    const skills = await sql.unsafe(query, params)

    return NextResponse.json(skills)
  } catch (error) {
    console.error("Get role skills error:", error)

    // Fallback to demo data
    const mockSkills = [
      {
        id: 1,
        skill_name: "JavaScript/TypeScript",
        level: "Intermediate",
        demonstration_description: "Proficient in modern JavaScript and TypeScript development",
        skill_description: "Strong understanding of ES6+ features, async/await, and TypeScript type system.",
        category_name: "Technical Skills",
        category_color: "blue",
        skill_sort_order: 1,
        category_sort_order: 1,
      },
    ]

    return NextResponse.json(mockSkills)
  }
}
