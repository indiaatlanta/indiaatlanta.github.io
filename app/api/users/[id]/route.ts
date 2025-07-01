import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is admin
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number.parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const body = await request.json()
    const { name, email, role, password } = body

    // Validation
    if (!name || !email || !role) {
      return NextResponse.json({ error: "Name, email, and role are required" }, { status: 400 })
    }

    if (!email.includes("@")) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    if (!["admin", "user"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    if (password && password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    if (!isDatabaseConfigured() || !sql) {
      console.log("Database not configured, simulating user update")
      return NextResponse.json({
        user: { id: userId, name, email, role, updated_at: new Date().toISOString() },
      })
    }

    try {
      // Check if user exists
      const existingUsers = await sql`
        SELECT id FROM users WHERE id = ${userId}
      `

      if (existingUsers.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Check if email is taken by another user
      const emailCheck = await sql`
        SELECT id FROM users WHERE email = ${email} AND id != ${userId}
      `

      if (emailCheck.length > 0) {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 })
      }

      // Check if name column exists
      const columnCheck = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'name'
      `

      const hasNameColumn = columnCheck.length > 0

      let updatedUser
      if (password) {
        // Update with password
        const passwordHash = await bcrypt.hash(password, 12)

        if (hasNameColumn) {
          const result = await sql`
            UPDATE users 
            SET email = ${email}, name = ${name}, role = ${role}, password_hash = ${passwordHash}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ${userId}
            RETURNING id, email, name, role, updated_at
          `
          updatedUser = result[0]
        } else {
          const result = await sql`
            UPDATE users 
            SET email = ${email}, role = ${role}, password_hash = ${passwordHash}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ${userId}
            RETURNING id, email, role, updated_at
          `
          updatedUser = { ...result[0], name }
        }
      } else {
        // Update without password
        if (hasNameColumn) {
          const result = await sql`
            UPDATE users 
            SET email = ${email}, name = ${name}, role = ${role}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ${userId}
            RETURNING id, email, name, role, updated_at
          `
          updatedUser = result[0]
        } else {
          const result = await sql`
            UPDATE users 
            SET email = ${email}, role = ${role}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ${userId}
            RETURNING id, email, role, updated_at
          `
          updatedUser = { ...result[0], name }
        }
      }

      return NextResponse.json({ user: updatedUser })
    } catch (dbError) {
      console.error("Database error updating user:", dbError.message)
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is admin
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number.parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // Prevent admin from deleting themselves
    if (currentUser.id === userId) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    if (!isDatabaseConfigured() || !sql) {
      console.log("Database not configured, simulating user deletion")
      return NextResponse.json({ success: true })
    }

    try {
      // Check if user exists
      const existingUsers = await sql`
        SELECT id FROM users WHERE id = ${userId}
      `

      if (existingUsers.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Delete user
      await sql`
        DELETE FROM users WHERE id = ${userId}
      `

      return NextResponse.json({ success: true })
    } catch (dbError) {
      console.error("Database error deleting user:", dbError.message)
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
