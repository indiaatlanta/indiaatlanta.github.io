import { NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function GET() {
  try {
    if (!isDatabaseConfigured() || !sql) {
      // Return mock departments for demo mode
      const mockDepartments = [
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
      return NextResponse.json({ departments: mockDepartments, isDemoMode: true })
    }

    const departments = await sql`
      SELECT id, name, slug, description, color
      FROM departments
      ORDER BY name
    `

    return NextResponse.json({ departments, isDemoMode: false })
  } catch (error) {
    console.error("Get departments error:", error)

    // Fallback to demo data on error
    const mockDepartments = [
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
    ]
    return NextResponse.json({ departments: mockDepartments, isDemoMode: true })
  }
}
