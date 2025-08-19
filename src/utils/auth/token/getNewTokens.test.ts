import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { isJWTValid } from "../jwt/isJWTValid"
import { getNewTokens } from "./getNewTokens"

// Mock the isJWTValid function
vi.mock("../jwt/isJWTValid")
const mockIsJWTValid = vi.mocked(isJWTValid)

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe("getNewTokens", () => {
  const defaultProps = {
    refreshToken: "valid.refresh.token",
    clientID: "test-client-id",
    clientSecret: "test-client-secret",
  }

  const mockTokenResponse = {
    access_token: "new.access.token",
    refresh_token: "new.refresh.token",
    id_token: "new.id.token",
    expires_in: 3600,
    refresh_expires_in: 7200,
  }

  beforeEach(() => {
    mockFetch.mockClear()
    mockIsJWTValid.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("when refresh token is valid", () => {
    beforeEach(() => {
      mockIsJWTValid.mockResolvedValue(true)
    })

    it("should return new tokens when token refresh succeeds", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTokenResponse),
      })

      const result = await getNewTokens(defaultProps)

      expect(result).toEqual(mockTokenResponse)
      expect(mockIsJWTValid).toHaveBeenCalledWith({
        jwt: "valid.refresh.token",
        clientID: "test-client-id",
        clientSecret: "test-client-secret",
        ssoEnvironment: "dev",
        ssoRealm: "standard",
        ssoProtocol: "openid-connect",
      })
      expect(mockFetch).toHaveBeenCalledWith(
        "https://dev.loginproxy.gov.bc.ca/auth/realms/standard/protocol/openid-connect/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: "grant_type=refresh_token&client_id=test-client-id&client_secret=test-client-secret&refresh_token=valid.refresh.token",
        }
      )
    })

    it("should use custom environment configuration", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTokenResponse),
      })

      await getNewTokens({
        ...defaultProps,
        ssoEnvironment: "prod",
        ssoRealm: "custom-realm",
        ssoProtocol: "saml",
      })

      expect(mockIsJWTValid).toHaveBeenCalledWith({
        jwt: "valid.refresh.token",
        clientID: "test-client-id",
        clientSecret: "test-client-secret",
        ssoEnvironment: "prod",
        ssoRealm: "custom-realm",
        ssoProtocol: "saml",
      })
      expect(mockFetch).toHaveBeenCalledWith(
        "https://loginproxy.gov.bc.ca/auth/realms/custom-realm/protocol/saml/token",
        expect.any(Object)
      )
    })

    it("should handle response with optional fields missing", async () => {
      const partialResponse = {
        access_token: "new.access.token",
        id_token: "new.id.token",
        expires_in: 3600,
        // refresh_token and refresh_expires_in missing
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(partialResponse),
      })

      const result = await getNewTokens(defaultProps)

      expect(result).toEqual({
        access_token: "new.access.token",
        refresh_token: undefined,
        id_token: "new.id.token",
        expires_in: 3600,
        refresh_expires_in: undefined,
      })
    })
  })

  describe("when refresh token is invalid", () => {
    it("should return null when refresh token validation fails", async () => {
      mockIsJWTValid.mockResolvedValue(false)

      const result = await getNewTokens(defaultProps)

      expect(result).toBeNull()
      expect(mockIsJWTValid).toHaveBeenCalledWith({
        jwt: "valid.refresh.token",
        clientID: "test-client-id",
        clientSecret: "test-client-secret",
        ssoEnvironment: "dev",
        ssoRealm: "standard",
        ssoProtocol: "openid-connect",
      })
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  describe("when token endpoint returns invalid response", () => {
    beforeEach(() => {
      mockIsJWTValid.mockResolvedValue(true)
    })

    it("should throw error when access_token is missing", async () => {
      const invalidResponse = {
        // access_token missing
        refresh_token: "new.refresh.token",
        id_token: "new.id.token",
        expires_in: 3600,
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(invalidResponse),
      })

      await expect(getNewTokens(defaultProps)).rejects.toThrow(
        "Couldn't get access or id token from KC token endpoint"
      )
    })

    it("should throw error when id_token is missing", async () => {
      const invalidResponse = {
        access_token: "new.access.token",
        refresh_token: "new.refresh.token",
        // id_token missing
        expires_in: 3600,
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(invalidResponse),
      })

      await expect(getNewTokens(defaultProps)).rejects.toThrow(
        "Couldn't get access or id token from KC token endpoint"
      )
    })

    it("should throw error when response data is null", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(null),
      })

      await expect(getNewTokens(defaultProps)).rejects.toThrow(
        "Cannot destructure property 'access_token' of 'data' as it is null."
      )
    })

    it("should throw error when response data is undefined", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(undefined),
      })

      await expect(getNewTokens(defaultProps)).rejects.toThrow(
        "Cannot destructure property 'access_token' of 'data' as it is undefined."
      )
    })
  })

  describe("when network or parsing errors occur", () => {
    beforeEach(() => {
      mockIsJWTValid.mockResolvedValue(true)
    })

    it("should throw error when fetch fails", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"))

      await expect(getNewTokens(defaultProps)).rejects.toThrow("Network error")
    })

    it("should throw error when JSON parsing fails", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockRejectedValue(new Error("Invalid JSON")),
      })

      await expect(getNewTokens(defaultProps)).rejects.toThrow("Invalid JSON")
    })

    it("should throw error when isJWTValid fails", async () => {
      mockIsJWTValid.mockRejectedValue(new Error("JWT validation error"))

      await expect(getNewTokens(defaultProps)).rejects.toThrow("JWT validation error")
    })
  })

  describe("with special characters in parameters", () => {
    beforeEach(() => {
      mockIsJWTValid.mockResolvedValue(true)
    })

    it("should handle special characters in refresh token and credentials", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTokenResponse),
      })

      await getNewTokens({
        refreshToken: "refresh+token/with=special&chars",
        clientID: "client-id&special=chars",
        clientSecret: "secret+with/special=chars",
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: "grant_type=refresh_token&client_id=client-id&special=chars&client_secret=secret+with/special=chars&refresh_token=refresh+token/with=special&chars",
        })
      )
    })
  })

  describe("edge cases", () => {
    beforeEach(() => {
      mockIsJWTValid.mockResolvedValue(true)
    })

    it("should handle empty string values", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          access_token: "token",
          id_token: "token",
        }),
      })

      await getNewTokens({
        refreshToken: "",
        clientID: "",
        clientSecret: "",
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: "grant_type=refresh_token&client_id=&client_secret=&refresh_token=",
        })
      )
    })

    it("should handle numeric values in token response", async () => {
      const responseWithNumbers = {
        access_token: "new.access.token",
        refresh_token: "new.refresh.token",
        id_token: "new.id.token",
        expires_in: 3600,
        refresh_expires_in: 7200,
        scope: "openid profile",
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(responseWithNumbers),
      })

      const result = await getNewTokens(defaultProps)

      expect(result).toEqual({
        access_token: "new.access.token",
        refresh_token: "new.refresh.token",
        id_token: "new.id.token",
        expires_in: 3600,
        refresh_expires_in: 7200,
      })
    })
  })
})
