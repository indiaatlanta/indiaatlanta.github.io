import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log("Middleware processing:", pathname)

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/forgot-password", "/reset-password"]
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // API routes that don't require authentication
  const publicApiRoutes = [
    "/api/auth/login",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/auth/verify-reset-token",
  ]
  const isPublicApiRoute = publicApiRoutes.some((route) => pathname.startsWith(route))

  if (isPublicRoute || isPublicApiRoute) {
    console.log("Public route, allowing access:", pathname)
    return NextResponse.next()
  }

  // Check authentication for protected routes
  try {
    const user = await getCurrentUser()
    console.log("Middleware auth check:", {
      pathname,
      user: user ? { id: user.id, email: user.email, role: user.role } : null,
    })

    if (!user) {
      console.log("No user found, redirecting to login")
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Admin-only routes
    const adminRoutes = ["/admin"]
    const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

    if (isAdminRoute && user.role !== "admin") {
      console.log("Non-admin user trying to access admin route, redirecting to home")
      return NextResponse.redirect(new URL("/", request.url))
    }

    console.log("Authentication successful, allowing access")
    return NextResponse.next()
  } catch (error) {
    console.error("Middleware auth error:", error)
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
