"use client"

import { useCallback } from "react"

/**
 * Logout button which navigates the browser to the logout API.
 * The API will redirect to the SSO logout page and then back to the
 * provided post-logout redirect (we attach `?post_logout=true`).
 */
export const LogoutButton = () => {
  const onClick = useCallback(() => {
    const redirectUri = `${window.location.origin}/?post_logout=true`
    // Force a full navigation so cookies are sent to /api/auth/logout
    window.location.href = `/api/auth/logout?redirect_uri=${encodeURIComponent(redirectUri)}`
  }, [])

  return (
    <button type="button" className="primary" onClick={onClick}>
      Logout
    </button>
  )
}
