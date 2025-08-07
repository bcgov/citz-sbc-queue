import type { GetNewTokensResponse, SSOEnvironment, SSOProtocol } from "@bcgov/citz-imb-sso-js-core"
import { getNewTokens } from "@bcgov/citz-imb-sso-js-core"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const {
  SSO_ENVIRONMENT = "dev",
  SSO_REALM = "standard",
  SSO_PROTOCOL = "openid-connect",
  SSO_CLIENT_ID,
  SSO_CLIENT_SECRET,
} = process.env

export async function POST(_request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const refresh_token = cookieStore.get("refresh_token")?.value

    if (!SSO_CLIENT_ID || !SSO_CLIENT_SECRET) {
      return NextResponse.json(
        {
          success: false,
          message: "SSO_CLIENT_ID and/or SSO_CLIENT_SECRET env variables are undefined.",
        },
        { status: 400 }
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

    const tokens = (await getNewTokens({
      refreshToken: refresh_token,
      clientID: SSO_CLIENT_ID,
      clientSecret: SSO_CLIENT_SECRET,
      ssoEnvironment: SSO_ENVIRONMENT as SSOEnvironment,
      ssoRealm: SSO_REALM,
      ssoProtocol: SSO_PROTOCOL as SSOProtocol,
    })) as GetNewTokensResponse

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

    // Set refresh token as HTTP-only cookie (if present)
    if (tokens.refresh_token) {
      response.cookies.set("refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      })
    }

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
