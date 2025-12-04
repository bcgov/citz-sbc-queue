import type {
  BCEID_IDENTITY_PROVIDERS,
  DIGITAL_CREDENTIALS_IDENTITY_PROVIDERS,
  GITHUB_IDENTITY_PROVIDERS,
  IDIR_IDENTITY_PROVIDERS,
} from "./constants"

export type IdirIdentityProvider = (typeof IDIR_IDENTITY_PROVIDERS)[number]
export type BceidIdentityProvider = (typeof BCEID_IDENTITY_PROVIDERS)[number]
export type GithubIdentityProvider = (typeof GITHUB_IDENTITY_PROVIDERS)[number]
export type DigitalCredentialsIdentityProvider =
  (typeof DIGITAL_CREDENTIALS_IDENTITY_PROVIDERS)[number]

export type SSOIdentityProvider =
  | IdirIdentityProvider
  | BceidIdentityProvider
  | GithubIdentityProvider
  | DigitalCredentialsIdentityProvider

export type BaseTokenPayload<TProvider extends SSOIdentityProvider | unknown> = {
  exp: number
  iat: number
  auth_time: number
  jti: string
  iss: string
  aud: string
  sub: string
  typ: string
  azp: string
  nonce: string
  session_state: string
  scope?: string | undefined
  at_hash?: string | undefined
  sid: string
  identity_provider: TProvider
  preferred_username: string
  client_roles?: string[] | undefined
}

export type SSOIdirUser = BaseTokenPayload<IdirIdentityProvider> & {
  idir_user_guid: string
  idir_username: string
  name: string
  display_name: string
  given_name: string
  family_name: string
  email: string
}

export type TokenPayload<TProvider extends SSOIdentityProvider | unknown> =
  TProvider extends IdirIdentityProvider ? SSOIdirUser : BaseTokenPayload<TProvider>
