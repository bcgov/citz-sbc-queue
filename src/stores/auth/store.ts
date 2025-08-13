import { create } from "zustand"
import { refreshTokens, serverLogout } from "./api"
import { clearAuthTimers, scheduleAuthTimers } from "./timers"
import type { Session, TokenResponse } from "./types"

const TEN_HOURS_MS = 10 * 60 * 60 * 1000
const SESSION_START_AT_KEY = "auth.sessionStartAt"
const ID_TOKEN_KEY = "auth.idToken"

const getSessionStartAt = (): number | null => {
  const raw = typeof window !== "undefined" ? localStorage.getItem(SESSION_START_AT_KEY) : null
  return raw ? Number(raw) : null
}

const setSessionStartAt = (ts: number | null): void => {
  if (typeof window === "undefined") return
  if (ts) localStorage.setItem(SESSION_START_AT_KEY, String(ts))
  else localStorage.removeItem(SESSION_START_AT_KEY)
}

const getIdToken = (): string | undefined =>
  typeof window !== "undefined" ? (localStorage.getItem(ID_TOKEN_KEY) ?? undefined) : undefined

const setIdToken = (v?: string): void => {
  if (typeof window === "undefined") return
  if (v) localStorage.setItem(ID_TOKEN_KEY, v)
  else localStorage.removeItem(ID_TOKEN_KEY)
}

type AuthStore = {
  session: Session | null
  showExpiryWarning: boolean
  isRefreshing: boolean
  loginFromTokens: (t: TokenResponse, opts?: { resetSessionWindow?: boolean }) => void
  refresh: () => Promise<boolean>
  logout: (reason?: "manual" | "expired") => Promise<void>
  setShowExpiryWarning: (v: boolean) => void
  bootstrap: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  session: null,
  showExpiryWarning: false,
  isRefreshing: false,

  setShowExpiryWarning: (v) => set({ showExpiryWarning: v }),

  // Called after popup login OR after the user chooses "Stay logged in"
  loginFromTokens: (t, opts) => {
    const now = Date.now()
    // If resetSessionWindow=true (fresh login), start a new 10h window
    let startAt = getSessionStartAt()
    if (opts?.resetSessionWindow || !startAt) {
      startAt = now
      setSessionStartAt(startAt)
    }
    const endsAt = startAt + TEN_HOURS_MS

    // If somehow already past end, bail to logout instead
    if (now >= endsAt) {
      void get().logout("expired")
      return
    }

    setIdToken(t.id_token)

    set({
      session: {
        accessToken: t.access_token,
        accessExpiresAt: now + t.expires_in * 1000,
        refreshExpiresAt: now + t.refresh_expires_in * 1000,
        sessionEndsAt: endsAt,
        idToken: t.id_token ?? getIdToken(),
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

    const s = get().session
    const now = Date.now()

    // Hard stop if 10h window is over
    if (!s || now >= s.sessionEndsAt) return false

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
    const idToken = get().session?.idToken ?? getIdToken()
    set({ session: null, showExpiryWarning: false })
    setSessionStartAt(null)
    setIdToken(undefined)
    await serverLogout(idToken)
  },

  // Called once on app mount: try to silently obtain tokens from refresh cookie
  bootstrap: async () => {
    // If we have a stored startAt, verify the 10h window hasn't passed
    const startAt = getSessionStartAt()
    if (startAt && Date.now() >= startAt + TEN_HOURS_MS) {
      // session window is over
      setSessionStartAt(null)
      setIdToken(undefined)
      return
    }

    // Try refreshing with the HttpOnly cookie; if succeeds, reuse existing startAt
    const data = await refreshTokens()
    if (!data) return

    get().loginFromTokens(data, { resetSessionWindow: false })
  },
}))
