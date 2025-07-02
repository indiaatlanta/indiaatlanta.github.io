import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser, createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log("Login attempt for:", email)

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    // Authenticate user
    const user = await authenticateUser(email, password)

    if (!user) {
      console.log("Authentication failed for:", email)
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    // Create session
    await createSession(user)

    console.log("Login successful for:", email)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, error: "An error occurred during login" }, { status: 500 })
  }
}
