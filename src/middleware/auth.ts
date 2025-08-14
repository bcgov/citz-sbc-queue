import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

// Checks if a route should be protected based on pathname
export function isProtectedRoute(pathname: string): boolean {
  // Both API and frontend routes are protected if they contain '/protected'
  return pathname.includes("/protected")
}

// Checks if a route is a frontend route (not an API route)
export function isFrontendRoute(pathname: string): boolean {
  return !pathname.startsWith("/api/")
}

// Type for the validation response
type ValidationResponse = {
  valid: boolean
  user?: unknown
  roles?: string[]
  error?: string
}

// Authentication middleware handler for both API and frontend routes
export async function authMiddleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl

  // Determine authentication method based on route type
  if (isFrontendRoute(pathname)) {
    return frontendAuthMiddleware(request)
  } else {
    return apiAuthMiddleware(request)
  }
}

// API authentication middleware handler
export async function apiAuthMiddleware(request: NextRequest): Promise<NextResponse> {
  try {
    // Check if Authorization header exists
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "No authorization header found" }, { status: 401 })
    }

    // Extract token from header
    const token = authHeader.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "Invalid authorization header format" }, { status: 401 })
    }

    // Call the validation API route
    const baseUrl = new URL(request.url).origin
    const validationResponse = await fetch(`${baseUrl}/api/auth/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    })

    const validationResult: ValidationResponse = await validationResponse.json()

    if (!validationResponse.ok || !validationResult.valid) {
      return NextResponse.json(
        { error: validationResult.error || "Token validation failed" },
        { status: validationResponse.status }
      )
    }

    // Create response and add user info to headers for downstream API routes
    const response = NextResponse.next()

    // Add token and user information to headers so API routes can access them
    response.headers.set("x-user-token", token)
    response.headers.set("x-user-info", JSON.stringify(validationResult.user))
    response.headers.set("x-user-roles", JSON.stringify(validationResult.roles || []))

    return response
  } catch (error) {
    console.error("Auth middleware error:", error)
    return NextResponse.json({ error: "Authentication middleware failed" }, { status: 500 })
  }
}

// Frontend authentication middleware handler
export async function frontendAuthMiddleware(request: NextRequest): Promise<NextResponse> {
  try {
    // Get access token from HTTP-only cookie
    const accessToken = request.cookies.get("access_token")?.value

    if (!accessToken) {
      // Redirect to home page if no access token found
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Call the validation API route
    const baseUrl = new URL(request.url).origin
    const validationResponse = await fetch(`${baseUrl}/api/auth/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: accessToken }),
    })

    const validationResult: ValidationResponse = await validationResponse.json()

    if (!validationResponse.ok || !validationResult.valid) {
      // Redirect to home page if token is invalid
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Token is valid, continue with the request
    const response = NextResponse.next()

    return response
  } catch (error) {
    console.error("Frontend auth middleware error:", error)
    // Redirect to home page on error
    return NextResponse.redirect(new URL("/", request.url))
  }
}
