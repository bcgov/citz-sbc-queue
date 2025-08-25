import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { refreshTokens } from "./api"
import { useAuthStore } from "./store"
import { clearAuthTimers, scheduleAuthTimers } from "./timers"
import type { Session, TokenResponse } from "./types"

// Mock dependencies
vi.mock("./api")
vi.mock("./timers")

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
})

// Type the mocked functions
const mockedRefreshTokens = vi.mocked(refreshTokens)
const mockedClearAuthTimers = vi.mocked(clearAuthTimers)
const mockedScheduleAuthTimers = vi.mocked(scheduleAuthTimers)

describe("auth/store", () => {
  let store: ReturnType<typeof useAuthStore.getState>

  const mockTokenResponse: TokenResponse = {
    access_token: "new.access.token",
    expires_in: 3600,
    refresh_expires_in: 7200,
    id_token: "new.id.token",
  }

  const mockSession: Session = {
    accessToken: "test.access.token",
    accessExpiresAt: Date.now() + 3600000,
    refreshExpiresAt: Date.now() + 7200000,
    sessionEndsAt: Date.now() + 36000000, // 10 hours
    idToken: "test.id.token",
  }

  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({
      session: null,
      showExpiryWarning: false,
      isRefreshing: false,
    })

    store = useAuthStore.getState()

    // Clear all mocks
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)

    // Mock Date.now for consistent testing
    vi.spyOn(Date, "now").mockReturnValue(1000000000000) // Fixed timestamp
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("initial state", () => {
    it("should have correct initial state", () => {
      expect(store.session).toBeNull()
      expect(store.showExpiryWarning).toBe(false)
      expect(store.isRefreshing).toBe(false)
    })
  })

  describe("setShowExpiryWarning", () => {
    it("should update showExpiryWarning state", () => {
      store.setShowExpiryWarning(true)
      expect(useAuthStore.getState().showExpiryWarning).toBe(true)

      store.setShowExpiryWarning(false)
      expect(useAuthStore.getState().showExpiryWarning).toBe(false)
    })
  })

  describe("loginFromTokens", () => {
    it("should create session with new session window when resetSessionWindow is true", () => {
      const now = Date.now()

      store.loginFromTokens(mockTokenResponse, { resetSessionWindow: true })

      const state = useAuthStore.getState()
      expect(state.session).toEqual({
        accessToken: mockTokenResponse.access_token,
        accessExpiresAt: now + mockTokenResponse.expires_in * 1000,
        refreshExpiresAt: now + mockTokenResponse.refresh_expires_in * 1000,
        sessionEndsAt: now + 10 * 60 * 60 * 1000, // 10 hours
        idToken: mockTokenResponse.id_token,
      })
      expect(state.showExpiryWarning).toBe(false)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("auth.sessionStartAt", String(now))
      expect(mockedScheduleAuthTimers).toHaveBeenCalled()
    })

    it("should create session with existing session window when resetSessionWindow is false", () => {
      const now = Date.now()
      const existingStartAt = now - 1000000 // 1000 seconds ago
      mockLocalStorage.getItem.mockReturnValue(String(existingStartAt))

      store.loginFromTokens(mockTokenResponse, { resetSessionWindow: false })

      const state = useAuthStore.getState()
      expect(state.session?.sessionEndsAt).toBe(existingStartAt + 10 * 60 * 60 * 1000)
      // Should not set sessionStartAt again
      expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith(
        "auth.sessionStartAt",
        expect.any(String)
      )
    })

    it("should create new session window when no existing startAt and resetSessionWindow is false", () => {
      const now = Date.now()
      mockLocalStorage.getItem.mockReturnValue(null)

      store.loginFromTokens(mockTokenResponse, { resetSessionWindow: false })

      const state = useAuthStore.getState()
      expect(state.session?.sessionEndsAt).toBe(now + 10 * 60 * 60 * 1000)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("auth.sessionStartAt", String(now))
    })

    it("should logout when session window has already expired", () => {
      const now = Date.now()
      const expiredStartAt = now - 11 * 60 * 60 * 1000 // 11 hours ago
      mockLocalStorage.getItem.mockReturnValue(String(expiredStartAt))

      const logoutSpy = vi.spyOn(store, "logout").mockResolvedValue()

      store.loginFromTokens(mockTokenResponse)

      expect(logoutSpy).toHaveBeenCalledWith("expired")
      expect(useAuthStore.getState().session).toBeNull()
    })

    // idToken is only set from token response now; no localStorage fallback
    it("should set idToken to undefined if not present in token response", () => {
      const tokenWithoutId = { ...mockTokenResponse, id_token: undefined }
      store.loginFromTokens(tokenWithoutId)
      const state = useAuthStore.getState()
      expect(state.session?.idToken).toBeUndefined()
    })

    it("should clear showExpiryWarning when logging in", () => {
      useAuthStore.setState({ showExpiryWarning: true })

      store.loginFromTokens(mockTokenResponse)

      expect(useAuthStore.getState().showExpiryWarning).toBe(false)
    })
  })

  describe("refresh", () => {
    beforeEach(() => {
      useAuthStore.setState({ session: mockSession })
    })

    it("should refresh tokens successfully and update session", async () => {
      mockedRefreshTokens.mockResolvedValue(mockTokenResponse)

      const result = await store.refresh()

      expect(result).toBe(true)
      expect(mockedRefreshTokens).toHaveBeenCalled()
      expect(useAuthStore.getState().isRefreshing).toBe(false)

      // Check that the session was updated
      const updatedSession = useAuthStore.getState().session
      expect(updatedSession?.accessToken).toBe(mockTokenResponse.access_token)
    })

    it("should return false when refresh fails", async () => {
      mockedRefreshTokens.mockResolvedValue(null)

      const result = await store.refresh()

      expect(result).toBe(false)
      expect(useAuthStore.getState().isRefreshing).toBe(false)
    })

    it("should return false when session has expired", async () => {
      const expiredSession = { ...mockSession, sessionEndsAt: Date.now() - 1000 }
      useAuthStore.setState({ session: expiredSession })

      const result = await store.refresh()

      expect(result).toBe(false)
      expect(mockedRefreshTokens).not.toHaveBeenCalled()
    })

    it("should return false when no session exists", async () => {
      useAuthStore.setState({ session: null })

      const result = await store.refresh()

      expect(result).toBe(false)
      expect(mockedRefreshTokens).not.toHaveBeenCalled()
    })

    it("should set isRefreshing during refresh process", async () => {
      let refreshingDuringCall = false
      mockedRefreshTokens.mockImplementation(async () => {
        refreshingDuringCall = useAuthStore.getState().isRefreshing
        return mockTokenResponse
      })

      await store.refresh()

      expect(refreshingDuringCall).toBe(true)
      expect(useAuthStore.getState().isRefreshing).toBe(false)
    })

    it("should handle refresh errors gracefully", async () => {
      mockedRefreshTokens.mockRejectedValue(new Error("Network error"))

      const result = await store.refresh()

      expect(result).toBe(false)
      expect(useAuthStore.getState().isRefreshing).toBe(false)
    })
  })

  describe("logout", () => {
    beforeEach(() => {
      useAuthStore.setState({ session: mockSession, showExpiryWarning: true })
    })

    it("should clear session", async () => {
      await store.logout()

      const state = useAuthStore.getState()
      expect(state.session).toBeNull()
      expect(state.showExpiryWarning).toBe(false)
      expect(mockedClearAuthTimers).toHaveBeenCalled()
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("auth.sessionStartAt")
    })

    it("should handle logout when no session exists", async () => {
      useAuthStore.setState({ session: null })

      await store.logout()

      expect(mockedClearAuthTimers).toHaveBeenCalled()
    })
  })

  describe("bootstrap", () => {
    it("should refresh tokens and login when valid session window exists", async () => {
      const validStartAt = Date.now() - 1000000 // 1000 seconds ago, within 10 hour window
      mockLocalStorage.getItem.mockReturnValue(String(validStartAt))
      mockedRefreshTokens.mockResolvedValue(mockTokenResponse)
      const loginFromTokensSpy = vi.spyOn(store, "loginFromTokens")

      await store.bootstrap()

      expect(mockedRefreshTokens).toHaveBeenCalled()
      expect(loginFromTokensSpy).toHaveBeenCalledWith(mockTokenResponse, {
        resetSessionWindow: false,
      })
    })

    it("should clear expired session window and not attempt refresh", async () => {
      const expiredStartAt = Date.now() - 11 * 60 * 60 * 1000 // 11 hours ago
      mockLocalStorage.getItem.mockReturnValue(String(expiredStartAt))

      await store.bootstrap()

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("auth.sessionStartAt")
      expect(mockedRefreshTokens).not.toHaveBeenCalled()
    })

    it("should handle refresh failure gracefully", async () => {
      const validStartAt = Date.now() - 1000000
      mockLocalStorage.getItem.mockReturnValue(String(validStartAt))
      mockedRefreshTokens.mockResolvedValue(null)

      await store.bootstrap()

      expect(mockedRefreshTokens).toHaveBeenCalled()
      expect(useAuthStore.getState().session).toBeNull()
    })

    it("should proceed when no stored session start time", async () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      mockedRefreshTokens.mockResolvedValue(mockTokenResponse)

      await store.bootstrap()

      expect(mockedRefreshTokens).toHaveBeenCalled()
    })

    it("should handle bootstrap when window is undefined (SSR)", async () => {
      // Mock server-side environment
      const originalWindow = global.window
      // @ts-expect-error - Testing SSR scenario
      delete global.window

      await store.bootstrap()

      // Should not throw and should try to refresh
      expect(mockedRefreshTokens).toHaveBeenCalled()

      // Restore window
      global.window = originalWindow
    })
  })

  describe("localStorage helpers", () => {
    it("should handle localStorage operations when window is undefined", () => {
      const originalWindow = global.window
      // @ts-expect-error - Testing SSR scenario
      delete global.window

      // These should not throw
      store.loginFromTokens(mockTokenResponse)

      // Restore window
      global.window = originalWindow
    })

    it("should handle invalid sessionStartAt values", () => {
      mockLocalStorage.getItem.mockReturnValue("invalid-number")

      // Should not throw and should treat as null
      store.loginFromTokens(mockTokenResponse)

      // Should create new session window
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "auth.sessionStartAt",
        expect.any(String)
      )
    })
  })

  describe("timer integration", () => {
    it("should schedule timers with correct callbacks", async () => {
      const logoutSpy = vi.spyOn(store, "logout").mockResolvedValue()
      const refreshSpy = vi.spyOn(store, "refresh").mockResolvedValue(true)

      store.loginFromTokens(mockTokenResponse)

      expect(mockedScheduleAuthTimers).toHaveBeenCalledWith({
        getSession: expect.any(Function),
        onRefresh: expect.any(Function),
        onShowWarning: expect.any(Function),
        onHardLogout: expect.any(Function),
      })

      // Test the callbacks
      const call = mockedScheduleAuthTimers.mock.calls[0][0]

      // getSession should return current session
      const currentSession = call.getSession()
      expect(currentSession).toEqual(useAuthStore.getState().session)

      // onRefresh should call the refresh method
      await call.onRefresh()
      expect(refreshSpy).toHaveBeenCalled()

      // onShowWarning should set warning state
      call.onShowWarning()
      expect(useAuthStore.getState().showExpiryWarning).toBe(true)

      // onHardLogout should call logout with expired reason
      await call.onHardLogout()
      expect(logoutSpy).toHaveBeenCalledWith("expired")
    })
  })
})
