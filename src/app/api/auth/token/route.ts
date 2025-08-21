import { cookies } from "next/headers"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getNewTokens } from "@/utils/auth/token/getNewTokens"

const {
  SSO_ENVIRONMENT = "dev",
  SSO_REALM = "standard",
  SSO_PROTOCOL = "openid-connect",
  SSO_CLIENT_ID,
  SSO_CLIENT_SECRET,
  NODE_ENV,
} = process.env

export async function POST(_request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const refresh_token = cookieStore.get("refresh_token")?.value

    const isProduction = NODE_ENV === "production"

    if (!SSO_CLIENT_ID || !SSO_CLIENT_SECRET) {
      return NextResponse.json(
        {
          success: false,
          message: "SSO_CLIENT_ID and/or SSO_CLIENT_SECRET env variables are undefined.",
        },
        { status: 500 }
      )
    }

    if (!refresh_token) {
      return NextResponse.json(
        {
          success: false,
          message: "Refresh token is missing. Please log in again.",
        },
        { status: 401 }
      )
    }

    const tokens = await getNewTokens({
      refreshToken: refresh_token,
      clientID: SSO_CLIENT_ID,
      clientSecret: SSO_CLIENT_SECRET,
      ssoEnvironment: SSO_ENVIRONMENT as "dev" | "test" | "prod",
      ssoRealm: SSO_REALM,
      ssoProtocol: SSO_PROTOCOL as "openid-connect",
    })

    if (!tokens) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token.",
        },
        { status: 401 }
      )
    }

    const response = NextResponse.json({
      access_token: tokens.access_token,
      id_token: tokens.id_token,
      expires_in: tokens.expires_in,
      refresh_expires_in: tokens.refresh_expires_in,
    })

    // Set access token cookie
    response.cookies.set("access_token", tokens.access_token, {
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: tokens.expires_in, // Set expiration based on token expiry
    })

    // Set refresh token as HTTP-only cookie
    if (tokens.refresh_token) {
      response.cookies.set("refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        maxAge: tokens.refresh_expires_in, // Set expiration based on token expiry
      })
    }

    // Set id token cookie
    response.cookies.set("id_token", tokens.id_token, {
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: tokens.expires_in, // Set expiration based on token expiry
    })

    return response
  } catch (error) {
    console.error("Token refresh error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while refreshing the token.",
      },
      { status: 500 }
    )
  }
}
