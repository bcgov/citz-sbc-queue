import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { refreshTokens } from "./api"
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
})
