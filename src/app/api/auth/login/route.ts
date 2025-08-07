import type { SSOEnvironment, SSOProtocol } from "@bcgov/citz-imb-sso-js-core"
import { getLoginURL } from "@bcgov/citz-imb-sso-js-core"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const {
  SSO_ENVIRONMENT = "dev",
  SSO_REALM = "standard",
  SSO_PROTOCOL = "openid-connect",
  SSO_CLIENT_ID,
  API_URL,
} = process.env

// Redirects user to SSO login page
export async function GET(_request: NextRequest) {
  try {
    if (!SSO_CLIENT_ID) {
      return NextResponse.json(
        { error: "SSO_CLIENT_ID env variable is undefined." },
        { status: 400 }
      )
    }

    const redirectURL = getLoginURL({
      idpHint: "idir",
      clientID: SSO_CLIENT_ID,
      redirectURI: `${API_URL}/auth/login/callback`,
      ssoEnvironment: SSO_ENVIRONMENT as SSOEnvironment,
      ssoRealm: SSO_REALM,
      ssoProtocol: SSO_PROTOCOL as SSOProtocol,
    })

    // Redirect the user to the SSO login page
    return NextResponse.redirect(redirectURL)
  } catch (error) {
    console.error("Error in login route:", error)
    return NextResponse.json({ error: "Failed to generate login URL" }, { status: 500 })
  }
}
