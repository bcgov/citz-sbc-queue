import type { SSOEnvironment, SSOProtocol } from "@bcgov/citz-imb-sso-js-core"
import { getLogoutURL } from "@bcgov/citz-imb-sso-js-core"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const {
  SSO_ENVIRONMENT = "dev",
  SSO_REALM = "standard",
  SSO_PROTOCOL = "openid-connect",
  API_URL,
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
    const postLogoutRedirectURI = redirect_uri || referer || `${API_URL}/`

    const redirectURL = getLogoutURL({
      idToken: id_token,
      postLogoutRedirectURI,
      ssoEnvironment: SSO_ENVIRONMENT as SSOEnvironment,
      ssoProtocol: SSO_PROTOCOL as SSOProtocol,
      ssoRealm: SSO_REALM as string,
    })

    return NextResponse.redirect(redirectURL)
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
