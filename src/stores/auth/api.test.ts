import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { refreshTokens, serverLogout } from "./api"
import type { TokenResponse } from "./types"

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe("auth/api", () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("refreshTokens", () => {
    const mockTokenResponse: TokenResponse = {
      access_token: "new.access.token",
      expires_in: 3600,
      refresh_expires_in: 7200,
      id_token: "new.id.token",
    }

    it("should return token response when refresh succeeds", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTokenResponse),
      })

      const result = await refreshTokens()

      expect(result).toEqual(mockTokenResponse)
      expect(mockFetch).toHaveBeenCalledWith("/api/auth/token", {
        method: "POST",
        credentials: "include",
      })
    })

    it("should return null when response is not ok", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      })

      const result = await refreshTokens()

      expect(result).toBeNull()
      expect(mockFetch).toHaveBeenCalledWith("/api/auth/token", {
        method: "POST",
        credentials: "include",
      })
    })

    it("should throw error when fetch throws an error", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"))

      await expect(refreshTokens()).rejects.toThrow("Network error")
    })

    it("should throw error when JSON parsing fails", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockRejectedValue(new Error("Invalid JSON")),
      })

      await expect(refreshTokens()).rejects.toThrow("Invalid JSON")
    })

    it("should handle token response without id_token", async () => {
      const responseWithoutIdToken = {
        access_token: "new.access.token",
        expires_in: 3600,
        refresh_expires_in: 7200,
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(responseWithoutIdToken),
      })

      const result = await refreshTokens()

      expect(result).toEqual(responseWithoutIdToken)
    })
  })

  describe("serverLogout", () => {
    it("should call logout endpoint", async () => {
      mockFetch.mockResolvedValue({ ok: true })

      await serverLogout()

      expect(mockFetch).toHaveBeenCalledWith("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    })

    // idToken is no longer used

    // idToken is no longer used

    // idToken is no longer used

    it("should handle fetch errors gracefully", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"))

      // Should not throw
      await expect(serverLogout()).resolves.toBeUndefined()

      expect(mockFetch).toHaveBeenCalledWith("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    })

    it("should handle server errors gracefully", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      })

      // Should not throw
      await expect(serverLogout()).resolves.toBeUndefined()
    })

    it("should use void to ignore promise result", async () => {
      // Mock fetch to return a promise that resolves after a delay
      mockFetch.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 100))
      )

      // Should return immediately without waiting
      const startTime = Date.now()
      await serverLogout()
      const endTime = Date.now()

      // Should complete quickly since we're not awaiting the fetch
      expect(endTime - startTime).toBeLessThan(50)
      expect(mockFetch).toHaveBeenCalled()
    })
  })
})
