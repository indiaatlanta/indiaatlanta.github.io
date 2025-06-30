import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { createSession } from "@/lib/auth"
import bcrypt from "bcryptjs"

// Demo users for when database is not configured
const demoUsers = [
  {
    id: 1,
    email: "admin@henryscheinone.com",
    password: "admin123",
    name: "Admin User",
    role: "admin",
  },
  {
    id: 2,
    email: "user@henryscheinone.com",
    password: "user123",
    name: "John Doe",
    role: "user",
  },
  {
    id: 3,
    email: "manager@henryscheinone.com",
    password: "manager123",
    name: "Jane Manager",
    role: "admin",
  },
  {
    id: 4,
    email: "john.smith@henryscheinone.com",
    password: "password123",
    name: "John Smith",
    role: "user",
  },
  {
    id: 5,
    email: "jane.doe@henryscheinone.com",
    password: "password123",
    name: "Jane Doe",
    role: "user",
  },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    console.log("Login attempt for:", email)

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    let user = null

    // Try database authentication first if configured
    if (isDatabaseConfigured()) {
      try {
        console.log("Attempting database authentication for:", email)

        const users = await sql!`
          SELECT id, email, name, role, password_hash 
          FROM users 
          WHERE email = ${email.toLowerCase()}
        `

        if (users.length > 0) {
          const dbUser = users[0]
          console.log("Found user in database:", dbUser.email)

          // Check if password is hashed or plain text
          let passwordMatch = false
          if (dbUser.password_hash && dbUser.password_hash.startsWith("$2")) {
            // Hashed password
            passwordMatch = await bcrypt.compare(password, dbUser.password_hash)
          } else {
            // Plain text password (for demo/development)
            passwordMatch = password === dbUser.password_hash
          }

          if (passwordMatch) {
            user = {
              id: dbUser.id,
              email: dbUser.email,
              name: dbUser.name,
              role: dbUser.role,
            }
            console.log("Database authentication successful")
          } else {
            console.log("Password mismatch for database user")
          }
        } else {
          console.log("User not found in database")
        }
      } catch (dbError) {
        console.error("Database login error:", dbError)
        // Fall through to demo authentication
      }
    }

    // If database auth failed or not configured, try demo users
    if (!user) {
      console.log("Trying demo authentication for:", email)
      const demoUser = demoUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())

      if (demoUser && demoUser.password === password) {
        user = {
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role,
        }
        console.log("Demo authentication successful")
      }
    }

    if (!user) {
      console.log("Authentication failed for:", email)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create session
    const sessionId = await createSession(user)
    console.log("Session created successfully:", sessionId)

    // Create response with redirect URL
    const response = NextResponse.json({
      success: true,
      redirectUrl: "/dashboard",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })

    // Set session cookie with proper options
    response.cookies.set("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    console.log("Login successful, cookie set, returning response")
    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
