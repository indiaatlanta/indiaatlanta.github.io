import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

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

    // Validate required fields
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
      // Check if email is already taken by another user
      const existingUsers = await sql`
        SELECT id FROM users WHERE email = ${email.toLowerCase()} AND id != ${userId}
      `

      if (existingUsers.length > 0) {
        return NextResponse.json({ error: "Email is already taken by another user" }, { status: 400 })
      }

      // Update user
      let updateQuery
      if (password) {
        updateQuery = await sql`
          UPDATE users 
          SET name = ${name}, email = ${email.toLowerCase()}, role = ${role}, password_hash = ${password}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${userId}
          RETURNING id, name, email, role, updated_at
        `
      } else {
        updateQuery = await sql`
          UPDATE users 
          SET name = ${name}, email = ${email.toLowerCase()}, role = ${role}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${userId}
          RETURNING id, name, email, role, updated_at
        `
      }

      if (updateQuery.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      return NextResponse.json(updateQuery[0])
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
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    // Return success for demo mode
    if (!isDatabaseConfigured() || !sql) {
      console.log("Database not configured, simulating user deletion")
      return NextResponse.json({ success: true })
    }

    try {
      // Delete user
      const deleteResult = await sql`
        DELETE FROM users WHERE id = ${userId}
        RETURNING id
      `

      if (deleteResult.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

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
