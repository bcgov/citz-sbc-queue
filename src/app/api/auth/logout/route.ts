import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getLogoutURL } from "@/utils/auth/url/getLogoutURL"

const {
  SSO_ENVIRONMENT = "dev",
  SSO_REALM = "standard",
  SSO_PROTOCOL = "openid-connect",
  APP_URL,
  NODE_ENV,
} = process.env

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const redirect_uri = searchParams.get("redirect_uri")

    const isProduction = NODE_ENV === "production"

    // Get id_token from HTTP-only cookie
    const id_token = request.cookies.get("id_token")?.value

    if (!id_token) {
      return NextResponse.json({ error: "Missing id_token in cookies" }, { status: 400 })
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
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 0, // Expire immediately
    })

    response.cookies.set("refresh_token", "", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 0, // Expire immediately
    })

    // Clear the id token cookie
    response.cookies.set("id_token", "", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 0, // Expire immediately
    })

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
