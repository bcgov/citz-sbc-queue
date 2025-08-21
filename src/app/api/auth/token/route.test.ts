import { NextRequest } from "next/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// Mock the getNewTokens utility
vi.mock("@/utils/auth/token/getNewTokens", () => ({
  getNewTokens: vi.fn(),
}))

// Mock Next.js cookies function
const mockCookieGet = vi.fn()
const mockCookies = vi.fn().mockReturnValue({
  get: mockCookieGet,
})

vi.mock("next/headers", () => ({
  cookies: mockCookies,
}))

describe("/api/auth/token", () => {
  const mockTokenResponse = {
    access_token: "new-access-token",
    id_token: "new-id-token",
    expires_in: 3600,
    refresh_token: "new-refresh-token",
    refresh_expires_in: 7200,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mockCookieGet.mockClear()
    mockCookies.mockClear()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe("POST", () => {
    it("should return 500 error when SSO_CLIENT_ID is missing", async () => {
      vi.stubEnv("SSO_CLIENT_SECRET", "test-client-secret")
      // Don't set SSO_CLIENT_ID

      const { POST } = await import("./route")

      const request = new NextRequest("http://localhost:3000/api/auth/token", {
        method: "POST",
      })
      const response = await POST(request)

      expect(response.status).toBe(500)

      const body = await response.json()
      expect(body).toEqual({
        success: false,
        message: "SSO_CLIENT_ID and/or SSO_CLIENT_SECRET env variables are undefined.",
      })
    })

    it("should return 500 error when SSO_CLIENT_SECRET is missing", async () => {
      vi.stubEnv("SSO_CLIENT_ID", "test-client-id")
      // Don't set SSO_CLIENT_SECRET

      const { POST } = await import("./route")

      const request = new NextRequest("http://localhost:3000/api/auth/token", {
        method: "POST",
      })
      const response = await POST(request)

      expect(response.status).toBe(500)

      const body = await response.json()
      expect(body).toEqual({
        success: false,
        message: "SSO_CLIENT_ID and/or SSO_CLIENT_SECRET env variables are undefined.",
      })
    })

    it("should return 401 error when refresh token is missing from cookies", async () => {
      vi.stubEnv("SSO_CLIENT_ID", "test-client-id")
      vi.stubEnv("SSO_CLIENT_SECRET", "test-client-secret")

      // Mock empty cookie
      mockCookieGet.mockReturnValue(undefined)

      const { POST } = await import("./route")

      const request = new NextRequest("http://localhost:3000/api/auth/token", {
        method: "POST",
      })
      const response = await POST(request)

      expect(response.status).toBe(401)

      const body = await response.json()
      expect(body).toEqual({
        success: false,
        message: "Refresh token is missing. Please log in again.",
      })

      expect(mockCookieGet).toHaveBeenCalledWith("refresh_token")
    })

    it("should successfully refresh tokens", async () => {
      vi.stubEnv("SSO_CLIENT_ID", "test-client-id")
      vi.stubEnv("SSO_CLIENT_SECRET", "test-client-secret")
      vi.stubEnv("SSO_ENVIRONMENT", "dev")
      vi.stubEnv("SSO_REALM", "standard")
      vi.stubEnv("SSO_PROTOCOL", "openid-connect")

      // Mock refresh token cookie
      mockCookieGet.mockReturnValue({ value: "test-refresh-token" })

      const getNewTokensModule = await import("@/utils/auth/token/getNewTokens")
      vi.mocked(getNewTokensModule.getNewTokens).mockResolvedValue(mockTokenResponse)

      const { POST } = await import("./route")

      const request = new NextRequest("http://localhost:3000/api/auth/token", {
        method: "POST",
      })
      const response = await POST(request)

      expect(response.status).toBe(200)

      const body = await response.json()
      expect(body).toEqual({
        access_token: "new-access-token",
        id_token: "new-id-token",
        expires_in: 3600,
        refresh_expires_in: 7200,
      })

      // Check that refresh token is not in response body (should be in cookie)
      expect(body).not.toHaveProperty("refresh_token")

      expect(getNewTokensModule.getNewTokens).toHaveBeenCalledWith({
        refreshToken: "test-refresh-token",
        clientID: "test-client-id",
        clientSecret: "test-client-secret",
        ssoEnvironment: "dev",
        ssoRealm: "standard",
        ssoProtocol: "openid-connect",
      })
    })

    it("should set new tokens as cookies with correct attributes in production", async () => {
      vi.stubEnv("SSO_CLIENT_ID", "test-client-id")
      vi.stubEnv("SSO_CLIENT_SECRET", "test-client-secret")
      vi.stubEnv("NODE_ENV", "production")

      mockCookieGet.mockReturnValue({ value: "test-refresh-token" })

      const getNewTokensModule = await import("@/utils/auth/token/getNewTokens")
      vi.mocked(getNewTokensModule.getNewTokens).mockResolvedValue(mockTokenResponse)

      const { POST } = await import("./route")

      const request = new NextRequest("http://localhost:3000/api/auth/token", {
        method: "POST",
      })
      const response = await POST(request)

      expect(response.status).toBe(200)

      const setCookieHeaders = response.headers.getSetCookie()
      expect(setCookieHeaders).toBeDefined()

      // Check for access token cookie
      const accessTokenCookie = setCookieHeaders.find((cookie) =>
        cookie.includes("access_token=new-access-token")
      )
      expect(accessTokenCookie).toBeDefined()
      expect(accessTokenCookie).not.toContain("HttpOnly") // Access token is not HttpOnly
      expect(accessTokenCookie).toContain("SameSite=none")
      expect(accessTokenCookie).toContain("Secure")
      expect(accessTokenCookie).toContain("Path=/")
      expect(accessTokenCookie).toContain("Max-Age=3600")

      // Check for refresh token cookie
      const refreshTokenCookie = setCookieHeaders.find((cookie) =>
        cookie.includes("refresh_token=new-refresh-token")
      )
      expect(refreshTokenCookie).toBeDefined()
      expect(refreshTokenCookie).toContain("HttpOnly") // Only refresh token is HttpOnly
      expect(refreshTokenCookie).toContain("SameSite=none")
      expect(refreshTokenCookie).toContain("Secure")
      expect(refreshTokenCookie).toContain("Path=/")
      expect(refreshTokenCookie).toContain("Max-Age=7200")

      // Check for id token cookie
      const idTokenCookie = setCookieHeaders.find((cookie) =>
        cookie.includes("id_token=new-id-token")
      )
      expect(idTokenCookie).toBeDefined()
      expect(idTokenCookie).not.toContain("HttpOnly") // ID token is not HttpOnly
      expect(idTokenCookie).toContain("SameSite=none")
      expect(idTokenCookie).toContain("Secure")
      expect(idTokenCookie).toContain("Path=/")
      expect(idTokenCookie).toContain("Max-Age=3600")
    })

    it("should set cookies with lax sameSite in development", async () => {
      vi.stubEnv("SSO_CLIENT_ID", "test-client-id")
      vi.stubEnv("SSO_CLIENT_SECRET", "test-client-secret")
      vi.stubEnv("NODE_ENV", "development")

      mockCookieGet.mockReturnValue({ value: "test-refresh-token" })

      const getNewTokensModule = await import("@/utils/auth/token/getNewTokens")
      vi.mocked(getNewTokensModule.getNewTokens).mockResolvedValue(mockTokenResponse)

      const { POST } = await import("./route")

      const request = new NextRequest("http://localhost:3000/api/auth/token", {
        method: "POST",
      })
      const response = await POST(request)

      expect(response.status).toBe(200)

      const setCookieHeaders = response.headers.getSetCookie()
      expect(setCookieHeaders).toBeDefined()

      // Check for access token cookie
      const accessTokenCookie = setCookieHeaders.find((cookie) =>
        cookie.includes("access_token=new-access-token")
      )
      expect(accessTokenCookie).toBeDefined()
      expect(accessTokenCookie).not.toContain("HttpOnly") // Access token is not HttpOnly
      expect(accessTokenCookie).toContain("SameSite=lax")
      expect(accessTokenCookie).toContain("Path=/")
      expect(accessTokenCookie).not.toContain("Secure") // Not secure in development

      // Check for refresh token cookie
      const refreshTokenCookie = setCookieHeaders.find((cookie) =>
        cookie.includes("refresh_token=new-refresh-token")
      )
      expect(refreshTokenCookie).toBeDefined()
      expect(refreshTokenCookie).toContain("HttpOnly")
      expect(refreshTokenCookie).toContain("SameSite=lax")
      expect(refreshTokenCookie).toContain("Path=/")
      expect(refreshTokenCookie).not.toContain("Secure") // Not secure in development

      // Check for id token cookie
      const idTokenCookie = setCookieHeaders.find((cookie) =>
        cookie.includes("id_token=new-id-token")
      )
      expect(idTokenCookie).toBeDefined()
      expect(idTokenCookie).not.toContain("HttpOnly") // ID token is not HttpOnly
      expect(idTokenCookie).toContain("SameSite=lax")
      expect(idTokenCookie).toContain("Path=/")
      expect(idTokenCookie).not.toContain("Secure") // Not secure in development
    })

    it("should use default values when environment variables are not set", async () => {
      vi.stubEnv("SSO_CLIENT_ID", "test-client-id")
      vi.stubEnv("SSO_CLIENT_SECRET", "test-client-secret")
      // Clear other env vars to test defaults

      mockCookieGet.mockReturnValue({ value: "test-refresh-token" })

      const getNewTokensModule = await import("@/utils/auth/token/getNewTokens")
      vi.mocked(getNewTokensModule.getNewTokens).mockResolvedValue(mockTokenResponse)

      const { POST } = await import("./route")

      const request = new NextRequest("http://localhost:3000/api/auth/token", {
        method: "POST",
      })
      const response = await POST(request)

      expect(response.status).toBe(200)

      expect(getNewTokensModule.getNewTokens).toHaveBeenCalledWith({
        refreshToken: "test-refresh-token",
        clientID: "test-client-id",
        clientSecret: "test-client-secret",
        ssoEnvironment: "dev", // default
        ssoRealm: "standard", // default
        ssoProtocol: "openid-connect", // default
      })
    })

    it("should return 401 error when getNewTokens returns null", async () => {
      vi.stubEnv("SSO_CLIENT_ID", "test-client-id")
      vi.stubEnv("SSO_CLIENT_SECRET", "test-client-secret")

      mockCookieGet.mockReturnValue({ value: "invalid-refresh-token" })

      const getNewTokensModule = await import("@/utils/auth/token/getNewTokens")
      vi.mocked(getNewTokensModule.getNewTokens).mockResolvedValue(null)

      const { POST } = await import("./route")

      const request = new NextRequest("http://localhost:3000/api/auth/token", {
        method: "POST",
      })
      const response = await POST(request)

      expect(response.status).toBe(401)

      const body = await response.json()
      expect(body).toEqual({
        success: false,
        message: "Invalid token.",
      })
    })

    it("should handle getNewTokens throwing an error", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
        // Mock implementation - no action needed
      })

      vi.stubEnv("SSO_CLIENT_ID", "test-client-id")
      vi.stubEnv("SSO_CLIENT_SECRET", "test-client-secret")

      mockCookieGet.mockReturnValue({ value: "test-refresh-token" })

      const getNewTokensModule = await import("@/utils/auth/token/getNewTokens")
      const error = new Error("Token refresh failed")
      vi.mocked(getNewTokensModule.getNewTokens).mockRejectedValue(error)

      const { POST } = await import("./route")

      const request = new NextRequest("http://localhost:3000/api/auth/token", {
        method: "POST",
      })
      const response = await POST(request)

      expect(response.status).toBe(500)

      const body = await response.json()
      expect(body).toEqual({
        success: false,
        message: "An error occurred while refreshing the token.",
      })

      expect(consoleSpy).toHaveBeenCalledWith("Token refresh error:", error)

      consoleSpy.mockRestore()
    })

    it("should handle empty refresh token value", async () => {
      vi.stubEnv("SSO_CLIENT_ID", "test-client-id")
      vi.stubEnv("SSO_CLIENT_SECRET", "test-client-secret")

      mockCookieGet.mockReturnValue({ value: "" })

      const { POST } = await import("./route")

      const request = new NextRequest("http://localhost:3000/api/auth/token", {
        method: "POST",
      })
      const response = await POST(request)

      expect(response.status).toBe(401)

      const body = await response.json()
      expect(body).toEqual({
        success: false,
        message: "Refresh token is missing. Please log in again.",
      })
    })

    it("should handle response without new refresh token", async () => {
      vi.stubEnv("SSO_CLIENT_ID", "test-client-id")
      vi.stubEnv("SSO_CLIENT_SECRET", "test-client-secret")

      const responseWithoutRefreshToken = {
        access_token: "new-access-token",
        id_token: "new-id-token",
        expires_in: 3600,
        refresh_token: "", // Empty refresh token
        refresh_expires_in: 7200,
      }

      mockCookieGet.mockReturnValue({ value: "test-refresh-token" })

      const getNewTokensModule = await import("@/utils/auth/token/getNewTokens")
      vi.mocked(getNewTokensModule.getNewTokens).mockResolvedValue(responseWithoutRefreshToken)

      const { POST } = await import("./route")

      const request = new NextRequest("http://localhost:3000/api/auth/token", {
        method: "POST",
      })
      const response = await POST(request)

      expect(response.status).toBe(200)

      const body = await response.json()
      expect(body).toEqual({
        access_token: "new-access-token",
        id_token: "new-id-token",
        expires_in: 3600,
        refresh_expires_in: 7200,
      })

      // Should still set access token and id token cookies
      const setCookieHeaders = response.headers.getSetCookie()
      expect(setCookieHeaders).toBeDefined()

      const accessTokenCookie = setCookieHeaders.find((cookie) =>
        cookie.includes("access_token=new-access-token")
      )
      expect(accessTokenCookie).toBeDefined()

      const refreshTokenCookie = setCookieHeaders.find((cookie) =>
        cookie.includes("refresh_token=")
      )
      expect(refreshTokenCookie).toBeUndefined()

      // Should still set id token cookie
      const idTokenCookie = setCookieHeaders.find((cookie) =>
        cookie.includes("id_token=new-id-token")
      )
      expect(idTokenCookie).toBeDefined()
    })

    it("should set secure cookie in production", async () => {
      vi.stubEnv("SSO_CLIENT_ID", "test-client-id")
      vi.stubEnv("SSO_CLIENT_SECRET", "test-client-secret")
      vi.stubEnv("NODE_ENV", "production")

      mockCookieGet.mockReturnValue({ value: "test-refresh-token" })

      const getNewTokensModule = await import("@/utils/auth/token/getNewTokens")
      vi.mocked(getNewTokensModule.getNewTokens).mockResolvedValue(mockTokenResponse)

      const { POST } = await import("./route")

      const request = new NextRequest("http://localhost:3000/api/auth/token", {
        method: "POST",
      })
      const response = await POST(request)

      expect(response.status).toBe(200)

      const setCookieHeaders = response.headers.getSetCookie()
      expect(setCookieHeaders.some((cookie) => cookie.includes("Secure"))).toBe(true) // Secure in production
    })
  })
})
