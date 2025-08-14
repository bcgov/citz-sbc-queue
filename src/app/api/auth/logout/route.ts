import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getLogoutURL } from "@/utils/auth/url/getLogoutURL"

const {
  SSO_ENVIRONMENT = "dev",
  SSO_REALM = "standard",
  SSO_PROTOCOL = "openid-connect",
  APP_URL,
} = process.env

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id_token = searchParams.get("id_token")
    const redirect_uri = searchParams.get("redirect_uri")

    if (!id_token) {
      return NextResponse.json({ error: "Missing id_token parameter" }, { status: 400 })
    }

    // Use provided redirect_uri, fallback to referer, or default to home page
    const referer = request.headers.get("referer")
    const postLogoutRedirectURI = redirect_uri || referer || `${APP_URL}`

    const redirectURL = getLogoutURL({
      idToken: id_token,
      postLogoutRedirectURI,
      ssoEnvironment: SSO_ENVIRONMENT as "dev" | "test" | "prod",
      ssoProtocol: SSO_PROTOCOL as "openid-connect",
      ssoRealm: SSO_REALM as string,
    })

    const response = NextResponse.redirect(redirectURL)

    // Clear the access token and refresh token cookies
    response.cookies.set("access_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 0, // Expire immediately
    })

    response.cookies.set("refresh_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 0, // Expire immediately
    })

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
