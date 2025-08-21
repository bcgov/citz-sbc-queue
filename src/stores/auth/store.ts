import { create } from "zustand"
import { refreshTokens, serverLogout } from "./api"
import { clearAuthTimers, scheduleAuthTimers } from "./timers"
import type { Session, TokenResponse } from "./types"

const TEN_HOURS_MS = 10 * 60 * 60 * 1000
const SESSION_START_AT_KEY = "auth.sessionStartAt"

const getSessionStartAt = (): number | null => {
  const raw = typeof window !== "undefined" ? localStorage.getItem(SESSION_START_AT_KEY) : null
  return raw ? Number(raw) : null
}

const setSessionStartAt = (timestamp: number | null): void => {
  if (typeof window === "undefined") return
  if (timestamp) localStorage.setItem(SESSION_START_AT_KEY, String(timestamp))
  else localStorage.removeItem(SESSION_START_AT_KEY)
}

type AuthStore = {
  session: Session | null
  showExpiryWarning: boolean
  isRefreshing: boolean
  loginFromTokens: (tokens: TokenResponse, options?: { resetSessionWindow?: boolean }) => void
  refresh: () => Promise<boolean>
  logout: (reason?: "manual" | "expired") => Promise<void>
  setShowExpiryWarning: (show: boolean) => void
  bootstrap: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  session: null,
  showExpiryWarning: false,
  isRefreshing: false,

  setShowExpiryWarning: (show) => set({ showExpiryWarning: show }),

  // Called after popup login OR after the user chooses "Stay logged in"
  loginFromTokens: (tokens, options) => {
    const now = Date.now()
    // If resetSessionWindow=true (fresh login), start a new 10h window
    let startAt = getSessionStartAt()
    if (options?.resetSessionWindow || !startAt) {
      startAt = now
      setSessionStartAt(startAt)
    }
    const endsAt = startAt + TEN_HOURS_MS

    // If somehow already past end, bail to logout instead
    if (now >= endsAt) {
      void get().logout("expired")
      return
    }

    set({
      session: {
        accessToken: tokens.access_token,
        accessExpiresAt: now + tokens.expires_in * 1000,
        refreshExpiresAt: now + tokens.refresh_expires_in * 1000,
        sessionEndsAt: endsAt,
        idToken: tokens.id_token,
      },
      showExpiryWarning: false,
    })

    scheduleAuthTimers({
      getSession: () => get().session,
      onRefresh: () => get().refresh(),
      onShowWarning: () => get().setShowExpiryWarning(true),
      onHardLogout: () => get().logout("expired"),
    })
  },

  // Background access-token refresh (5m cadence) – does NOT move session window
  refresh: async () => {
    if (get().isRefreshing) return true // Already refreshing

    const session = get().session
    const now = Date.now()

    // Hard stop if 10h window is over
    if (!session || now >= session.sessionEndsAt) return false

    set({ isRefreshing: true })
    try {
      const data = await refreshTokens()
      if (!data) return false

      get().loginFromTokens(data, { resetSessionWindow: false })
      // Note: loginFromTokens recomputes endsAt using current startAt (unchanged)
      return true
    } catch (error) {
      console.error("Failed to refresh tokens:", error)
      return false
    } finally {
      set({ isRefreshing: false })
    }
  },

  logout: async () => {
    clearAuthTimers()
    set({ session: null, showExpiryWarning: false })
    setSessionStartAt(null)
    await serverLogout()
  },

  // Called once on app mount: try to silently obtain tokens from refresh cookie
  bootstrap: async () => {
    // If we have a stored startAt, verify the 10h window hasn't passed
    const startAt = getSessionStartAt()
    if (startAt && Date.now() >= startAt + TEN_HOURS_MS) {
      // session window is over
      setSessionStartAt(null)
      return
    }

    // Try refreshing with the HttpOnly cookie; if succeeds, reuse existing startAt
    const data = await refreshTokens()
    if (!data) return

    get().loginFromTokens(data, { resetSessionWindow: false })
  },
}))
