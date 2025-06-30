import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const templateId = Number.parseInt(params.id)

    if (isDatabaseConfigured()) {
      const templates = await sql!`
        SELECT * FROM demonstration_templates WHERE id = ${templateId}
      `

      if (templates.length > 0) {
        return NextResponse.json(templates[0])
      }
    }

    return NextResponse.json({ error: "Template not found" }, { status: 404 })
  } catch (error) {
    console.error("Get demonstration template error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const templateId = Number.parseInt(params.id)
    const body = await request.json()
    const { title, description, category } = body

    if (isDatabaseConfigured()) {
      const oldTemplates = await sql!`SELECT * FROM demonstration_templates WHERE id = ${templateId}`
      const oldTemplate = oldTemplates[0]

      const updatedTemplates = await sql!`
        UPDATE demonstration_templates 
        SET title = ${title}, description = ${description}, category = ${category},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${templateId}
        RETURNING *
      `

      if (updatedTemplates.length > 0) {
        await createAuditLog(user.id, "UPDATE", "demonstration_templates", templateId, oldTemplate, updatedTemplates[0])
        return NextResponse.json(updatedTemplates[0])
      }
    }

    return NextResponse.json({ error: "Template not found" }, { status: 404 })
  } catch (error) {
    console.error("Update demonstration template error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const templateId = Number.parseInt(params.id)

    if (isDatabaseConfigured()) {
      const oldTemplates = await sql!`SELECT * FROM demonstration_templates WHERE id = ${templateId}`
      const oldTemplate = oldTemplates[0]

      const deletedTemplates = await sql!`
        DELETE FROM demonstration_templates WHERE id = ${templateId} RETURNING *
      `

      if (deletedTemplates.length > 0) {
        await createAuditLog(user.id, "DELETE", "demonstration_templates", templateId, oldTemplate, null)
        return NextResponse.json({ success: true })
      }
    }

    return NextResponse.json({ error: "Template not found" }, { status: 404 })
  } catch (error) {
    console.error("Delete demonstration template error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
