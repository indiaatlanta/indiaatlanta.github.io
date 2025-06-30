import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /login, /admin)
  const { pathname } = request.nextUrl

  // Allow access to login page and API routes
  if (pathname === "/login" || pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get("session")

  // If no session cookie and not on login page, redirect to login
  if (!sessionCookie && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public|images).*)",
  ],
}
