import { NextRequest } from "next/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// Mock the getLogoutURL utility
vi.mock("@/utils/auth/url/getLogoutURL", () => ({
  getLogoutURL: vi.fn(),
}))

describe("/api/auth/logout", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe("GET", () => {
    it("should return 400 error when id_token is missing from cookies", async () => {
      const { GET } = await import("./route")

      const request = new NextRequest("http://localhost:3000/api/auth/logout")
      const response = await GET(request)

      expect(response.status).toBe(400)

      const body = await response.json()
      expect(body).toEqual({
        error: "Missing id_token in cookies",
      })
    })

    it("should redirect to logout URL with default environment settings", async () => {
      const mockLogoutURL = "https://mock-sso-logout-url.com/"

      vi.stubEnv("APP_URL", "https://example.com")
      vi.stubEnv("SSO_ENVIRONMENT", "dev")
      vi.stubEnv("SSO_REALM", "standard")
      vi.stubEnv("SSO_PROTOCOL", "openid-connect")

      const getLogoutURLModule = await import("@/utils/auth/url/getLogoutURL")
      vi.mocked(getLogoutURLModule.getLogoutURL).mockReturnValue(mockLogoutURL)

      const { GET } = await import("./route")

      const request = new NextRequest("http://localhost:3000/api/auth/logout", {
        headers: {
          cookie: "id_token=test-id-token",
        },
      })
      const response = await GET(request)

      expect(response.status).toBe(307) // NextResponse.redirect uses 307
      expect(response.headers.get("location")).toBe(mockLogoutURL)

      expect(getLogoutURLModule.getLogoutURL).toHaveBeenCalledWith({
        idToken: "test-id-token",
        postLogoutRedirectURI: "https://example.com",
        ssoEnvironment: "dev",
        ssoRealm: "standard",
        ssoProtocol: "openid-connect",
      })
    })

    it("should use provided redirect_uri when specified", async () => {
      const mockLogoutURL = "https://mock-sso-logout-url.com/"
      const customRedirectURI = "https://custom.example.com/dashboard"

      vi.stubEnv("APP_URL", "https://example.com")
      vi.stubEnv("SSO_ENVIRONMENT", "dev")
      vi.stubEnv("SSO_REALM", "standard")
      vi.stubEnv("SSO_PROTOCOL", "openid-connect")

      const getLogoutURLModule = await import("@/utils/auth/url/getLogoutURL")
      vi.mocked(getLogoutURLModule.getLogoutURL).mockReturnValue(mockLogoutURL)

      const { GET } = await import("./route")

      const request = new NextRequest(
        `http://localhost:3000/api/auth/logout?redirect_uri=${encodeURIComponent(customRedirectURI)}`,
        {
          headers: {
            cookie: "id_token=test-id-token",
          },
        }
      )
      const response = await GET(request)

      expect(response.status).toBe(307)

      expect(getLogoutURLModule.getLogoutURL).toHaveBeenCalledWith({
        idToken: "test-id-token",
        postLogoutRedirectURI: customRedirectURI,
        ssoEnvironment: "dev",
        ssoRealm: "standard",
        ssoProtocol: "openid-connect",
      })
    })

    it("should use referer header when redirect_uri is not provided", async () => {
      const mockLogoutURL = "https://mock-sso-logout-url.com/"
      const refererURL = "https://example.com/dashboard"

      vi.stubEnv("APP_URL", "https://example.com")

      const getLogoutURLModule = await import("@/utils/auth/url/getLogoutURL")
      vi.mocked(getLogoutURLModule.getLogoutURL).mockReturnValue(mockLogoutURL)

      const { GET } = await import("./route")

      const request = new NextRequest("http://localhost:3000/api/auth/logout", {
        headers: {
          referer: refererURL,
          cookie: "id_token=test-id-token",
        },
      })
      const response = await GET(request)

      expect(response.status).toBe(307)

      expect(getLogoutURLModule.getLogoutURL).toHaveBeenCalledWith({
        idToken: "test-id-token",
        postLogoutRedirectURI: refererURL,
        ssoEnvironment: "dev",
        ssoRealm: "standard",
        ssoProtocol: "openid-connect",
      })
    })

    it("should handle getLogoutURL throwing an error", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
        // Mock implementation - no action needed
      })

      vi.stubEnv("APP_URL", "https://example.com")

      const getLogoutURLModule = await import("@/utils/auth/url/getLogoutURL")
      vi.mocked(getLogoutURLModule.getLogoutURL).mockImplementation(() => {
        throw new Error("getLogoutURL failed")
      })

      const { GET } = await import("./route")

      const request = new NextRequest("http://localhost:3000/api/auth/logout", {
        headers: {
          cookie: "id_token=test-id-token",
        },
      })
      const response = await GET(request)

      expect(response.status).toBe(500)

      const body = await response.json()
      expect(body).toEqual({
        error: "Internal server error",
      })

      expect(consoleSpy).toHaveBeenCalledWith("Logout error:", expect.any(Error))

      consoleSpy.mockRestore()
    })

    it("should clear all authentication cookies on successful logout", async () => {
      const mockLogoutURL = "https://mock-sso-logout-url.com/"

      vi.stubEnv("APP_URL", "https://example.com")
      vi.stubEnv("NODE_ENV", "production")

      const getLogoutURLModule = await import("@/utils/auth/url/getLogoutURL")
      vi.mocked(getLogoutURLModule.getLogoutURL).mockReturnValue(mockLogoutURL)

      const { GET } = await import("./route")

      const request = new NextRequest("http://localhost:3000/api/auth/logout", {
        headers: {
          cookie:
            "id_token=test-id-token; access_token=test-access-token; refresh_token=test-refresh-token",
        },
      })
      const response = await GET(request)

      expect(response.status).toBe(307)

      const setCookieHeaders = response.headers.getSetCookie()
      expect(setCookieHeaders).toBeDefined()

      // Check that access_token cookie is cleared
      const accessTokenCookie = setCookieHeaders.find((cookie) => cookie.includes("access_token="))
      expect(accessTokenCookie).toBeDefined()
      expect(accessTokenCookie).toContain("Max-Age=0")

      // Check that refresh_token cookie is cleared
      const refreshTokenCookie = setCookieHeaders.find((cookie) =>
        cookie.includes("refresh_token=")
      )
      expect(refreshTokenCookie).toBeDefined()
      expect(refreshTokenCookie).toContain("Max-Age=0")

      // Check that id_token cookie is cleared
      const idTokenCookie = setCookieHeaders.find((cookie) => cookie.includes("id_token="))
      expect(idTokenCookie).toBeDefined()
      expect(idTokenCookie).toContain("Max-Age=0")
    })
  })
})
