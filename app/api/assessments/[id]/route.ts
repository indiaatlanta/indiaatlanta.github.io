import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid assessment ID",
        },
        { status: 400 },
      )
    }

    const result = await sql`
      DELETE FROM saved_assessments 
      WHERE id = ${id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Assessment not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Assessment deleted successfully",
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete assessment",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid assessment ID",
        },
        { status: 400 },
      )
    }

    const result = await sql`
      SELECT * FROM saved_assessments 
      WHERE id = ${id}
    `

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Assessment not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      assessment: result[0],
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch assessment",
      },
      { status: 500 },
    )
  }
}
