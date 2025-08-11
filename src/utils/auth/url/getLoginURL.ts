import { AUTH_URLS } from "../constants"

type Props = {
  idpHint: string
  clientID: string
  responseType?: string
  scope?: string
  redirectURI: string
  ssoEnvironment?: "dev" | "test" | "prod"
  ssoRealm?: string
  ssoProtocol?: "openid-connect" | "saml"
}

/**
 * Gets the authorization URL to redirect the user to the OIDC server for authentication.
 * See https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.1
 */
export const getLoginURL = ({
  idpHint,
  clientID,
  responseType = "code",
  scope = "email+openid",
  redirectURI,
  ssoEnvironment = "dev",
  ssoRealm = "standard",
  ssoProtocol = "openid-connect",
}: Props): string => {
  const authURL = `${AUTH_URLS[ssoEnvironment]}/realms/${ssoRealm}/protocol/${ssoProtocol}`

  const params: Record<string, string | undefined> = {
    client_id: clientID,
    response_type: responseType,
    scope: scope,
    kc_idp_hint: idpHint,
    redirect_uri: encodeURIComponent(redirectURI),
  }

  const queryString = Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join("&")

  return `${authURL}/auth?${queryString}`
}
