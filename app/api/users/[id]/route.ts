import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated and is admin
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number.parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const { name, email, role, password } = await request.json()

    // Validate required fields (password is optional for updates)
    if (!name || !email || !role) {
      return NextResponse.json({ error: "Name, email, and role are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate role
    if (!["user", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Validate password if provided
    if (password && password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    // Return success for demo mode
    if (!isDatabaseConfigured() || !sql) {
      console.log("Database not configured, simulating user update")
      return NextResponse.json({
        id: userId,
        name,
        email,
        role,
        updated_at: new Date().toISOString(),
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
        SELECT id FROM users WHERE email = ${email.toLowerCase()} AND id != ${userId}
      `

      if (emailCheck.length > 0) {
        return NextResponse.json({ error: "Email is already taken by another user" }, { status: 400 })
      }

      // Check if name column exists
      const tableInfo = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'name'
      `

      const hasNameColumn = tableInfo.length > 0

      let updatedUsers
      if (password) {
        // Hash the new password
        const saltRounds = 12
        const hashedPassword = await bcrypt.hash(password, saltRounds)

        if (hasNameColumn) {
          updatedUsers = await sql`
            UPDATE users 
            SET name = ${name}, email = ${email.toLowerCase()}, role = ${role}, password_hash = ${hashedPassword}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ${userId}
            RETURNING id, name, email, role, updated_at
          `
        } else {
          updatedUsers = await sql`
            UPDATE users 
            SET email = ${email.toLowerCase()}, role = ${role}, password_hash = ${hashedPassword}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ${userId}
            RETURNING id, email, role, updated_at
          `
          updatedUsers[0].name = name
        }
      } else {
        // Update without changing password
        if (hasNameColumn) {
          updatedUsers = await sql`
            UPDATE users 
            SET name = ${name}, email = ${email.toLowerCase()}, role = ${role}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ${userId}
            RETURNING id, name, email, role, updated_at
          `
        } else {
          updatedUsers = await sql`
            UPDATE users 
            SET email = ${email.toLowerCase()}, role = ${role}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ${userId}
            RETURNING id, email, role, updated_at
          `
          updatedUsers[0].name = name
        }
      }

      return NextResponse.json(updatedUsers[0])
    } catch (dbError) {
      console.error("Database error updating user:", dbError)
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }
  } catch (error) {
    console.error("Update user API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated and is admin
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
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 })
    }

    // Return success for demo mode
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

      // Delete the user
      await sql`
        DELETE FROM users WHERE id = ${userId}
      `

      return NextResponse.json({ success: true })
    } catch (dbError) {
      console.error("Database error deleting user:", dbError)
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }
  } catch (error) {
    console.error("Delete user API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
