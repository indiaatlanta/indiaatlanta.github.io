import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { verifyPassword, createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    console.log("Login attempt:", { email, isDatabaseConfigured: isDatabaseConfigured() })

    // Check if database is configured
    if (!isDatabaseConfigured() || !sql) {
      console.log("Using demo mode authentication")
      // Demo mode - check against hardcoded credentials
      const demoUsers = {
        "admin@henryscheinone.com": { id: 1, name: "Demo Admin", role: "admin", password: "admin123" },
        "user@henryscheinone.com": { id: 2, name: "Demo User", role: "user", password: "user123" },
      }

      const demoUser = demoUsers[email as keyof typeof demoUsers]
      if (!demoUser || demoUser.password !== password) {
        console.log("Demo login failed:", { email, providedPassword: password, expectedPassword: demoUser?.password })
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      console.log("Demo login successful:", { email, role: demoUser.role })

      // Create demo session
      await createSession(demoUser.id)

      return NextResponse.json({
        user: {
          id: demoUser.id,
          email,
          name: demoUser.name,
          role: demoUser.role,
        },
      })
    }

    // Database mode - query actual users table
    try {
      console.log("Querying database for user:", email)
      const users = await sql`
        SELECT id, email, name, role, password_hash
        FROM users
        WHERE email = ${email}
      `

      if (users.length === 0) {
        console.log("User not found in database:", email)
        // Fallback to demo credentials if user not found in database
        const demoUsers = {
          "admin@henryscheinone.com": { id: 1, name: "Demo Admin", role: "admin", password: "admin123" },
          "user@henryscheinone.com": { id: 2, name: "Demo User", role: "user", password: "user123" },
        }

        const demoUser = demoUsers[email as keyof typeof demoUsers]
        if (demoUser && demoUser.password === password) {
          console.log("Using demo credentials as fallback:", { email, role: demoUser.role })
          await createSession(demoUser.id)
          return NextResponse.json({
            user: {
              id: demoUser.id,
              email,
              name: demoUser.name,
              role: demoUser.role,
            },
          })
        }

        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      const user = users[0]
      console.log("User found in database:", { id: user.id, email: user.email, role: user.role })

      // Check if password_hash exists and is not null
      if (!user.password_hash) {
        console.log("No password hash found, checking demo credentials")
        // If no password hash, check against demo credentials
        const demoUsers = {
          "admin@henryscheinone.com": { password: "admin123" },
          "user@henryscheinone.com": { password: "user123" },
        }

        const demoUser = demoUsers[email as keyof typeof demoUsers]
        if (demoUser && demoUser.password === password) {
          console.log("Demo password match for database user:", { email, role: user.role })
          await createSession(user.id)
          return NextResponse.json({
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            },
          })
        }

        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      // Verify hashed password
      const isValidPassword = await verifyPassword(password, user.password_hash)
      if (!isValidPassword) {
        console.log("Password verification failed for user:", email)

        // Fallback: check if it's a demo password for existing database user
        const demoUsers = {
          "admin@henryscheinone.com": { password: "admin123" },
          "user@henryscheinone.com": { password: "user123" },
        }

        const demoUser = demoUsers[email as keyof typeof demoUsers]
        if (demoUser && demoUser.password === password) {
          console.log("Using demo password for database user:", { email, role: user.role })
          await createSession(user.id)
          return NextResponse.json({
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            },
          })
        }

        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      console.log("Database login successful:", { email, role: user.role })

      // Create session
      await createSession(user.id)

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      })
    } catch (dbError) {
      console.error("Database login error:", dbError)

      // Fallback to demo mode if database fails
      console.log("Falling back to demo mode due to database error")
      const demoUsers = {
        "admin@henryscheinone.com": { id: 1, name: "Demo Admin", role: "admin", password: "admin123" },
        "user@henryscheinone.com": { id: 2, name: "Demo User", role: "user", password: "user123" },
      }

      const demoUser = demoUsers[email as keyof typeof demoUsers]
      if (!demoUser || demoUser.password !== password) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      // Create demo session
      await createSession(demoUser.id)

      return NextResponse.json({
        user: {
          id: demoUser.id,
          email,
          name: demoUser.name,
          role: demoUser.role,
        },
      })
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
