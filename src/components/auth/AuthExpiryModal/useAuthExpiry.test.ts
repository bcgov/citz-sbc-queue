import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useAuthStore } from "@/stores/auth/store"
import { useAuthExpiry } from "./useAuthExpiry"

// Mock the auth store
vi.mock("@/stores/auth/store", () => ({
  useAuthStore: vi.fn(),
}))

const mockedUseAuthStore = vi.mocked(useAuthStore)

describe("useAuthExpiry", () => {
  // Mock timers to control setInterval behavior
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe("initial state", () => {
    it("should initialize with correct default values when showExpiryWarning is false", () => {
      mockedUseAuthStore.mockReturnValue(false)

      const { result } = renderHook(() => useAuthExpiry())

      expect(result.current.showExpiryWarning).toBe(false)
      expect(result.current.timeRemaining).toBe(120) // 2 minutes
      expect(typeof result.current.formatTime).toBe("function")
    })

    it("should initialize with correct default values when showExpiryWarning is true", () => {
      mockedUseAuthStore.mockReturnValue(true)

      const { result } = renderHook(() => useAuthExpiry())

      expect(result.current.showExpiryWarning).toBe(true)
      expect(result.current.timeRemaining).toBe(120) // 2 minutes
      expect(typeof result.current.formatTime).toBe("function")
    })

    it("should return all expected properties", () => {
      mockedUseAuthStore.mockReturnValue(false)

      const { result } = renderHook(() => useAuthExpiry())

      expect(result.current).toHaveProperty("showExpiryWarning")
      expect(result.current).toHaveProperty("timeRemaining")
      expect(result.current).toHaveProperty("formatTime")
    })
  })

  describe("formatTime function", () => {
    beforeEach(() => {
      mockedUseAuthStore.mockReturnValue(false)
    })

    it("should format seconds correctly for various times", () => {
      const { result } = renderHook(() => useAuthExpiry())

      expect(result.current.formatTime(0)).toBe("0:00")
      expect(result.current.formatTime(5)).toBe("0:05")
      expect(result.current.formatTime(59)).toBe("0:59")
      expect(result.current.formatTime(60)).toBe("1:00")
      expect(result.current.formatTime(65)).toBe("1:05")
      expect(result.current.formatTime(120)).toBe("2:00")
      expect(result.current.formatTime(125)).toBe("2:05")
      expect(result.current.formatTime(3661)).toBe("61:01") // Over 60 minutes
    })

    it("should pad single digit seconds with zero", () => {
      const { result } = renderHook(() => useAuthExpiry())

      expect(result.current.formatTime(1)).toBe("0:01")
      expect(result.current.formatTime(9)).toBe("0:09")
      expect(result.current.formatTime(61)).toBe("1:01")
      expect(result.current.formatTime(69)).toBe("1:09")
    })

    it("should handle edge cases", () => {
      const { result } = renderHook(() => useAuthExpiry())

      expect(result.current.formatTime(-1)).toBe("-1:-1") // Negative numbers
      expect(result.current.formatTime(3600)).toBe("60:00") // Exactly 1 hour
    })
  })

  describe("countdown timer behavior", () => {
    it("should not start timer when showExpiryWarning is false", () => {
      mockedUseAuthStore.mockReturnValue(false)

      const { result } = renderHook(() => useAuthExpiry())

      // Advance time and check that countdown doesn't change
      act(() => {
        vi.advanceTimersByTime(5000) // 5 seconds
      })

      expect(result.current.timeRemaining).toBe(120)
    })

    it("should start countdown when showExpiryWarning becomes true", () => {
      // Start with false
      const mockStore = vi.fn().mockReturnValue(false)
      mockedUseAuthStore.mockImplementation(mockStore)

      const { result, rerender } = renderHook(() => useAuthExpiry())

      expect(result.current.timeRemaining).toBe(120)

      // Change to true
      mockStore.mockReturnValue(true)
      rerender()

      // Advance timer by 5 seconds
      act(() => {
        vi.advanceTimersByTime(5000)
      })

      expect(result.current.timeRemaining).toBe(115)
    })

    it("should decrement timeRemaining every second when warning is active", () => {
      mockedUseAuthStore.mockReturnValue(true)

      const { result } = renderHook(() => useAuthExpiry())

      expect(result.current.timeRemaining).toBe(120)

      // Advance by 1 second
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(result.current.timeRemaining).toBe(119)

      // Advance by another 5 seconds
      act(() => {
        vi.advanceTimersByTime(5000)
      })
      expect(result.current.timeRemaining).toBe(114)

      // Advance by 10 more seconds
      act(() => {
        vi.advanceTimersByTime(10000)
      })
      expect(result.current.timeRemaining).toBe(104)
    })

    it("should stop countdown when timeRemaining reaches 0", () => {
      mockedUseAuthStore.mockReturnValue(true)

      const { result } = renderHook(() => useAuthExpiry())

      // Fast-forward to near the end
      act(() => {
        vi.advanceTimersByTime(119000) // 119 seconds
      })
      expect(result.current.timeRemaining).toBe(1)

      // Advance one more second
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(result.current.timeRemaining).toBe(0)

      // Advance more time - should stay at 0
      act(() => {
        vi.advanceTimersByTime(5000)
      })
      expect(result.current.timeRemaining).toBe(0)
    })

    it("should stop countdown when showExpiryWarning becomes false", () => {
      // Start with true
      const mockStore = vi.fn().mockReturnValue(true)
      mockedUseAuthStore.mockImplementation(mockStore)

      const { result, rerender } = renderHook(() => useAuthExpiry())

      // Let some time pass
      act(() => {
        vi.advanceTimersByTime(10000) // 10 seconds
      })
      expect(result.current.timeRemaining).toBe(110)

      // Change to false
      mockStore.mockReturnValue(false)
      rerender()

      // Advance more time - should not change
      act(() => {
        vi.advanceTimersByTime(5000)
      })
      expect(result.current.timeRemaining).toBe(110)
    })
  })

  describe("countdown reset behavior", () => {
    it("should reset timeRemaining to 120 when showExpiryWarning changes from false to true", () => {
      // Start with false
      const mockStore = vi.fn().mockReturnValue(false)
      mockedUseAuthStore.mockImplementation(mockStore)

      const { result, rerender } = renderHook(() => useAuthExpiry())

      expect(result.current.timeRemaining).toBe(120)

      // Change to true - should reset and start countdown
      mockStore.mockReturnValue(true)
      rerender()

      expect(result.current.timeRemaining).toBe(120)

      // Let time pass
      act(() => {
        vi.advanceTimersByTime(30000) // 30 seconds
      })
      expect(result.current.timeRemaining).toBe(90)

      // Change back to false then true again - should reset
      mockStore.mockReturnValue(false)
      rerender()

      mockStore.mockReturnValue(true)
      rerender()

      expect(result.current.timeRemaining).toBe(120)
    })

    it("should not reset timeRemaining when showExpiryWarning stays true", () => {
      mockedUseAuthStore.mockReturnValue(true)

      const { result, rerender } = renderHook(() => useAuthExpiry())

      // Let time pass
      act(() => {
        vi.advanceTimersByTime(45000) // 45 seconds
      })
      expect(result.current.timeRemaining).toBe(75)

      // Rerender but keep showExpiryWarning true - should not reset
      rerender()
      expect(result.current.timeRemaining).toBe(75)
    })
  })

  describe("timer cleanup", () => {
    it("should clear timer when component unmounts", () => {
      mockedUseAuthStore.mockReturnValue(true)

      const clearIntervalSpy = vi.spyOn(global, "clearInterval")

      const { result, unmount } = renderHook(() => useAuthExpiry())

      // Let time pass to start the timer
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(result.current.timeRemaining).toBe(119)

      // Unmount component
      unmount()

      // Verify clearInterval was called
      expect(clearIntervalSpy).toHaveBeenCalled()

      clearIntervalSpy.mockRestore()
    })

    it("should clear previous timer when showExpiryWarning changes", () => {
      const mockStore = vi.fn().mockReturnValue(true)
      mockedUseAuthStore.mockImplementation(mockStore)

      const clearIntervalSpy = vi.spyOn(global, "clearInterval")

      const { rerender } = renderHook(() => useAuthExpiry())

      // Change warning state to trigger timer cleanup and restart
      mockStore.mockReturnValue(false)
      rerender()

      mockStore.mockReturnValue(true)
      rerender()

      // Should have called clearInterval when stopping and restarting timer
      expect(clearIntervalSpy).toHaveBeenCalled()

      clearIntervalSpy.mockRestore()
    })
  })

  describe("edge cases", () => {
    it("should handle rapid state changes", () => {
      const mockStore = vi.fn().mockReturnValue(false)
      mockedUseAuthStore.mockImplementation(mockStore)

      const { result, rerender } = renderHook(() => useAuthExpiry())

      // Rapid state changes
      act(() => {
        mockStore.mockReturnValue(true)
        rerender()
        vi.advanceTimersByTime(1000)

        mockStore.mockReturnValue(false)
        rerender()

        mockStore.mockReturnValue(true)
        rerender()
      })

      // Should reset to 120 after the final true state
      expect(result.current.timeRemaining).toBe(120)
    })

    it("should work correctly when timeRemaining goes negative", () => {
      mockedUseAuthStore.mockReturnValue(true)

      const { result } = renderHook(() => useAuthExpiry())

      // Manually set timeRemaining to 1 and let it decrement
      act(() => {
        vi.advanceTimersByTime(120000) // 120 seconds - should reach 0
      })

      expect(result.current.timeRemaining).toBe(0)

      // Timer should stop, so advancing more time shouldn't change it
      act(() => {
        vi.advanceTimersByTime(5000)
      })

      expect(result.current.timeRemaining).toBe(0)
    })
  })

  describe("auth store integration", () => {
    it("should read showExpiryWarning from auth store", () => {
      const mockSelector = vi.fn()
      mockedUseAuthStore.mockImplementation(mockSelector)

      renderHook(() => useAuthExpiry())

      expect(mockSelector).toHaveBeenCalledWith(expect.any(Function))

      // Test the selector function
      const selectorFn = mockSelector.mock.calls[0][0]
      const mockStoreState = { showExpiryWarning: true, other: "value" }

      expect(selectorFn(mockStoreState)).toBe(true)
    })

    it("should update when auth store showExpiryWarning changes", () => {
      const mockStore = vi.fn().mockReturnValue(false)
      mockedUseAuthStore.mockImplementation(mockStore)

      const { result, rerender } = renderHook(() => useAuthExpiry())

      expect(result.current.showExpiryWarning).toBe(false)

      // Change store value
      mockStore.mockReturnValue(true)
      rerender()

      expect(result.current.showExpiryWarning).toBe(true)
    })
  })
})
