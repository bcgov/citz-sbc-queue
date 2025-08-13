export type Session = {
  accessToken: string
  accessExpiresAt: number
  refreshExpiresAt: number
  sessionEndsAt: number
  idToken?: string
}

export type TokenResponse = {
  access_token: string
  expires_in: number
  refresh_expires_in: number
  id_token?: string
}
