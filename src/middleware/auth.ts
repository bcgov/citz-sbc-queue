import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

// Checks if a route should be protected based on pathname
export function isProtectedRoute(pathname: string): boolean {
  // Check if the route contains '/protected' in its path
  return pathname.includes("/protected")
}

// Type for the validation response
type ValidationResponse = {
  valid: boolean
  user?: unknown
  roles?: string[]
  error?: string
}

// Authentication middleware handler
export async function authMiddleware(request: NextRequest): Promise<NextResponse> {
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
