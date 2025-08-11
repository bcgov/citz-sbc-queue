import type { NextRequest } from "next/server"
import { authMiddleware, isProtectedRoute } from "./middleware/auth"
import { conditional } from "./middleware/utils"

export async function middleware(request: NextRequest) {
  // Conditional auth middleware that only runs on protected routes
  const protectedAuthMiddleware = conditional(
    (req: NextRequest) => isProtectedRoute(req.nextUrl.pathname),
    authMiddleware
  )

  return protectedAuthMiddleware(request)
}

// Match API routes but exclude auth routes to avoid circular dependencies
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
