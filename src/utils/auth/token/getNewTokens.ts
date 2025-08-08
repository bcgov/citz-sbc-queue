import { AUTH_URLS } from "../constants"
import { isJWTValid } from "../jwt/isJWTValid"

type Props = {
  refreshToken: string
  clientID: string
  clientSecret: string
  ssoEnvironment?: "dev" | "test" | "prod"
  ssoRealm?: string
  ssoProtocol?: "openid-connect" | "saml"
}

type Response = {
  access_token: string
  refresh_token: string
  id_token: string
  expires_in: number
  refresh_expires_in: number
} | null

export const getNewTokens = async ({
  refreshToken,
  clientID,
  clientSecret,
  ssoEnvironment = "dev",
  ssoRealm = "standard",
  ssoProtocol = "openid-connect",
}: Props): Promise<Response> => {
  const isTokenValid = await isJWTValid({
    jwt: refreshToken,
    clientID,
    clientSecret,
    ssoEnvironment,
    ssoProtocol,
    ssoRealm,
  })
  if (!isTokenValid) return null

  const params = {
    grant_type: "refresh_token",
    client_id: clientID,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  }

  const authURL = `${AUTH_URLS[ssoEnvironment]}/realms/${ssoRealm}/protocol/${ssoProtocol}`

  const queryString = Object.keys(params)
    .map((key) => `${key}=${params[key as keyof typeof params]}`)
    .join("&")

  const response = await fetch(`${authURL}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: queryString,
  })

  const data = await response.json()

  const { access_token, refresh_token, id_token, expires_in, refresh_expires_in } = data
  if (!data || !access_token || !id_token)
    throw new Error("Couldn't get access or id token from KC token endpoint")

  return {
    access_token,
    refresh_token,
    id_token,
    expires_in,
    refresh_expires_in,
  }
}
