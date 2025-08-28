"use client"

import { useCallback } from "react"

export type LogoutButtonProps = {
  text?: string
  variant?: "primary" | "secondary" | "tertiary"
}

/**
 * Logout button which navigates the browser to the logout API.
 * The API will redirect to the SSO logout page and then back to the
 * provided post-logout redirect (we attach `?post_logout=true`).
 *
 * @param {LogoutButtonProps} props - Props for the logout button
 *
 * @property {string} [text="Logout"] - The button text
 * @property {string} [variant="primary"] - The button variant
 */
export const LogoutButton = ({ text = "Logout", variant = "primary" }: LogoutButtonProps) => {
  const onClick = useCallback(() => {
    const redirectUri = `${window.location.origin}/?post_logout=true`
    // Force a full navigation so cookies are sent to /api/auth/logout
    window.location.href = `/api/auth/logout?redirect_uri=${encodeURIComponent(redirectUri)}`
  }, [])

  return (
    <button type="button" className={`${variant}`} onClick={onClick}>
      {text}
    </button>
  )
}

export default LogoutButton
