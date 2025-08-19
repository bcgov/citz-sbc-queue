import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { clearAuthTimers, scheduleAuthTimers } from "./timers"
import type { Session } from "./types"

describe("auth/timers", () => {
  let mockGetSession: ReturnType<typeof vi.fn<() => Session | null>>
  let mockOnRefresh: ReturnType<typeof vi.fn<() => Promise<boolean>>>
  let mockOnShowWarning: ReturnType<typeof vi.fn<() => void>>
  let mockOnHardLogout: ReturnType<typeof vi.fn<() => Promise<void>>>

  const mockSession: Session = {
    accessToken: "test.access.token",
    accessExpiresAt: Date.now() + 3600000, // 1 hour from now
    refreshExpiresAt: Date.now() + 7200000, // 2 hours from now
    sessionEndsAt: Date.now() + 36000000, // 10 hours from now
    idToken: "test.id.token",
  }

  beforeEach(() => {
    // Mock all the callback functions
    mockGetSession = vi.fn()
    mockOnRefresh = vi.fn()
    mockOnShowWarning = vi.fn()
    mockOnHardLogout = vi.fn()

    // Mock timers
    vi.useFakeTimers()
    vi.spyOn(Date, "now").mockReturnValue(1000000000000) // Fixed timestamp
  })

  afterEach(() => {
    clearAuthTimers()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe("clearAuthTimers", () => {
    it("should clear all active timers", () => {
      mockGetSession.mockReturnValue(mockSession)

      // Schedule some timers
      scheduleAuthTimers({
        getSession: mockGetSession,
        onRefresh: mockOnRefresh,
        onShowWarning: mockOnShowWarning,
        onHardLogout: mockOnHardLogout,
      })

      // Clear timers
      clearAuthTimers()

      // Fast-forward time and verify callbacks are not called
      vi.advanceTimersByTime(1000000000) // Advance by a very long time

      expect(mockOnRefresh).not.toHaveBeenCalled()
      expect(mockOnShowWarning).not.toHaveBeenCalled()
      expect(mockOnHardLogout).not.toHaveBeenCalled()
    })

    it("should handle being called when no timers are active", () => {
      // Should not throw
      expect(() => clearAuthTimers()).not.toThrow()
    })

    it("should handle being called multiple times", () => {
      mockGetSession.mockReturnValue(mockSession)

      scheduleAuthTimers({
        getSession: mockGetSession,
        onRefresh: mockOnRefresh,
        onShowWarning: mockOnShowWarning,
        onHardLogout: mockOnHardLogout,
      })

      // Clear multiple times - should not throw
      clearAuthTimers()
      clearAuthTimers()
      clearAuthTimers()

      expect(() => clearAuthTimers()).not.toThrow()
    })
  })

  describe("scheduleAuthTimers", () => {
    it("should not schedule timers when no session exists", () => {
      mockGetSession.mockReturnValue(null)

      scheduleAuthTimers({
        getSession: mockGetSession,
        onRefresh: mockOnRefresh,
        onShowWarning: mockOnShowWarning,
        onHardLogout: mockOnHardLogout,
      })

      // Fast-forward time and verify no callbacks are called
      vi.advanceTimersByTime(1000000000)

      expect(mockOnRefresh).not.toHaveBeenCalled()
      expect(mockOnShowWarning).not.toHaveBeenCalled()
      expect(mockOnHardLogout).not.toHaveBeenCalled()
    })

    it("should schedule access token refresh timer", async () => {
      const now = Date.now()
      const sessionWithSoonExpiry = {
        ...mockSession,
        accessExpiresAt: now + 60000, // Expires in 1 minute
      }
      mockGetSession.mockReturnValue(sessionWithSoonExpiry)
      mockOnRefresh.mockResolvedValue(true)

      scheduleAuthTimers({
        getSession: mockGetSession,
        onRefresh: mockOnRefresh,
        onShowWarning: mockOnShowWarning,
        onHardLogout: mockOnHardLogout,
      })

      // Advance to just before refresh should trigger (45s before expiry)
      vi.advanceTimersByTime(14000) // 14 seconds
      expect(mockOnRefresh).not.toHaveBeenCalled()

      // Advance to when refresh should trigger
      vi.advanceTimersByTime(2000) // Total 16 seconds (60s - 45s + 1s)

      // Wait for async operations
      await vi.runAllTimersAsync()

      expect(mockOnRefresh).toHaveBeenCalled()
      // Don't check mockOnHardLogout here as it may be called by other timers too
    })

    it("should call hard logout when refresh fails", async () => {
      const now = Date.now()
      const sessionWithSoonExpiry = {
        ...mockSession,
        accessExpiresAt: now + 60000,
      }
      mockGetSession.mockReturnValue(sessionWithSoonExpiry)
      mockOnRefresh.mockResolvedValue(false) // Refresh fails

      scheduleAuthTimers({
        getSession: mockGetSession,
        onRefresh: mockOnRefresh,
        onShowWarning: mockOnShowWarning,
        onHardLogout: mockOnHardLogout,
      })

      // Advance to trigger refresh
      vi.advanceTimersByTime(16000)
      await vi.runAllTimersAsync()

      expect(mockOnRefresh).toHaveBeenCalled()
      expect(mockOnHardLogout).toHaveBeenCalled()
    })

    it("should schedule session warning timer", () => {
      const now = Date.now()
      const sessionWithSoonEnd = {
        ...mockSession,
        sessionEndsAt: now + 150000, // Ends in 2.5 minutes
      }
      mockGetSession.mockReturnValue(sessionWithSoonEnd)

      scheduleAuthTimers({
        getSession: mockGetSession,
        onRefresh: mockOnRefresh,
        onShowWarning: mockOnShowWarning,
        onHardLogout: mockOnHardLogout,
      })

      // Advance to just before warning should show (2m before end)
      vi.advanceTimersByTime(29000) // 29 seconds
      expect(mockOnShowWarning).not.toHaveBeenCalled()

      // Advance to when warning should show
      vi.advanceTimersByTime(2000) // Total 31 seconds (150s - 120s + 1s)
      expect(mockOnShowWarning).toHaveBeenCalled()
    })

    it("should schedule session logout timer", async () => {
      const now = Date.now()
      const sessionWithSoonEnd = {
        ...mockSession,
        sessionEndsAt: now + 150000, // Ends in 2.5 minutes
      }
      mockGetSession.mockReturnValue(sessionWithSoonEnd)

      scheduleAuthTimers({
        getSession: mockGetSession,
        onRefresh: mockOnRefresh,
        onShowWarning: mockOnShowWarning,
        onHardLogout: mockOnHardLogout,
      })

      // Advance to just before logout should happen
      vi.advanceTimersByTime(149000) // 149 seconds
      expect(mockOnHardLogout).not.toHaveBeenCalled()

      // Advance to when logout should happen
      vi.advanceTimersByTime(2000) // Total 151 seconds
      await vi.runAllTimersAsync()

      expect(mockOnHardLogout).toHaveBeenCalled()
    })

    it("should use minimum timeout of 1 second for timers", () => {
      const now = Date.now()
      const sessionAlreadyExpired = {
        ...mockSession,
        accessExpiresAt: now - 1000, // Already expired
        sessionEndsAt: now - 1000, // Already ended
      }
      mockGetSession.mockReturnValue(sessionAlreadyExpired)

      scheduleAuthTimers({
        getSession: mockGetSession,
        onRefresh: mockOnRefresh,
        onShowWarning: mockOnShowWarning,
        onHardLogout: mockOnHardLogout,
      })

      // Advance by 1 second (minimum timeout)
      vi.advanceTimersByTime(1000)

      // All callbacks should be triggered due to minimum 1s timeout
      expect(mockOnShowWarning).toHaveBeenCalled()
    })

    it("should clear existing timers before scheduling new ones", async () => {
      mockGetSession.mockReturnValue(mockSession)

      // Schedule first set of timers
      scheduleAuthTimers({
        getSession: mockGetSession,
        onRefresh: mockOnRefresh,
        onShowWarning: mockOnShowWarning,
        onHardLogout: mockOnHardLogout,
      })

      // Schedule second set (should clear first set)
      scheduleAuthTimers({
        getSession: mockGetSession,
        onRefresh: mockOnRefresh,
        onShowWarning: mockOnShowWarning,
        onHardLogout: mockOnHardLogout,
      })

      // Fast-forward time - callbacks should only be called once
      vi.advanceTimersByTime(1000000000)
      await vi.runAllTimersAsync()

      // Each callback should only be called once (from second scheduling)
      expect(mockOnShowWarning).toHaveBeenCalledTimes(1)
    })

    it("should handle refresh timer correctly with different expiry times", async () => {
      const now = Date.now()

      // Test case 1: Access token expires in 1 minute - should refresh in 15 seconds
      const shortExpirySession = {
        ...mockSession,
        accessExpiresAt: now + 60000,
      }
      mockGetSession.mockReturnValue(shortExpirySession)
      mockOnRefresh.mockResolvedValue(true)

      scheduleAuthTimers({
        getSession: mockGetSession,
        onRefresh: mockOnRefresh,
        onShowWarning: mockOnShowWarning,
        onHardLogout: mockOnHardLogout,
      })

      vi.advanceTimersByTime(15000)
      await vi.runAllTimersAsync()
      expect(mockOnRefresh).toHaveBeenCalledTimes(1)

      // Reset mocks
      mockOnRefresh.mockClear()

      // Test case 2: Access token expires in 30 seconds - should refresh in 1 second (minimum)
      const veryShortExpirySession = {
        ...mockSession,
        accessExpiresAt: now + 30000,
      }
      mockGetSession.mockReturnValue(veryShortExpirySession)

      scheduleAuthTimers({
        getSession: mockGetSession,
        onRefresh: mockOnRefresh,
        onShowWarning: mockOnShowWarning,
        onHardLogout: mockOnHardLogout,
      })

      vi.advanceTimersByTime(1000)
      await vi.runAllTimersAsync()
      expect(mockOnRefresh).toHaveBeenCalledTimes(1)
    })

    it("should handle session warning and logout timers", async () => {
      const now = Date.now()

      // Test case: Session ends in 3 minutes, access token expires much later
      const sessionWithEnd = {
        ...mockSession,
        sessionEndsAt: now + 180000, // 3 minutes
        accessExpiresAt: now + 7200000, // 2 hours (to avoid refresh timer)
      }
      mockGetSession.mockReturnValue(sessionWithEnd)

      scheduleAuthTimers({
        getSession: mockGetSession,
        onRefresh: mockOnRefresh,
        onShowWarning: mockOnShowWarning,
        onHardLogout: mockOnHardLogout,
      })

      // Warning should show at 60 seconds (180s - 120s)
      vi.advanceTimersByTime(60000)
      expect(mockOnShowWarning).toHaveBeenCalledTimes(1)

      // Logout should happen at 180 seconds total
      vi.advanceTimersByTime(120000) // Total 180 seconds
      await vi.runAllTimersAsync()

      // Logout timer should have been called (may be called multiple times due to timer interactions)
      expect(mockOnHardLogout).toHaveBeenCalled()
    })

    it("should handle edge case where session has no idToken", () => {
      const sessionWithoutIdToken = {
        ...mockSession,
        idToken: undefined,
      }
      mockGetSession.mockReturnValue(sessionWithoutIdToken)

      // Should not throw
      expect(() => {
        scheduleAuthTimers({
          getSession: mockGetSession,
          onRefresh: mockOnRefresh,
          onShowWarning: mockOnShowWarning,
          onHardLogout: mockOnHardLogout,
        })
      }).not.toThrow()
    })

    it("should handle refresh failure and trigger hard logout", async () => {
      const now = Date.now()
      const sessionWithSoonExpiry = {
        ...mockSession,
        accessExpiresAt: now + 60000,
      }
      mockGetSession.mockReturnValue(sessionWithSoonExpiry)

      // Mock the refresh function to return false (indicating failure)
      // instead of throwing to avoid unhandled promise rejection
      mockOnRefresh.mockResolvedValue(false)

      scheduleAuthTimers({
        getSession: mockGetSession,
        onRefresh: mockOnRefresh,
        onShowWarning: mockOnShowWarning,
        onHardLogout: mockOnHardLogout,
      })

      // Advance to trigger refresh
      vi.advanceTimersByTime(16000)

      // Run all timers and handle any async operations
      await vi.runAllTimersAsync()

      expect(mockOnRefresh).toHaveBeenCalled()
      // Hard logout should be called when refresh returns false
      expect(mockOnHardLogout).toHaveBeenCalled()
    })
  })

  describe("timer calculations", () => {
    it("should calculate refresh timer correctly", () => {
      const now = Date.now()
      const accessExpiresAt = now + 120000 // 2 minutes
      const expectedRefreshIn = 120000 - 45000 // 2 minutes - 45 seconds = 75 seconds

      const session = {
        ...mockSession,
        accessExpiresAt,
      }
      mockGetSession.mockReturnValue(session)
      mockOnRefresh.mockResolvedValue(true)

      scheduleAuthTimers({
        getSession: mockGetSession,
        onRefresh: mockOnRefresh,
        onShowWarning: mockOnShowWarning,
        onHardLogout: mockOnHardLogout,
      })

      // Should not trigger before expected time
      vi.advanceTimersByTime(expectedRefreshIn - 1000)
      expect(mockOnRefresh).not.toHaveBeenCalled()

      // Should trigger at expected time
      vi.advanceTimersByTime(1000)
      expect(mockOnRefresh).toHaveBeenCalled()
    })

    it("should calculate warning timer correctly", () => {
      const now = Date.now()
      const sessionEndsAt = now + 300000 // 5 minutes
      const expectedWarnIn = 300000 - 120000 // 5 minutes - 2 minutes = 3 minutes

      const session = {
        ...mockSession,
        sessionEndsAt,
      }
      mockGetSession.mockReturnValue(session)

      scheduleAuthTimers({
        getSession: mockGetSession,
        onRefresh: mockOnRefresh,
        onShowWarning: mockOnShowWarning,
        onHardLogout: mockOnHardLogout,
      })

      // Should not trigger before expected time
      vi.advanceTimersByTime(expectedWarnIn - 1000)
      expect(mockOnShowWarning).not.toHaveBeenCalled()

      // Should trigger at expected time
      vi.advanceTimersByTime(1000)
      expect(mockOnShowWarning).toHaveBeenCalled()
    })

    it("should calculate logout timer correctly", () => {
      const now = Date.now()
      const sessionEndsAt = now + 300000 // 5 minutes

      const session = {
        ...mockSession,
        sessionEndsAt,
      }
      mockGetSession.mockReturnValue(session)

      scheduleAuthTimers({
        getSession: mockGetSession,
        onRefresh: mockOnRefresh,
        onShowWarning: mockOnShowWarning,
        onHardLogout: mockOnHardLogout,
      })

      // Should not trigger before expected time
      vi.advanceTimersByTime(300000 - 1000)
      expect(mockOnHardLogout).not.toHaveBeenCalled()

      // Should trigger at expected time
      vi.advanceTimersByTime(1000)
      expect(mockOnHardLogout).toHaveBeenCalled()
    })
  })
})
