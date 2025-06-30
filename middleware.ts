import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log("Middleware processing:", { pathname })

  // Allow access to login page and API routes
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/") ||
    pathname === "/favicon.ico"
  ) {
    console.log("Allowing access to:", pathname)
    return NextResponse.next()
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get("session")
  console.log("Session check:", {
    pathname,
    hasSession: !!sessionCookie?.value,
    sessionValue: sessionCookie?.value ? "present" : "missing",
  })

  if (!sessionCookie?.value) {
    console.log("No session found, redirecting to login")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  console.log("Session found, allowing access to:", pathname)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
