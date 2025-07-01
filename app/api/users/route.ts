import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import bcrypt from "bcryptjs"

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
  {
    id: 4,
    email: "john.smith@henryscheinone.com",
    name: "John Smith",
    role: "user",
    created_at: "2024-01-04T00:00:00Z",
    last_login: "2024-01-12T14:20:00Z",
  },
  {
    id: 5,
    email: "jane.doe@henryscheinone.com",
    name: "Jane Doe",
    role: "user",
    created_at: "2024-01-05T00:00:00Z",
    last_login: "2024-01-11T11:30:00Z",
  },
]

export async function GET() {
  try {
    // Check if user is authenticated and is admin
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Return mock data if database is not configured
    if (!isDatabaseConfigured() || !sql) {
      console.log("Database not configured, returning mock users")
      return NextResponse.json(mockUsers)
    }

    try {
      // First, check if the required columns exist
      const tableInfo = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name IN ('name', 'last_login')
      `

      const hasNameColumn = tableInfo.some((col: any) => col.column_name === "name")
      const hasLastLoginColumn = tableInfo.some((col: any) => col.column_name === "last_login")

      let users
      if (hasNameColumn && hasLastLoginColumn) {
        // Both columns exist, use full query
        users = await sql`
          SELECT id, email, name, role, created_at, last_login
          FROM users
          ORDER BY created_at DESC
        `
      } else if (hasNameColumn) {
        // Only name column exists
        users = await sql`
          SELECT id, email, name, role, created_at, NULL as last_login
          FROM users
          ORDER BY created_at DESC
        `
      } else {
        // Neither column exists, use basic query and generate names
        const basicUsers = await sql`
          SELECT id, email, role, created_at
          FROM users
          ORDER BY created_at DESC
        `

        users = basicUsers.map((user: any) => ({
          ...user,
          name:
            user.email === "admin@henryscheinone.com"
              ? "Admin User"
              : user.email === "user@henryscheinone.com"
                ? "Regular User"
                : user.email
                    .split("@")[0]
                    .replace(/[._]/g, " ")
                    .replace(/\b\w/g, (l: string) => l.toUpperCase()),
          last_login: null,
        }))
      }

      return NextResponse.json(users)
    } catch (dbError) {
      console.error("Database error, falling back to mock data:", dbError)
      return NextResponse.json(mockUsers)
    }
  } catch (error) {
    console.error("Users API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, email, role, password } = await request.json()

    // Validate required fields
    if (!name || !email || !role || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
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

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    // Return success for demo mode
    if (!isDatabaseConfigured() || !sql) {
      console.log("Database not configured, simulating user creation")
      return NextResponse.json({
        id: Date.now(),
        name,
        email,
        role,
        created_at: new Date().toISOString(),
      })
    }

    try {
      // Check if user already exists
      const existingUsers = await sql`
        SELECT id FROM users WHERE email = ${email.toLowerCase()}
      `

      if (existingUsers.length > 0) {
        return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
      }

      // Hash the password
      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      // Check if name column exists
      const tableInfo = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'name'
      `

      const hasNameColumn = tableInfo.length > 0

      let newUsers
      if (hasNameColumn) {
        // Create new user with name column
        newUsers = await sql`
          INSERT INTO users (name, email, role, password_hash)
          VALUES (${name}, ${email.toLowerCase()}, ${role}, ${hashedPassword})
          RETURNING id, name, email, role, created_at
        `
      } else {
        // Create new user without name column
        newUsers = await sql`
          INSERT INTO users (email, role, password_hash)
          VALUES (${email.toLowerCase()}, ${role}, ${hashedPassword})
          RETURNING id, email, role, created_at
        `

        // Add name to the response
        newUsers[0].name = name
      }

      return NextResponse.json(newUsers[0])
    } catch (dbError) {
      console.error("Database error creating user:", dbError)
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }
  } catch (error) {
    console.error("Create user API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
