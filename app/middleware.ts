import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// List of public routes that don't require authentication
const publicRoutes = ["/sign-in", "/sign-up", "/forgot-password"]

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get("connect.sid")
  const { pathname } = request.nextUrl

  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // If the user is not logged in and trying to access a protected route
  if (!isLoggedIn && !isPublicRoute && pathname !== "/") {
    const url = new URL("/sign-in", request.url)
    return NextResponse.redirect(url)
  }

  // If the user is logged in and trying to access login/signup pages
  if (isLoggedIn && isPublicRoute) {
    const url = new URL("/dashboard", request.url)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

