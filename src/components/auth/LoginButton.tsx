"use client"

import { useCallback } from "react"
import { useAuthStore } from "@/stores/auth/store"
import { openPopup } from "@/utils/auth/popup/openPopup"
import { pollPopupLogin } from "@/utils/auth/popup/pollPopupLogin"

/**
 * Login button component that opens a popup for user authentication.
 */
export const LoginButton = () => {
  const loginFromTokens = useAuthStore((s) => s.loginFromTokens)

  const onClick = useCallback(async () => {
    // 1) Open popup synchronously (prevents blockers)
    const popup = openPopup("/api/auth/login")
    if (!popup) {
      // Popup was blocked by the browser - open in new tab as fallback
      window.open("/api/auth/login", "_blank")
      return
    }

    // 2) Poll the popup for successful callback + tokens
    try {
      const payload = await pollPopupLogin(popup)
      loginFromTokens(payload, { resetSessionWindow: true })
    } catch (err) {
      console.error(`Login failed: ${err}`)
    }
  }, [loginFromTokens])

  return (
    <button type="button" className="primary" onClick={onClick}>
      Login
    </button>
  )
}

export default LoginButton
