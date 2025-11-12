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
  NODE_ENV,
} = process.env

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    const isProduction = NODE_ENV === "production"

    if (!code) {
      return NextResponse.json({ error: "Authorization code is required" }, { status: 400 })
    }

    if (!SSO_CLIENT_ID || !SSO_CLIENT_SECRET) {
      return NextResponse.json(
        { error: "SSO_CLIENT_ID and/or SSO_CLIENT_SECRET env variables are undefined." },
        { status: 500 }
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

    // Create HTML response for successful login
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login Successful</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #faf9f8; /* BC Gov background-light-gray */
          }
          .container {
            text-align: center;
            background: white;
            max-width: 500px;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h4 {
            color: #7ab8f9; /* BC Gov blue-500 */
            margin-top: 0;
            margin-bottom: 1rem;
            font-size: 1.5rem;
            line-height: 1.5em;
          }
          p {
            color: #2d2d2d; /* BC Gov typography-primary */
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h4>Login Successful</h4>
          <p>You may close this window. If it doesn't close automatically, your browser may be preventing it.</p>
        </div>
      </body>
      </html>
    `

    const response = new NextResponse(htmlContent, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    })

    // Set access token cookie
    response.cookies.set("access_token", tokens.access_token, {
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: tokens.expires_in, // Set expiration based on token expiry
    })

    // Set refresh token as HTTP-only cookie
    response.cookies.set("refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: tokens.refresh_expires_in, // Set expiration based on refresh token expiry
    })

    // Set id token cookie
    response.cookies.set("id_token", tokens.id_token, {
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: tokens.expires_in, // Set expiration based on token expiry
    })

    // Set expires_in as cookie
    response.cookies.set("expires_in", tokens.expires_in.toString(), {
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    })

    // Set refresh_expires_in as cookie
    response.cookies.set("refresh_expires_in", tokens.refresh_expires_in.toString(), {
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
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
