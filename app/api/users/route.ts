import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"
import bcrypt from "bcryptjs"

// Demo users for fallback
const demoUsers = [
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
    last_login: "2024-01-14T14:20:00Z",
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
    last_login: null,
  },
  {
    id: 5,
    email: "jane.doe@henryscheinone.com",
    name: "Jane Doe",
    role: "user",
    created_at: "2024-01-05T00:00:00Z",
    last_login: "2024-01-12T16:45:00Z",
  },
]

export async function GET() {
  try {
    // Check if user is admin
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isDatabaseConfigured() || !sql) {
      console.log("Database not configured, returning demo users")
      return NextResponse.json({ users: demoUsers })
    }

    try {
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
        // Use full query with all columns
        users = await sql`
          SELECT id, email, name, role, created_at, last_login
          FROM users
          ORDER BY created_at DESC
        `
      } else if (hasNameColumn) {
        // Use query without last_login
        users = await sql`
          SELECT id, email, name, role, created_at, NULL as last_login
          FROM users
          ORDER BY created_at DESC
        `
      } else {
        // Use basic query and generate names
        const basicUsers = await sql`
          SELECT id, email, role, created_at
          FROM users
          ORDER BY created_at DESC
        `

        users = basicUsers.map((user: any) => ({
          ...user,
          name: user.email.includes("admin")
            ? "Admin User"
            : user.email.includes("manager")
              ? "Manager User"
              : user.email
                  .split("@")[0]
                  .replace(/[._]/g, " ")
                  .replace(/\b\w/g, (l: string) => l.toUpperCase()),
          last_login: null,
        }))
      }

      return NextResponse.json({ users })
    } catch (dbError) {
      console.error("Database error, falling back to mock data:", dbError.message)
      return NextResponse.json({ users: demoUsers })
    }
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

    if (!["admin", "user"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    if (!isDatabaseConfigured() || !sql) {
      console.log("Database not configured, simulating user creation")
      const newUser = {
        id: Math.max(...demoUsers.map((u) => u.id)) + 1,
        email,
        name,
        role,
        created_at: new Date().toISOString(),
        last_login: null,
      }
      return NextResponse.json({ user: newUser })
    }

    try {
      // Check if email already exists
      const existingUsers = await sql`
        SELECT id FROM users WHERE email = ${email}
      `

      if (existingUsers.length > 0) {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 })
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12)

      // Check if name column exists
      const columnCheck = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'name'
      `

      const hasNameColumn = columnCheck.length > 0

      let newUser
      if (hasNameColumn) {
        // Insert with name column
        const result = await sql`
          INSERT INTO users (email, password_hash, name, role)
          VALUES (${email}, ${passwordHash}, ${name}, ${role})
          RETURNING id, email, name, role, created_at
        `
        newUser = result[0]
      } else {
        // Insert without name column
        const result = await sql`
          INSERT INTO users (email, password_hash, role)
          VALUES (${email}, ${passwordHash}, ${role})
          RETURNING id, email, role, created_at
        `
        newUser = { ...result[0], name }
      }

      return NextResponse.json({ user: newUser })
    } catch (dbError) {
      console.error("Database error creating user:", dbError.message)
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
