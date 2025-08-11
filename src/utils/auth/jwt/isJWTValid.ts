import { AUTH_URLS } from "../constants"

type Props = {
  jwt: string
  clientID: string
  clientSecret: string
  ssoEnvironment?: "dev" | "test" | "prod"
  ssoRealm?: string
  ssoProtocol?: "openid-connect" | "saml"
}

export const isJWTValid = async ({
  jwt,
  clientID,
  clientSecret,
  ssoEnvironment = "dev",
  ssoRealm = "standard",
  ssoProtocol = "openid-connect",
}: Props): Promise<boolean> => {
  const params = {
    client_id: clientID,
    client_secret: clientSecret,
    token: jwt,
  }

  const headers = {
    Accept: "*/*",
    "Content-Type": "application/x-www-form-urlencoded",
  }

  const authURL = `${AUTH_URLS[ssoEnvironment]}/realms/${ssoRealm}/protocol/${ssoProtocol}`

  const queryString = Object.keys(params)
    .map(
      (key) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(params[key as keyof typeof params])}`
    )
    .join("&")

  const response = await fetch(`${authURL}/token/introspect`, {
    method: "POST",
    headers,
    body: queryString,
  })

  if (!response.ok)
    throw new Error(`Failed to validate JWT: ${response.status} ${response.statusText}`)

  const { active } = await response.json()
  return active
}
