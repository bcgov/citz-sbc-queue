import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { getTokens } from "./getTokens"

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe("getTokens", () => {
  const defaultProps = {
    code: "auth-code-123",
    clientID: "test-client-id",
    clientSecret: "test-client-secret",
    redirectURI: "https://example.com/callback",
  }

  const mockTokenResponse = {
    id_token: "new.id.token",
    access_token: "new.access.token",
    expires_in: 3600,
    refresh_token: "new.refresh.token",
    refresh_expires_in: 7200,
  }

  beforeEach(() => {
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("when token exchange succeeds", () => {
    it("should return tokens when authorization code exchange succeeds", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTokenResponse),
      })

      const result = await getTokens(defaultProps)

      expect(result).toEqual(mockTokenResponse)

      // Verify the correct Authorization header is set
      const expectedAuth = Buffer.from("test-client-id:test-client-secret").toString("base64")
      expect(mockFetch).toHaveBeenCalledWith(
        "https://dev.loginproxy.gov.bc.ca/auth/realms/standard/protocol/openid-connect/token",
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${expectedAuth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: "grant_type=authorization_code&client_id=test-client-id&redirect_uri=https://example.com/callback&code=auth-code-123",
        }
      )
    })

    it("should use custom grant type when specified", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTokenResponse),
      })

      await getTokens({
        ...defaultProps,
        grantType: "custom_grant_type",
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining("grant_type=custom_grant_type"),
        })
      )
    })

    it("should use authorization_code grant type by default", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTokenResponse),
      })

      await getTokens(defaultProps)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining("grant_type=authorization_code"),
        })
      )
    })
  })

  describe("with different environment configurations", () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTokenResponse),
      })
    })

    it("should use dev environment by default", async () => {
      await getTokens(defaultProps)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("https://dev.loginproxy.gov.bc.ca/auth"),
        expect.any(Object)
      )
    })

    it("should use test environment when specified", async () => {
      await getTokens({
        ...defaultProps,
        ssoEnvironment: "test",
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("https://test.loginproxy.gov.bc.ca/auth"),
        expect.any(Object)
      )
    })

    it("should use prod environment when specified", async () => {
      await getTokens({
        ...defaultProps,
        ssoEnvironment: "prod",
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("https://loginproxy.gov.bc.ca/auth"),
        expect.any(Object)
      )
    })
  })

  describe("with different realm configurations", () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTokenResponse),
      })
    })

    it("should use standard realm by default", async () => {
      await getTokens(defaultProps)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/realms/standard/"),
        expect.any(Object)
      )
    })

    it("should use custom realm when specified", async () => {
      await getTokens({
        ...defaultProps,
        ssoRealm: "custom-realm",
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/realms/custom-realm/"),
        expect.any(Object)
      )
    })
  })

  describe("with different protocol configurations", () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTokenResponse),
      })
    })

    it("should use openid-connect protocol by default", async () => {
      await getTokens(defaultProps)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/protocol/openid-connect/"),
        expect.any(Object)
      )
    })

    it("should use saml protocol when specified", async () => {
      await getTokens({
        ...defaultProps,
        ssoProtocol: "saml",
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/protocol/saml/"),
        expect.any(Object)
      )
    })
  })

  describe("when HTTP request fails", () => {
    it("should throw error when response is not ok (400)", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
      })

      await expect(getTokens(defaultProps)).rejects.toThrow(
        "Failed to fetch tokens: 400 Bad Request"
      )
    })

    it("should throw error when response is not ok (401)", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      })

      await expect(getTokens(defaultProps)).rejects.toThrow(
        "Failed to fetch tokens: 401 Unauthorized"
      )
    })

    it("should throw error when response is not ok (500)", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      })

      await expect(getTokens(defaultProps)).rejects.toThrow(
        "Failed to fetch tokens: 500 Internal Server Error"
      )
    })
  })

  describe("when network or parsing errors occur", () => {
    it("should throw error when fetch fails", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"))

      await expect(getTokens(defaultProps)).rejects.toThrow("Network error")
    })

    it("should throw error when JSON parsing fails", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockRejectedValue(new Error("Invalid JSON")),
      })

      await expect(getTokens(defaultProps)).rejects.toThrow("Invalid JSON")
    })
  })

  describe("with special characters in parameters", () => {
    it("should handle special characters in parameters", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTokenResponse),
      })

      await getTokens({
        code: "code+with/special=chars&more",
        clientID: "client-id&special=chars",
        clientSecret: "secret+with/special=chars",
        redirectURI: "https://example.com/callback?param=value&other=test",
      })

      // The Authorization header should be properly base64 encoded
      const expectedAuth = Buffer.from(
        "client-id&special=chars:secret+with/special=chars"
      ).toString("base64")
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Basic ${expectedAuth}`,
          }),
          body: "grant_type=authorization_code&client_id=client-id&special=chars&redirect_uri=https://example.com/callback?param=value&other=test&code=code+with/special=chars&more",
        })
      )
    })
  })

  describe("edge cases", () => {
    it("should handle empty string values", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTokenResponse),
      })

      await getTokens({
        code: "",
        clientID: "",
        clientSecret: "",
        redirectURI: "",
      })

      const expectedAuth = Buffer.from(":").toString("base64")
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Basic ${expectedAuth}`,
          }),
          body: "grant_type=authorization_code&client_id=&redirect_uri=&code=",
        })
      )
    })

    it("should handle response with additional fields", async () => {
      const responseWithExtraFields = {
        ...mockTokenResponse,
        scope: "openid profile email",
        token_type: "Bearer",
        session_state: "session-123",
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(responseWithExtraFields),
      })

      const result = await getTokens(defaultProps)

      // Should only return the expected fields
      expect(result).toEqual(mockTokenResponse)
    })

    it("should handle response with missing optional fields", async () => {
      const responseWithMissingFields = {
        id_token: "new.id.token",
        access_token: "new.access.token",
        expires_in: 3600,
        // refresh_token and refresh_expires_in missing
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(responseWithMissingFields),
      })

      const result = await getTokens(defaultProps)

      expect(result).toEqual({
        id_token: "new.id.token",
        access_token: "new.access.token",
        expires_in: 3600,
        refresh_token: undefined,
        refresh_expires_in: undefined,
      })
    })

    it("should build correct URL with all custom parameters", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTokenResponse),
      })

      await getTokens({
        ...defaultProps,
        ssoEnvironment: "prod",
        ssoRealm: "custom-realm",
        ssoProtocol: "saml",
      })

      expect(mockFetch).toHaveBeenCalledWith(
        "https://loginproxy.gov.bc.ca/auth/realms/custom-realm/protocol/saml/token",
        expect.any(Object)
      )
    })
  })
})
