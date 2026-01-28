import { NextRequest } from "next/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// Mock the getTokens utility
vi.mock("@/utils/auth/token/getTokens", () => ({
  getTokens: vi.fn(),
}))

// Mock the updateUserOnLogin utility
vi.mock("@/utils/user/updateUserOnLogin", () => ({
  updateUserOnLogin: vi.fn(),
}))

describe("/api/auth/login/callback", () => {
  const mockTokenResponse = {
    access_token: "mock-access-token",
    id_token: "mock-id-token",
    expires_in: 3600,
    refresh_token: "mock-refresh-token",
    refresh_expires_in: 7200,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe("GET", () => {
    it("should return 400 error when authorization code is missing", async () => {
      const { GET } = await import("./route")

      const request = new NextRequest("http://localhost:3000/api/auth/login/callback")
      const response = await GET(request)

      expect(response.status).toBe(400)

      const body = await response.json()
      expect(body).toEqual({
        error: "Authorization code is required",
      })
    })

    it("should return 500 error when SSO_CLIENT_ID is missing", async () => {
      vi.stubEnv("SSO_CLIENT_SECRET", "test-client-secret")
      // Don't set SSO_CLIENT_ID

      const { GET } = await import("./route")

      const request = new NextRequest(
        "http://localhost:3000/api/auth/login/callback?code=test-auth-code"
      )
      const response = await GET(request)

      expect(response.status).toBe(500)

      const body = await response.json()
      expect(body).toEqual({
        error: "SSO_CLIENT_ID and/or SSO_CLIENT_SECRET env variables are undefined.",
      })
    })

    it("should return 500 error when SSO_CLIENT_SECRET is missing", async () => {
      vi.stubEnv("SSO_CLIENT_ID", "test-client-id")
      // Don't set SSO_CLIENT_SECRET

      const { GET } = await import("./route")

      const request = new NextRequest(
        "http://localhost:3000/api/auth/login/callback?code=test-auth-code"
      )
      const response = await GET(request)

      expect(response.status).toBe(500)

      const body = await response.json()
      expect(body).toEqual({
        error: "SSO_CLIENT_ID and/or SSO_CLIENT_SECRET env variables are undefined.",
      })
    })

    it("should successfully exchange code for tokens and return HTML", async () => {
      vi.stubEnv("SSO_CLIENT_ID", "test-client-id")
      vi.stubEnv("SSO_CLIENT_SECRET", "test-client-secret")
      vi.stubEnv("APP_URL", "https://example.com")
      vi.stubEnv("SSO_ENVIRONMENT", "dev")
      vi.stubEnv("SSO_REALM", "standard")
      vi.stubEnv("SSO_PROTOCOL", "openid-connect")

      const getTokensModule = await import("@/utils/auth/token/getTokens")
      vi.mocked(getTokensModule.getTokens).mockResolvedValue(mockTokenResponse)

      const { GET } = await import("./route")

      const request = new NextRequest(
        "http://localhost:3000/api/auth/login/callback?code=test-auth-code"
      )
      const response = await GET(request)

      expect(response.status).toBe(200)

      // Check that response is HTML
      expect(response.headers.get("Content-Type")).toBe("text/html")

      const body = await response.text()
      expect(body).toContain("Login Successful")
      expect(body).toContain("You may close this window")
      expect(body).toContain("<!DOCTYPE html>")

      // Check that all cookies are set
      const setCookieHeaders = response.headers.getSetCookie()
      expect(setCookieHeaders).toBeDefined()
      expect(setCookieHeaders.length).toBeGreaterThan(0)

      // Check for access token cookie
      const accessTokenCookie = setCookieHeaders.find((cookie) =>
        cookie.includes("access_token=mock-access-token")
      )
      expect(accessTokenCookie).toBeDefined()

      // Check for expires_in cookie
      const expiresInCookie = setCookieHeaders.find((cookie) => cookie.includes("expires_in=3600"))
      expect(expiresInCookie).toBeDefined()

      // Check for refresh_expires_in cookie
      const refreshExpiresInCookie = setCookieHeaders.find((cookie) =>
        cookie.includes("refresh_expires_in=7200")
      )
      expect(refreshExpiresInCookie).toBeDefined()

      expect(getTokensModule.getTokens).toHaveBeenCalledWith({
        code: "test-auth-code",
        clientID: "test-client-id",
        clientSecret: "test-client-secret",
        redirectURI: "https://example.com/api/auth/login/callback",
        ssoEnvironment: "dev",
        ssoRealm: "standard",
        ssoProtocol: "openid-connect",
      })

      const updateUserModule = await import("@/utils/user/updateUserOnLogin")
      expect(updateUserModule.updateUserOnLogin).toHaveBeenCalledWith("mock-access-token")
    })

    it("should set cookies correctly in production", async () => {
      vi.stubEnv("SSO_CLIENT_ID", "test-client-id")
      vi.stubEnv("SSO_CLIENT_SECRET", "test-client-secret")
      vi.stubEnv("APP_URL", "https://example.com")
      vi.stubEnv("NODE_ENV", "production")

      const getTokensModule = await import("@/utils/auth/token/getTokens")
      vi.mocked(getTokensModule.getTokens).mockResolvedValue(mockTokenResponse)

      const { GET } = await import("./route")

      const request = new NextRequest(
        "http://localhost:3000/api/auth/login/callback?code=test-auth-code"
      )
      const response = await GET(request)

      expect(response.status).toBe(200)

      const setCookieHeaders = response.headers.getSetCookie()
      expect(setCookieHeaders).toBeDefined()

      // Check for access token cookie
      const accessTokenCookie = setCookieHeaders.find((cookie) =>
        cookie.includes("access_token=mock-access-token")
      )
      expect(accessTokenCookie).toBeDefined()
      expect(accessTokenCookie).toContain("SameSite=none")
      expect(accessTokenCookie).toContain("Path=/")
      expect(accessTokenCookie).toContain("Secure") // Secure in production
      expect(accessTokenCookie).toContain("Max-Age=3600") // Should have expiry

      // Check for refresh token cookie
      const refreshTokenCookie = setCookieHeaders.find((cookie) =>
        cookie.includes("refresh_token=mock-refresh-token")
      )
      expect(refreshTokenCookie).toBeDefined()
      expect(refreshTokenCookie).toContain("HttpOnly")
      expect(refreshTokenCookie).toContain("SameSite=none")
      expect(refreshTokenCookie).toContain("Path=/")
      expect(refreshTokenCookie).toContain("Secure") // Secure in production
      expect(refreshTokenCookie).toContain("Max-Age=7200") // Should have refresh expiry

      // Check for id token cookie
      const idTokenCookie = setCookieHeaders.find((cookie) =>
        cookie.includes("id_token=mock-id-token")
      )
      expect(idTokenCookie).toBeDefined()
      expect(idTokenCookie).toContain("SameSite=none")
      expect(idTokenCookie).toContain("Path=/")
      expect(idTokenCookie).toContain("Secure") // Secure in production
      expect(idTokenCookie).toContain("Max-Age=3600") // Should have expiry

      // Check for expires_in cookie
      const expiresInCookie = setCookieHeaders.find((cookie) => cookie.includes("expires_in=3600"))
      expect(expiresInCookie).toBeDefined()
      expect(expiresInCookie).toContain("SameSite=none")
      expect(expiresInCookie).toContain("Path=/")
      expect(expiresInCookie).toContain("Secure") // Secure in production

      // Check for refresh_expires_in cookie
      const refreshExpiresInCookie = setCookieHeaders.find((cookie) =>
        cookie.includes("refresh_expires_in=7200")
      )
      expect(refreshExpiresInCookie).toBeDefined()
      expect(refreshExpiresInCookie).toContain("SameSite=none")
      expect(refreshExpiresInCookie).toContain("Path=/")
      expect(refreshExpiresInCookie).toContain("Secure") // Secure in production
      const updateUserModule = await import("@/utils/user/updateUserOnLogin")
      expect(updateUserModule.updateUserOnLogin).toHaveBeenCalledWith("mock-access-token")
    })

    it("should set cookies with lax sameSite in development", async () => {
      vi.stubEnv("SSO_CLIENT_ID", "test-client-id")
      vi.stubEnv("SSO_CLIENT_SECRET", "test-client-secret")
      vi.stubEnv("APP_URL", "http://localhost:3000")
      vi.stubEnv("NODE_ENV", "development")

      const getTokensModule = await import("@/utils/auth/token/getTokens")
      vi.mocked(getTokensModule.getTokens).mockResolvedValue(mockTokenResponse)

      const { GET } = await import("./route")

      const request = new NextRequest(
        "http://localhost:3000/api/auth/login/callback?code=test-auth-code"
      )
      const response = await GET(request)

      expect(response.status).toBe(200)

      const setCookieHeaders = response.headers.getSetCookie()
      expect(setCookieHeaders).toBeDefined()

      // Check for access token cookie
      const accessTokenCookie = setCookieHeaders.find((cookie) =>
        cookie.includes("access_token=mock-access-token")
      )
      expect(accessTokenCookie).toBeDefined()
      expect(accessTokenCookie).toContain("SameSite=lax")
      expect(accessTokenCookie).toContain("Path=/")
      expect(accessTokenCookie).not.toContain("Secure") // Not secure in development

      // Check for refresh token cookie
      const refreshTokenCookie = setCookieHeaders.find((cookie) =>
        cookie.includes("refresh_token=mock-refresh-token")
      )
      expect(refreshTokenCookie).toBeDefined()
      expect(refreshTokenCookie).toContain("HttpOnly")
      expect(refreshTokenCookie).toContain("SameSite=lax")
      expect(refreshTokenCookie).toContain("Path=/")
      expect(refreshTokenCookie).not.toContain("Secure") // Not secure in development

      // Check for id token cookie
      const idTokenCookie = setCookieHeaders.find((cookie) =>
        cookie.includes("id_token=mock-id-token")
      )
      expect(idTokenCookie).toBeDefined()
      expect(idTokenCookie).toContain("SameSite=lax")
      expect(idTokenCookie).toContain("Path=/")
      expect(idTokenCookie).not.toContain("Secure") // Not secure in development

      // Check for expires_in cookie
      const expiresInCookie = setCookieHeaders.find((cookie) => cookie.includes("expires_in=3600"))
      expect(expiresInCookie).toBeDefined()
      expect(expiresInCookie).toContain("SameSite=lax")
      expect(expiresInCookie).not.toContain("Secure") // Not secure in development

      // Check for refresh_expires_in cookie
      const refreshExpiresInCookie = setCookieHeaders.find((cookie) =>
        cookie.includes("refresh_expires_in=7200")
      )
      expect(refreshExpiresInCookie).toBeDefined()
      expect(refreshExpiresInCookie).toContain("SameSite=lax")
      expect(refreshExpiresInCookie).not.toContain("Secure") // Not secure in development

      const updateUserModule = await import("@/utils/user/updateUserOnLogin")
      expect(updateUserModule.updateUserOnLogin).toHaveBeenCalledWith("mock-access-token")
    })

    it("should handle getTokens throwing an error", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
        // Mock implementation - no action needed
      })

      vi.stubEnv("SSO_CLIENT_ID", "test-client-id")
      vi.stubEnv("SSO_CLIENT_SECRET", "test-client-secret")
      vi.stubEnv("APP_URL", "https://example.com")

      const getTokensModule = await import("@/utils/auth/token/getTokens")
      const error = new Error("Token exchange failed")
      vi.mocked(getTokensModule.getTokens).mockRejectedValue(error)

      const { GET } = await import("./route")

      const request = new NextRequest(
        "http://localhost:3000/api/auth/login/callback?code=test-auth-code"
      )
      const response = await GET(request)

      expect(response.status).toBe(500)

      const body = await response.json()
      expect(body).toEqual({
        error: "Login callback failed",
        message: "Token exchange failed",
        success: false,
      })

      expect(consoleSpy).toHaveBeenCalledWith("Login callback error:", error)

      consoleSpy.mockRestore()
    })

    it("should handle empty authorization code", async () => {
      const { GET } = await import("./route")

      const request = new NextRequest("http://localhost:3000/api/auth/login/callback?code=")
      const response = await GET(request)

      expect(response.status).toBe(400)

      const body = await response.json()
      expect(body).toEqual({
        error: "Authorization code is required",
      })
    })

    it("should handle special characters in authorization code", async () => {
      vi.stubEnv("SSO_CLIENT_ID", "test-client-id")
      vi.stubEnv("SSO_CLIENT_SECRET", "test-client-secret")
      vi.stubEnv("APP_URL", "https://example.com")

      const getTokensModule = await import("@/utils/auth/token/getTokens")
      vi.mocked(getTokensModule.getTokens).mockResolvedValue(mockTokenResponse)

      const { GET } = await import("./route")

      const specialCode = "code-with-special+chars%20and&more=test"
      const request = new NextRequest(
        `http://localhost:3000/api/auth/login/callback?code=${encodeURIComponent(specialCode)}`
      )
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(response.headers.get("Content-Type")).toBe("text/html")

      expect(getTokensModule.getTokens).toHaveBeenCalledWith(
        expect.objectContaining({
          code: specialCode,
        })
      )

      const updateUserModule = await import("@/utils/user/updateUserOnLogin")
      expect(updateUserModule.updateUserOnLogin).toHaveBeenCalledWith("mock-access-token")
    })

    it("should use default values when environment variables are not set (and call updateUserOnLogin)", async () => {
      vi.stubEnv("SSO_CLIENT_ID", "test-client-id")
      vi.stubEnv("SSO_CLIENT_SECRET", "test-client-secret")
      vi.stubEnv("APP_URL", "https://example.com")
      // Don't set other environment variables to test defaults

      const getTokensModule = await import("@/utils/auth/token/getTokens")
      vi.mocked(getTokensModule.getTokens).mockResolvedValue(mockTokenResponse)

      const { GET } = await import("./route")

      const request = new NextRequest(
        "http://localhost:3000/api/auth/login/callback?code=test-auth-code"
      )
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(response.headers.get("Content-Type")).toBe("text/html")

      expect(getTokensModule.getTokens).toHaveBeenCalledWith({
        code: "test-auth-code",
        clientID: "test-client-id",
        clientSecret: "test-client-secret",
        redirectURI: "https://example.com/api/auth/login/callback",
        ssoEnvironment: "dev", // default
        ssoRealm: "standard", // default
        ssoProtocol: "openid-connect", // default
      })

      const updateUserModule = await import("@/utils/user/updateUserOnLogin")
      expect(updateUserModule.updateUserOnLogin).toHaveBeenCalledWith("mock-access-token")
    })
  })
})
