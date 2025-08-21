import type { TokenResponse } from "./types"

export const refreshTokens = async (): Promise<TokenResponse | null> => {
  const response = await fetch("/api/auth/token", {
    method: "POST",
    credentials: "include",
  })
  if (!response.ok) return null
  return (await response.json()) as TokenResponse
}

export const serverLogout = async (): Promise<void> => {
  void fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  })
}
