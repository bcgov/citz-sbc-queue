import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getTokens } from "@/utils/auth/token/getTokens"

const {
  SSO_ENVIRONMENT = "dev",
  SSO_REALM = "standard",
  SSO_PROTOCOL = "openid-connect",
  SSO_CLIENT_ID,
  SSO_CLIENT_SECRET,
  APP_URL,
} = process.env

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.json({ error: "Authorization code is required" }, { status: 400 })
    }

    if (!SSO_CLIENT_ID || !SSO_CLIENT_SECRET) {
      return NextResponse.json(
        { error: "SSO_CLIENT_ID and/or SSO_CLIENT_SECRET env variables are undefined." },
        { status: 400 }
      )
    }

    const tokens = await getTokens({
      code,
      clientID: SSO_CLIENT_ID,
      clientSecret: SSO_CLIENT_SECRET,
      redirectURI: `${APP_URL}/api/auth/login/callback`,
      ssoEnvironment: SSO_ENVIRONMENT as "dev" | "test" | "prod",
      ssoRealm: SSO_REALM,
      ssoProtocol: SSO_PROTOCOL as "openid-connect",
    })

    // Create response with tokens (excluding refresh_token)
    const responseData = {
      access_token: tokens.access_token,
      id_token: tokens.id_token,
      expires_in: tokens.expires_in,
      refresh_expires_in: tokens.refresh_expires_in,
    }

    const response = NextResponse.json(responseData, { status: 200 })

    // Set access token as HTTP-only cookie
    response.cookies.set("access_token", tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: tokens.expires_in, // Set expiration based on token expiry
    })

    // Set refresh token as HTTP-only cookie
    response.cookies.set("refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    })

    // Set id token as HTTP-only cookie
    response.cookies.set("id_token", tokens.id_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: tokens.expires_in, // Set expiration based on token expiry
    })

    return response
  } catch (error) {
    console.error("Login callback error:", error)
    return NextResponse.json(
      {
        error: "Login callback failed",
        message: error instanceof Error ? error.message : "Unknown error occurred",
        success: false,
      },
      { status: 500 }
    )
  }
}
