import { neon } from "@neondatabase/serverless"

export const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null

export function isDatabaseConfigured(): boolean {
  return !!process.env.DATABASE_URL && !!sql
}

// Test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  if (!sql) return false

  try {
    await sql`SELECT 1`
    return true
  } catch (error) {
    console.error("Database connection test failed:", error)
    return false
  }
}

// Demo data for when database is not configured
export const DEMO_DEPARTMENTS = [
  {
    id: 1,
    name: "Engineering",
    slug: "engineering",
    description: "Software development and technical roles",
    color: "#3B82F6",
  },
  {
    id: 2,
    name: "Product",
    slug: "product",
    description: "Product management and strategy roles",
    color: "#10B981",
  },
  {
    id: 3,
    name: "Design",
    slug: "design",
    description: "User experience and visual design roles",
    color: "#8B5CF6",
  },
  {
    id: 4,
    name: "Marketing",
    slug: "marketing",
    description: "Marketing and growth roles",
    color: "#F59E0B",
  },
]

export const DEMO_ROLES = [
  {
    id: 1,
    title: "Software Engineer I",
    department: "Engineering",
    level: "Junior",
    description: "Entry-level software development position",
  },
  {
    id: 2,
    title: "Software Engineer II",
    department: "Engineering",
    level: "Mid",
    description: "Mid-level software development position",
  },
  {
    id: 3,
    title: "Senior Software Engineer",
    department: "Engineering",
    level: "Senior",
    description: "Senior-level software development position",
  },
  {
    id: 4,
    title: "Product Manager",
    department: "Product",
    level: "Mid",
    description: "Product strategy and roadmap management",
  },
  {
    id: 5,
    title: "Senior Product Manager",
    department: "Product",
    level: "Senior",
    description: "Senior product strategy and team leadership",
  },
  {
    id: 6,
    title: "UX Designer",
    department: "Design",
    level: "Mid",
    description: "User experience design and research",
  },
]

export const DEMO_SKILLS = [
  {
    id: 1,
    name: "JavaScript",
    category: "Programming Languages",
    description: "Modern JavaScript development",
  },
  {
    id: 2,
    name: "React",
    category: "Frontend Frameworks",
    description: "React.js library for building user interfaces",
  },
  {
    id: 3,
    name: "Node.js",
    category: "Backend Technologies",
    description: "Server-side JavaScript runtime",
  },
  {
    id: 4,
    name: "Product Strategy",
    category: "Product Management",
    description: "Strategic product planning and roadmapping",
  },
  {
    id: 5,
    name: "User Research",
    category: "Design",
    description: "Understanding user needs and behaviors",
  },
  {
    id: 6,
    name: "SQL",
    category: "Databases",
    description: "Structured Query Language for databases",
  },
]
