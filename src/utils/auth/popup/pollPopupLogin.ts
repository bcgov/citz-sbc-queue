/**
 * Polls an *already-opened* popup until it lands on /api/auth/login/callback and returns JSON.
 * @param popup The popup window to poll.
 * @returns A promise that resolves with the parsed JSON response from the popup.
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
    // 1) Login succeeds (after token mint), or
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
        /* ignore; we'll still try to read JSON */
      }
    }

    const schedule = () => {
      if (!done) window.setTimeout(tick, POLL_MS)
    }

    const readJsonFromPopup = (): string | null => {
      try {
        // 1) Most browsers put JSON in a <pre>
        const pre = popup.document?.querySelector?.("pre")
        if (pre?.textContent?.trim()) return pre.textContent.trim()

        // 2) Some expose it as body textContent (not innerText)
        const bodyText = popup.document?.body?.textContent?.trim()
        if (bodyText) return bodyText

        // 3) As a last resort, take the whole document text
        const docText = popup.document?.documentElement?.textContent?.trim()
        if (docText) return docText

        return null
      } catch {
        return null
      }
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

      // Hide the popup UI immediately so JSON doesn't flash
      try {
        const b = popup.document?.body
        if (b) {
          b.style.opacity = "0"
          b.style.visibility = "hidden"
          b.style.transition = "none"
        }
      } catch {
        // Ignore - popup will close soon
      }

      try {
        // Ensure the response fully loaded so cookies are committed
        await ensurePopupLoaded()

        // Read JSON from the popup document
        const text = readJsonFromPopup()

        if (!text) throw new Error("Callback content empty")

        const payload = JSON.parse(text) as {
          access_token: string
          expires_in: number
          refresh_expires_in: number
          id_token: string
        }

        resolve(payload)
        return stop()
      } catch (e) {
        return stop(e instanceof Error ? e : new Error("Login failed"))
      }
    }

    schedule()
  })
}
