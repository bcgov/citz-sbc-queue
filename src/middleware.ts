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

// Match all API routes
export const config = {
  matcher: ["/api/:path*"],
}
