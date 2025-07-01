import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import bcrypt from "bcryptjs"
import { verifySession } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin session
    const session = await verifySession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const userId = Number.parseInt(params.id)
    const body = await request.json()
    const { name, email, role, password } = body

    // Validation
    if (!name || !email || !role) {
      return NextResponse.json({ error: "Name, email, and role are required" }, { status: 400 })
    }

    if (!email.includes("@")) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    if (!["user", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await sql`
      SELECT id FROM users WHERE id = ${userId}
    `

    if (existingUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if email is already taken by another user
    const emailCheck = await sql`
      SELECT id FROM users WHERE email = ${email} AND id != ${userId}
    `

    if (emailCheck.length > 0) {
      return NextResponse.json({ error: "Email already taken by another user" }, { status: 400 })
    }

    // Check if the new columns exist
    const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('name', 'last_login')
    `

    const hasNameColumn = columnCheck.some((col: any) => col.column_name === "name")

    let updatedUser
    if (password) {
      // Update with password
      if (password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
      }

      const passwordHash = await bcrypt.hash(password, 12)

      if (hasNameColumn) {
        updatedUser = await sql`
          UPDATE users 
          SET email = ${email}, role = ${role}, name = ${name}, password_hash = ${passwordHash}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${userId}
          RETURNING id, email, name, role, created_at
        `
      } else {
        updatedUser = await sql`
          UPDATE users 
          SET email = ${email}, role = ${role}, password_hash = ${passwordHash}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${userId}
          RETURNING id, email, role, created_at
        `
        updatedUser[0].name = name
      }
    } else {
      // Update without password
      if (hasNameColumn) {
        updatedUser = await sql`
          UPDATE users 
          SET email = ${email}, role = ${role}, name = ${name}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${userId}
          RETURNING id, email, name, role, created_at
        `
      } else {
        updatedUser = await sql`
          UPDATE users 
          SET email = ${email}, role = ${role}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${userId}
          RETURNING id, email, role, created_at
        `
        updatedUser[0].name = name
      }
    }

    return NextResponse.json(updatedUser[0])
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin session
    const session = await verifySession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const userId = Number.parseInt(params.id)

    // Prevent admin from deleting their own account
    if (session.userId === userId) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await sql`
      SELECT id FROM users WHERE id = ${userId}
    `

    if (existingUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete user
    await sql`
      DELETE FROM users WHERE id = ${userId}
    `

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
