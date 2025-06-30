import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSession } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log("Middleware checking path:", pathname)

  // Skip middleware for API routes, static files, and login page
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/") ||
    pathname === "/login" ||
    pathname.includes(".")
  ) {
    console.log("Skipping middleware for:", pathname)
    return NextResponse.next()
  }

  try {
    const session = await getSession()
    console.log("Middleware session check:", session ? "authenticated" : "not authenticated")

    if (!session) {
      console.log("No session found, redirecting to login")
      return NextResponse.redirect(new URL("/login", request.url))
    }

    console.log("Session valid, allowing access to:", pathname)
    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)
    return NextResponse.redirect(new URL("/login", request.url))
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
