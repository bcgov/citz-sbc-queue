import type { TokenResponse } from "./types"

export const refreshTokens = async (): Promise<TokenResponse | null> => {
  const r = await fetch("/api/auth/token", {
    method: "POST",
    credentials: "include",
  })
  if (!r.ok) return null
  return (await r.json()) as TokenResponse
}

export const serverLogout = async (): Promise<void> => {
  void fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  })
}
