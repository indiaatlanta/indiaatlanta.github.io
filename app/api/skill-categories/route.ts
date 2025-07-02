import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    if (!isDatabaseConfigured() || !sql) {
      // Return demo data
      return NextResponse.json({
        categories: [
          { id: 1, name: "Technical Skills", color: "#3B82F6", sort_order: 1 },
          { id: 2, name: "Leadership", color: "#10B981", sort_order: 2 },
          { id: 3, name: "Communication", color: "#F59E0B", sort_order: 3 },
          { id: 4, name: "Problem Solving", color: "#EF4444", sort_order: 4 },
        ],
        isDemoMode: true,
      })
    }

    const categories = await sql`
      SELECT id, name, color, sort_order
      FROM skill_categories
      ORDER BY sort_order, name
    `

    return NextResponse.json({
      categories,
      isDemoMode: false,
    })
  } catch (error) {
    console.error("Get skill categories error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
