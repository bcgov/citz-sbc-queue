import type { SSOEnvironment, SSOProtocol } from "@bcgov/citz-imb-sso-js-core"
import { decodeJWT, isJWTValid, normalizeUser } from "@bcgov/citz-imb-sso-js-core"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const {
  SSO_CLIENT_ID,
  SSO_CLIENT_SECRET,
  SSO_ENVIRONMENT = "dev",
  SSO_PROTOCOL = "openid-connect",
  SSO_REALM = "standard",
} = process.env

// Checks if a route should be protected based on pathname
export function isProtectedRoute(pathname: string): boolean {
  // Check if the route contains 'protected' in its path
  return pathname.includes("protected")
}

// Authentication middleware handler
export async function authMiddleware(request: NextRequest): Promise<NextResponse> {
  try {
    // Check if SSO configuration is available
    if (!SSO_CLIENT_ID || !SSO_CLIENT_SECRET) {
      console.error("SSO_CLIENT_ID and/or SSO_CLIENT_SECRET env variables are undefined.")
      return NextResponse.json({ error: "SSO configuration missing" }, { status: 500 })
    }

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

    // Validate the JWT token
    const isTokenValid = await isJWTValid({
      jwt: token,
      clientID: SSO_CLIENT_ID,
      clientSecret: SSO_CLIENT_SECRET,
      ssoEnvironment: SSO_ENVIRONMENT as SSOEnvironment,
      ssoProtocol: SSO_PROTOCOL as SSOProtocol,
      ssoRealm: SSO_REALM,
    })

    if (!isTokenValid) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token, re-log to get a new one" },
        { status: 401 }
      )
    }

    // Decode JWT and get user information
    const userInfo = decodeJWT(token)
    const normalizedUser = normalizeUser<unknown>(userInfo)

    if (!userInfo || !normalizedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create response and add user info to headers for downstream API routes
    const response = NextResponse.next()

    // Add token and user information to headers so API routes can access them
    response.headers.set("x-user-token", token)
    response.headers.set("x-user-info", JSON.stringify(normalizedUser))
    response.headers.set("x-user-roles", JSON.stringify(userInfo.client_roles || []))

    return response
  } catch (error) {
    console.error("Auth middleware error:", error)
    return NextResponse.json({ error: "Authentication middleware failed" }, { status: 500 })
  }
}
