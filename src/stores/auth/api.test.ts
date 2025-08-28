import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { clearTokens, refreshTokens } from "./api"
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

  describe("clearTokens", () => {
    it("should make POST request to clear tokens endpoint", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
      })

      await clearTokens()

      expect(mockFetch).toHaveBeenCalledWith("/api/auth/token/clear", {
        method: "POST",
        credentials: "include",
      })
    })

    it("should complete successfully even when response is not ok", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      })

      // Function doesn't check response status, so it should complete without error
      await expect(clearTokens()).resolves.toBeUndefined()

      expect(mockFetch).toHaveBeenCalledWith("/api/auth/token/clear", {
        method: "POST",
        credentials: "include",
      })
    })

    it("should propagate fetch errors", async () => {
      const networkError = new Error("Network error")
      mockFetch.mockRejectedValue(networkError)

      // Since the function uses await without try/catch, errors should propagate
      await expect(clearTokens()).rejects.toThrow("Network error")
    })

    it("should return void/undefined", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
      })

      const result = await clearTokens()

      expect(result).toBeUndefined()
    })

    it("should handle different response status codes without error", async () => {
      const statusCodes = [200, 204, 400, 401, 500]

      for (const statusCode of statusCodes) {
        mockFetch.mockResolvedValue({
          ok: statusCode < 400,
          status: statusCode,
        })

        // Function doesn't check response status, so all should complete
        await expect(clearTokens()).resolves.toBeUndefined()

        expect(mockFetch).toHaveBeenCalledWith("/api/auth/token/clear", {
          method: "POST",
          credentials: "include",
        })

        mockFetch.mockClear()
      }
    })

    it("should include credentials in request", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
      })

      await clearTokens()

      const fetchCall = mockFetch.mock.calls[0]
      expect(fetchCall[1]).toHaveProperty("credentials", "include")
    })
  })
})
