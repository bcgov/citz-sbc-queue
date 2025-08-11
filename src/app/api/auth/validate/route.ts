import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { decodeJWT } from "@/utils/auth/jwt/decodeJWT"
import { isJWTValid } from "@/utils/auth/jwt/isJWTValid"

const {
  SSO_CLIENT_ID,
  SSO_CLIENT_SECRET,
  SSO_ENVIRONMENT = "dev",
  SSO_PROTOCOL = "openid-connect",
  SSO_REALM = "standard",
} = process.env

export async function POST(request: NextRequest) {
  try {
    // Check if SSO configuration is available
    if (!SSO_CLIENT_ID || !SSO_CLIENT_SECRET) {
      console.error("SSO_CLIENT_ID and/or SSO_CLIENT_SECRET env variables are undefined.")
      return NextResponse.json({ error: "SSO configuration missing" }, { status: 500 })
    }

    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // Validate the JWT token
    const isTokenValid = await isJWTValid({
      jwt: token,
      clientID: SSO_CLIENT_ID,
      clientSecret: SSO_CLIENT_SECRET,
      ssoEnvironment: SSO_ENVIRONMENT as "dev" | "test" | "prod",
      ssoProtocol: SSO_PROTOCOL as "openid-connect" | "saml",
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

    if (!userInfo) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      valid: true,
      user: userInfo,
      roles: userInfo.client_roles || [],
    })
  } catch (error) {
    console.error("Token validation error:", error)
    return NextResponse.json({ error: "Token validation failed" }, { status: 500 })
  }
}
