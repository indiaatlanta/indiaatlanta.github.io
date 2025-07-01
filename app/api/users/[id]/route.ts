import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

    if (password && password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    if (!["user", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json({
        message: "User updated successfully (Demo Mode)",
        user: { id: userId, name, email, role },
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

      // Check if email is already taken by another user
      const emailCheck = await sql`
        SELECT id FROM users WHERE email = ${email} AND id != ${userId}
      `

      if (emailCheck.length > 0) {
        return NextResponse.json({ error: "Email already taken by another user" }, { status: 400 })
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
          updatedUser = await sql`
            UPDATE users 
            SET name = ${name}, email = ${email}, role = ${role}, password_hash = ${passwordHash}
            WHERE id = ${userId}
            RETURNING id, name, email, role, created_at
          `
        } else {
          updatedUser = await sql`
            UPDATE users 
            SET email = ${email}, role = ${role}, password_hash = ${passwordHash}
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
            SET name = ${name}, email = ${email}, role = ${role}
            WHERE id = ${userId}
            RETURNING id, name, email, role, created_at
          `
        } else {
          updatedUser = await sql`
            UPDATE users 
            SET email = ${email}, role = ${role}
            WHERE id = ${userId}
            RETURNING id, email, role, created_at
          `
          updatedUser[0].name = name
        }
      }

      return NextResponse.json({
        message: "User updated successfully",
        user: updatedUser[0],
      })
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in PUT /api/users/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number.parseInt(params.id)

    // Prevent admin from deleting themselves
    if (user.id === userId) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 })
    }

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json({ message: "User deleted successfully (Demo Mode)" })
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
      await sql`DELETE FROM users WHERE id = ${userId}`

      return NextResponse.json({ message: "User deleted successfully" })
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in DELETE /api/users/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
