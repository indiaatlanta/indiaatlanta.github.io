import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifySession } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log("Middleware processing:", pathname)

  // Public paths that don't require authentication
  const publicPaths = ["/login", "/forgot-password", "/reset-password"]
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  // API routes that don't require authentication
  const publicApiPaths = [
    "/api/auth/login",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/auth/verify-reset-token",
  ]
  const isPublicApiPath = publicApiPaths.some((path) => pathname.startsWith(path))

  // Static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/_next") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }

  // Allow public paths
  if (isPublicPath || isPublicApiPath) {
    return NextResponse.next()
  }

  // Check for session
  const sessionCookie = request.cookies.get("session")
  console.log("Session cookie present:", !!sessionCookie?.value)

  if (!sessionCookie?.value) {
    console.log("No session found, redirecting to login")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Verify session
  try {
    const user = await verifySession(sessionCookie.value)
    console.log("Session verification result:", !!user)

    if (!user) {
      console.log("Invalid session, redirecting to login")
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete("session")
      return response
    }

    // Check admin access for admin routes
    if (pathname.startsWith("/admin") && user.role !== "admin") {
      console.log("Non-admin user trying to access admin route")
      return NextResponse.redirect(new URL("/", request.url))
    }

    console.log("Session valid, allowing access")
    return NextResponse.next()
  } catch (error) {
    console.error("Session verification error:", error)
    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete("session")
    return response
  }
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
