import { NextRequest } from "next/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// Mock the getLoginURL utility
vi.mock("@/utils/auth/url/getLoginURL", () => ({
  getLoginURL: vi.fn(),
}))

describe("/api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe("GET", () => {
    it("should return 400 error when SSO_CLIENT_ID is not provided", async () => {
      // Don't set SSO_CLIENT_ID to test the error case
      vi.stubEnv("SSO_CLIENT_ID", undefined)

      // Dynamically import the route after setting environment variables
      const { GET } = await import("./route")

      const request = new NextRequest("http://localhost:3000/api/auth/login")
      const response = await GET(request)

      expect(response.status).toBe(400)

      const body = await response.json()
      expect(body).toEqual({
        error: "SSO_CLIENT_ID env variable is undefined.",
      })
    })

    it("should redirect to SSO login page when environment variables are provided", async () => {
      const mockLoginURL = "https://mock-sso-login-url.com/"

      // Set up environment variables
      vi.stubEnv("SSO_CLIENT_ID", "test-client-id")
      vi.stubEnv("APP_URL", "https://example.com")
      vi.stubEnv("SSO_ENVIRONMENT", "dev")
      vi.stubEnv("SSO_REALM", "standard")
      vi.stubEnv("SSO_PROTOCOL", "openid-connect")

      // Import modules after environment is set
      const getLoginURLModule = await import("@/utils/auth/url/getLoginURL")
      vi.mocked(getLoginURLModule.getLoginURL).mockReturnValue(mockLoginURL)

      const { GET } = await import("./route")

      const request = new NextRequest("http://localhost:3000/api/auth/login")
      const response = await GET(request)

      expect(response.status).toBe(307)
      expect(response.headers.get("location")).toBe(mockLoginURL)

      expect(getLoginURLModule.getLoginURL).toHaveBeenCalledWith({
        idpHint: "azureidir",
        clientID: "test-client-id",
        redirectURI: "https://example.com/api/auth/login/callback",
        ssoEnvironment: "dev",
        ssoRealm: "standard",
        ssoProtocol: "openid-connect",
      })
    })
  })
})
