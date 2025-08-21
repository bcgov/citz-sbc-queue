import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getLoginURL } from "@/utils/auth/url/getLoginURL"

const {
  SSO_ENVIRONMENT = "dev",
  SSO_REALM = "standard",
  SSO_PROTOCOL = "openid-connect",
  SSO_CLIENT_ID,
  APP_URL,
} = process.env

// Redirects user to SSO login page
export async function GET(_request: NextRequest) {
  try {
    if (!SSO_CLIENT_ID) {
      return NextResponse.json(
        { error: "SSO_CLIENT_ID env variable is undefined." },
        { status: 500 }
      )
    }

    const redirectURL = getLoginURL({
      idpHint: "azureidir",
      clientID: SSO_CLIENT_ID,
      redirectURI: `${APP_URL}/api/auth/login/callback`,
      ssoEnvironment: SSO_ENVIRONMENT as "dev" | "test" | "prod",
      ssoRealm: SSO_REALM,
      ssoProtocol: SSO_PROTOCOL as "openid-connect",
    })

    // Redirect the user to the SSO login page
    return NextResponse.redirect(redirectURL)
  } catch (error) {
    console.error("Error in login route:", error)
    return NextResponse.json({ error: "Failed to generate login URL" }, { status: 500 })
  }
}
