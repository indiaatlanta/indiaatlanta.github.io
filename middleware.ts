import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function middleware(request: NextRequest) {
  // Skip middleware for login page, API routes, and static files
  if (
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/images") ||
    request.nextUrl.pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }

  const sessionToken = request.cookies.get("session")?.value

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Validate session
  try {
    const sessions = await sql`
      SELECT us.id, us.user_id, us.expires_at, u.name, u.email, u.role
      FROM user_sessions us
      JOIN users u ON us.user_id = u.id
      WHERE us.id = ${sessionToken} 
      AND us.expires_at > NOW()
      AND u.active = true
    `

    if (sessions.length === 0) {
      // Invalid or expired session
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete("session")
      return response
    }

    // Session is valid, continue
    return NextResponse.next()
  } catch (error) {
    console.log("Database unavailable, allowing demo session")
    // In demo mode, allow access if session cookie exists
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login).*)",
  ],
}
