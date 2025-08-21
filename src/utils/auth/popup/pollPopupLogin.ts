/**
 * Polls an *already-opened* popup until it lands on /api/auth/login/callback and returns token data from cookies.
 * @param popup The popup window to poll.
 * @returns A promise that resolves with the token data read from cookies.
 */
export const pollPopupLogin = (
  popup: Window
): Promise<{
  access_token: string
  expires_in: number
  refresh_expires_in: number
  id_token: string
}> => {
  return new Promise((resolve, reject) => {
    const POLL_MS = 300
    const TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes
    const start = Date.now()
    let done = false

    // The popup will be closed when:
    // 1) Login succeeds (after cookies are set), or
    // 2) The user manually closes the popup, or
    // 3) The timeout (5 minutes) is exceeded.

    const stop = (err?: Error) => {
      if (done) return
      done = true
      try {
        popup.close()
      } catch {
        console.warn("Failed to close login popup")
      }
      if (err) reject(err)
    }

    const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms))

    const ensurePopupLoaded = async () => {
      // Wait until the popup callback page fully loads to ensure Set-Cookie is committed.
      try {
        for (let i = 0; i < 100; i++) {
          // ~5s
          if (popup.document?.readyState === "complete") return
          await wait(50)
        }
      } catch {
        /* ignore; we'll still try to read cookies */
      }
    }

    const readTokensFromCookies = (): {
      access_token: string
      expires_in: number
      refresh_expires_in: number
      id_token: string
    } => {
      const getCookie = (name: string): string | null => {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop()?.split(";").shift() || null
        return null
      }

      const access_token = getCookie("access_token")
      const expires_in = getCookie("expires_in")
      const refresh_expires_in = getCookie("refresh_expires_in")
      const id_token = getCookie("id_token")

      if (!access_token || !expires_in || !refresh_expires_in || !id_token) {
        throw new Error("Required authentication cookies not found")
      }

      return {
        access_token,
        expires_in: Number.parseInt(expires_in, 10),
        refresh_expires_in: Number.parseInt(refresh_expires_in, 10),
        id_token,
      }
    }

    const schedule = () => {
      if (!done) window.setTimeout(tick, POLL_MS)
    }

    const tick = async () => {
      if (done) return

      if (popup.closed) return stop(new Error("Popup closed"))
      if (Date.now() - start > TIMEOUT_MS) return stop(new Error("Login popup timed out"))

      let sameOrigin = false
      let path = ""

      try {
        sameOrigin = popup.location.origin === window.location.origin
        path = popup.location.pathname || ""
      } catch {
        // still on IdP
        return schedule()
      }

      // Only proceed on the callback URL (ignore the initial /api/auth/login hop)
      if (!(sameOrigin && path.startsWith("/api/auth/login/callback"))) return schedule()

      try {
        // Ensure the response fully loaded so cookies are committed
        await ensurePopupLoaded()

        // Read tokens from cookies (cookies are shared across same origin)
        const payload = readTokensFromCookies()

        resolve(payload)
        return stop()
      } catch (e) {
        return stop(e instanceof Error ? e : new Error("Login failed"))
      }
    }

    schedule()
  })
}
