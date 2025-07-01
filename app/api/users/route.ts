import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import bcrypt from "bcryptjs"
import { verifySession } from "@/lib/auth"

// Mock users for demo mode
const mockUsers = [
  {
    id: 1,
    email: "admin@henryscheinone.com",
    name: "Admin User",
    role: "admin",
    created_at: "2024-01-01T00:00:00Z",
    last_login: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    email: "user@henryscheinone.com",
    name: "Regular User",
    role: "user",
    created_at: "2024-01-02T00:00:00Z",
    last_login: "2024-01-14T15:45:00Z",
  },
  {
    id: 3,
    email: "manager@henryscheinone.com",
    name: "Manager User",
    role: "admin",
    created_at: "2024-01-03T00:00:00Z",
    last_login: "2024-01-13T09:15:00Z",
  },
]

export async function GET() {
  try {
    // Verify admin session
    const session = await verifySession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isDatabaseConfigured() || !sql) {
      console.log("Database not configured, returning mock users")
      return NextResponse.json(mockUsers)
    }

    // Check if the new columns exist
    const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('name', 'last_login')
    `

    const hasNameColumn = columnCheck.some((col: any) => col.column_name === "name")
    const hasLastLoginColumn = columnCheck.some((col: any) => col.column_name === "last_login")

    let users
    if (hasNameColumn && hasLastLoginColumn) {
      // New schema with all columns
      users = await sql`
        SELECT id, email, name, role, created_at, last_login
        FROM users
        ORDER BY created_at DESC
      `
    } else if (hasNameColumn) {
      // Has name but not last_login
      users = await sql`
        SELECT id, email, name, role, created_at, NULL as last_login
        FROM users
        ORDER BY created_at DESC
      `
    } else {
      // Old schema - generate name from email
      users = await sql`
        SELECT 
          id, 
          email, 
          CASE 
            WHEN email LIKE '%admin%' THEN 'Admin User'
            WHEN email LIKE '%manager%' THEN 'Manager User'
            ELSE SPLIT_PART(email, '@', 1)
          END as name,
          role, 
          created_at,
          NULL as last_login
        FROM users
        ORDER BY created_at DESC
      `
    }

    return NextResponse.json(users)
  } catch (error) {
    console.error("Database error, falling back to mock data:", error)
    return NextResponse.json(mockUsers)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const session = await verifySession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const body = await request.json()
    const { name, email, role, password } = body

    // Validation
    if (!name || !email || !role || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (!email.includes("@")) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    if (!["user", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Check if the new columns exist
    const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('name', 'last_login')
    `

    const hasNameColumn = columnCheck.some((col: any) => col.column_name === "name")

    let newUser
    if (hasNameColumn) {
      // New schema with name column
      newUser = await sql`
        INSERT INTO users (email, password_hash, role, name)
        VALUES (${email}, ${passwordHash}, ${role}, ${name})
        RETURNING id, email, name, role, created_at
      `
    } else {
      // Old schema without name column
      newUser = await sql`
        INSERT INTO users (email, password_hash, role)
        VALUES (${email}, ${passwordHash}, ${role})
        RETURNING id, email, role, created_at
      `
      // Add generated name for response
      newUser[0].name = name
    }

    return NextResponse.json(newUser[0], { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
