"use client"

import { useMemo } from "react"
import { useAuthStore } from "@/stores/auth/store"
import { decodeJWTBrowser } from "@/utils/auth/jwt/decodeJWT.browser"

/**
 * Hook that exposes authentication information derived from the auth store.
 *
 * This hook subscribes to the global `useAuthStore` Zustand store and decodes
 * the access token payload (client-side) so components can access common
 * user attributes and role checks without re-implementing token parsing.
 *
 * Notes:
 * - The decoded token is derived from the `session.accessToken` value stored
 *   in the auth store. The hook will return `isAuthenticated: false` when
 *   `session` is not present.
 * - Decoding is performed with a browser-safe decoder. If decoding fails the
 *   error is logged and decoded data is treated as `undefined` (non-fatal).
 * - Do NOT rely on client-side decoded JWTs for authorization decisions that
 *   require server-side guarantees. Treat the decoded payload as a convenience
 *   for UI/UX only.
 *
 * @returns An object with the following shape:
 * {
 *   isAuthenticated: boolean, // true if session exists in the store
 *   hasRole: (role: string) => boolean, // checks for a role in token.client_roles
 *   display_name?: string | undefined,
 *   email?: string | undefined,
 *   family_name?: string | undefined,
 *   given_name?: string | undefined,
 *   idir_username?: string | undefined,
 * }
 */
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
    idir_user_guid: decodedAccessToken?.idir_user_guid
  }
}

export type UseAuthReturn = {
  isAuthenticated: boolean
  hasRole: (role: string) => boolean
  display_name?: string | undefined
  email?: string | undefined
  family_name?: string | undefined
  given_name?: string | undefined
  idir_username?: string | undefined
}

// Annotate export with the explicit return type for consumers/IDE hints
export default useAuth
