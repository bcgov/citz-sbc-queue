"use client"

import { useMemo } from "react"
import { useAuthStore } from "@/stores/auth/store"
import { decodeJWTBrowser } from "@/utils/auth/jwt/decodeJWT.browser"

export const useAuth = () => {
  // Subscribe to the session so components re-render when it changes
  const session = useAuthStore((s) => s.session)

  const decodedAccessToken = useMemo(() => {
    if (session) {
      try {
        const decoded = decodeJWTBrowser(session.accessToken)
        return decoded
      } catch (err) {
        console.error("Failed to decode JWT in client hook:", err)
      }
    }
  }, [session])

  const hasRole = (role: string): boolean => {
    if (!decodedAccessToken || !decodedAccessToken.client_roles) {
      return false
    }
    return decodedAccessToken.client_roles.includes(role)
  }

  return {
    isAuthenticated: !!session,
    hasRole,
    display_name: decodedAccessToken?.display_name,
    email: decodedAccessToken?.email,
    family_name: decodedAccessToken?.family_name,
    given_name: decodedAccessToken?.given_name,
    idir_username: decodedAccessToken?.idir_username,
  }
}
