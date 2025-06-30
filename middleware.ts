import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifySession } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log(`[Middleware] Processing request for: ${pathname}`)

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/forgot-password", "/reset-password"]
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  if (isPublicRoute) {
    console.log(`[Middleware] Public route, allowing access: ${pathname}`)
    return NextResponse.next()
  }

  // API routes - let them handle their own auth
  if (pathname.startsWith("/api/")) {
    console.log(`[Middleware] API route, skipping middleware: ${pathname}`)
    return NextResponse.next()
  }

  // Check for session
  const sessionToken = request.cookies.get("session")?.value
  console.log(`[Middleware] Session token present: ${!!sessionToken}`)

  if (!sessionToken) {
    console.log(`[Middleware] No session token, redirecting to login`)
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    const user = await verifySession(sessionToken)
    console.log(`[Middleware] Session verified for user: ${user?.email}`)

    if (!user) {
      console.log(`[Middleware] Invalid session, redirecting to login`)
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Admin routes protection
    if (pathname.startsWith("/admin") && user.role !== "admin") {
      console.log(`[Middleware] Non-admin user trying to access admin route, redirecting`)
      return NextResponse.redirect(new URL("/", request.url))
    }

    console.log(`[Middleware] Access granted for: ${pathname}`)
    return NextResponse.next()
  } catch (error) {
    console.error(`[Middleware] Session verification error:`, error)
    return NextResponse.redirect(new URL("/login", request.url))
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
    "/((?!_next/static|_next/image|favicon.ico|images|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
}
