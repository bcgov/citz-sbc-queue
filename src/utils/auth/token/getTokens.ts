import { AUTH_URLS } from "../constants"

type Props = {
  code: string
  grantType?: string
  clientID: string
  clientSecret: string
  redirectURI: string
  ssoEnvironment?: "dev" | "test" | "prod"
  ssoRealm?: string
  ssoProtocol?: "openid-connect" | "saml"
}

type Response = {
  id_token: string
  access_token: string
  expires_in: number
  refresh_token: string
  refresh_expires_in: number
}

/**
 * Gets decoded tokens and user information using a code.
 * See https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.3
 */
export const getTokens = async ({
  code,
  grantType = "authorization_code",
  clientID,
  clientSecret,
  redirectURI,
  ssoEnvironment = "dev",
  ssoRealm = "standard",
  ssoProtocol = "openid-connect",
}: Props): Promise<Response> => {
  const params = {
    grant_type: grantType,
    client_id: clientID,
    redirect_uri: redirectURI,
    code,
  }

  const encodedAuthHeader = Buffer.from(`${clientID}:${clientSecret}`).toString("base64")

  const headers = {
    Authorization: `Basic ${encodedAuthHeader}`,
    "Content-Type": "application/x-www-form-urlencoded",
  }

  const authURL = `${AUTH_URLS[ssoEnvironment]}/realms/${ssoRealm}/protocol/${ssoProtocol}`

  const queryString = Object.keys(params)
    .map((key) => `${key}=${params[key as keyof typeof params]}`)
    .join("&")

  const response = await fetch(`${authURL}/token`, {
    method: "POST",
    headers,
    body: queryString,
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch tokens: ${response.status} ${response.statusText}`)
  }

  const { id_token, access_token, expires_in, refresh_token, refresh_expires_in } =
    await response.json()

  return {
    id_token,
    access_token,
    expires_in,
    refresh_token,
    refresh_expires_in,
  }
}
