import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { isJWTValid } from "./isJWTValid"

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe("isJWTValid", () => {
  const defaultProps = {
    jwt: "test.jwt.token",
    clientID: "test-client-id",
    clientSecret: "test-client-secret",
  }

  beforeEach(() => {
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("when JWT validation succeeds", () => {
    it("should return true when token is active", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ active: true }),
      })

      const result = await isJWTValid(defaultProps)

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith(
        "https://dev.loginproxy.gov.bc.ca/auth/realms/standard/protocol/openid-connect/token/introspect",
        {
          method: "POST",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: "client_id=test-client-id&client_secret=test-client-secret&token=test.jwt.token",
        }
      )
    })

    it("should return false when token is inactive", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ active: false }),
      })

      const result = await isJWTValid(defaultProps)

      expect(result).toBe(false)
    })

    it("should handle response with additional fields", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          active: true,
          exp: 1234567890,
          client_id: "test-client-id",
        }),
      })

      const result = await isJWTValid(defaultProps)

      expect(result).toBe(true)
    })
  })

  describe("with different environment configurations", () => {
    it("should use dev environment by default", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ active: true }),
      })

      await isJWTValid(defaultProps)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("https://dev.loginproxy.gov.bc.ca/auth"),
        expect.any(Object)
      )
    })

    it("should use test environment when specified", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ active: true }),
      })

      await isJWTValid({
        ...defaultProps,
        ssoEnvironment: "test",
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("https://test.loginproxy.gov.bc.ca/auth"),
        expect.any(Object)
      )
    })

    it("should use prod environment when specified", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ active: true }),
      })

      await isJWTValid({
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
    it("should use standard realm by default", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ active: true }),
      })

      await isJWTValid(defaultProps)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/realms/standard/"),
        expect.any(Object)
      )
    })

    it("should use custom realm when specified", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ active: true }),
      })

      await isJWTValid({
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
    it("should use openid-connect protocol by default", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ active: true }),
      })

      await isJWTValid(defaultProps)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/protocol/openid-connect/"),
        expect.any(Object)
      )
    })

    it("should use saml protocol when specified", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ active: true }),
      })

      await isJWTValid({
        ...defaultProps,
        ssoProtocol: "saml",
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/protocol/saml/"),
        expect.any(Object)
      )
    })
  })

  describe("with special characters in parameters", () => {
    it("should properly encode special characters in client credentials and token", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ active: true }),
      })

      await isJWTValid({
        jwt: "token+with/special=chars&more",
        clientID: "client-id&special=chars",
        clientSecret: "secret+with/special=chars",
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: "client_id=client-id%26special%3Dchars&client_secret=secret%2Bwith%2Fspecial%3Dchars&token=token%2Bwith%2Fspecial%3Dchars%26more",
        })
      )
    })
  })

  describe("when HTTP request fails", () => {
    it("should throw error when response is not ok (404)", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      })

      await expect(isJWTValid(defaultProps)).rejects.toThrow(
        "Failed to validate JWT: 404 Not Found"
      )
    })

    it("should throw error when response is not ok (500)", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      })

      await expect(isJWTValid(defaultProps)).rejects.toThrow(
        "Failed to validate JWT: 500 Internal Server Error"
      )
    })

    it("should throw error when response is not ok (401)", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      })

      await expect(isJWTValid(defaultProps)).rejects.toThrow(
        "Failed to validate JWT: 401 Unauthorized"
      )
    })
  })

  describe("when network or parsing errors occur", () => {
    it("should throw error when fetch fails", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"))

      await expect(isJWTValid(defaultProps)).rejects.toThrow("Network error")
    })

    it("should throw error when JSON parsing fails", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockRejectedValue(new Error("Invalid JSON")),
      })

      await expect(isJWTValid(defaultProps)).rejects.toThrow("Invalid JSON")
    })
  })

  describe("edge cases", () => {
    it("should handle empty string values", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ active: true }),
      })

      await isJWTValid({
        jwt: "",
        clientID: "",
        clientSecret: "",
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: "client_id=&client_secret=&token=",
        })
      )
    })

    it("should handle response with missing active field", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      })

      const result = await isJWTValid(defaultProps)

      expect(result).toBeUndefined()
    })

    it("should build correct URL with all custom parameters", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ active: true }),
      })

      await isJWTValid({
        ...defaultProps,
        ssoEnvironment: "prod",
        ssoRealm: "custom-realm",
        ssoProtocol: "saml",
      })

      expect(mockFetch).toHaveBeenCalledWith(
        "https://loginproxy.gov.bc.ca/auth/realms/custom-realm/protocol/saml/token/introspect",
        expect.any(Object)
      )
    })
  })
})
