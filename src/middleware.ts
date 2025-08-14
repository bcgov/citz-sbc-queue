import type { NextRequest } from "next/server"
import { authMiddleware, isProtectedRoute } from "./middleware/auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only run auth middleware for protected routes
  if (isProtectedRoute(pathname)) {
    return authMiddleware(request)
  }
}

// Match all routes except auth routes and static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (auth routes to avoid circular dependencies)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
}
