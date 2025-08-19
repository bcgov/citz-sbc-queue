import type { NextRequest } from "next/server"
import { authMiddleware, isProtectedRoute } from "./middleware/auth"
import { conditional } from "./middleware/utils"

export async function middleware(request: NextRequest) {
  // Create conditional middleware that only runs auth for protected routes
  const conditionalAuthMiddleware = conditional(
    (req: NextRequest) => isProtectedRoute(req.nextUrl.pathname),
    authMiddleware
  )

  return conditionalAuthMiddleware(request)
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
