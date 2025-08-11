import { NextRequest } from "next/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// Mock the JWT utilities
vi.mock("@/utils/auth/jwt/decodeJWT", () => ({
  decodeJWT: vi.fn(),
}))

vi.mock("@/utils/auth/jwt/isJWTValid", () => ({
  isJWTValid: vi.fn(),
}))

describe("/api/auth/validate", () => {
  const mockUserInfo = {
    sub: "user-123",
    email: "user@example.com",
    name: "Test User",
    client_roles: ["admin", "user"],
    preferred_username: "testuser",
    given_name: "Test",
    family_name: "User",
    exp: Date.now() / 1000 + 3600,
    iat: Date.now() / 1000,
    auth_time: Date.now() / 1000,
    jti: "jwt-id-123",
    iss: "https://dev.loginproxy.gov.bc.ca/auth/realms/standard",
    aud: "test-client-id",
    typ: "Bearer",
    azp: "test-client-id",
    nonce: "nonce-123",
    session_state: "session-123",
    sid: "session-id-123",
    identity_provider: "idir" as const,
    email_verified: true,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe("POST", () => {
    it("should return 500 error when SSO_CLIENT_ID is missing", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
        // Mock implementation - no action needed
      })

      vi.stubEnv("SSO_CLIENT_SECRET", "test-client-secret")
      // Don't set SSO_CLIENT_ID

      const { POST } = await import("./route")

      const request = new NextRequest("http://localhost:3000/api/auth/validate", {
        method: "POST",
        body: JSON.stringify({ token: "test-token" }),
        headers: {
          "content-type": "application/json",
        },
      })
      const response = await POST(request)

      expect(response.status).toBe(500)

      const body = await response.json()
      expect(body).toEqual({
        error: "SSO configuration missing",
      })

      expect(consoleSpy).toHaveBeenCalledWith(
        "SSO_CLIENT_ID and/or SSO_CLIENT_SECRET env variables are undefined."
      )

      consoleSpy.mockRestore()
    })

    it("should return 500 error when SSO_CLIENT_SECRET is missing", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
        // Mock implementation - no action needed
      })

      vi.stubEnv("SSO_CLIENT_ID", "test-client-id")
      // Don't set SSO_CLIENT_SECRET

      const { POST } = await import("./route")

      const request = new NextRequest("http://localhost:3000/api/auth/validate", {
        method: "POST",
        body: JSON.stringify({ token: "test-token" }),
        headers: {
          "content-type": "application/json",
        },
      })
      const response = await POST(request)

      expect(response.status).toBe(500)

      const body = await response.json()
      expect(body).toEqual({
        error: "SSO configuration missing",
      })

      consoleSpy.mockRestore()
    })

    it("should return 400 error when token is missing from request body", async () => {
      vi.stubEnv("SSO_CLIENT_ID", "test-client-id")
      vi.stubEnv("SSO_CLIENT_SECRET", "test-client-secret")

      const { POST } = await import("./route")

      const request = new NextRequest("http://localhost:3000/api/auth/validate", {
        method: "POST",
        body: JSON.stringify({}), // No token
        headers: {
          "content-type": "application/json",
        },
      })
      const response = await POST(request)

      expect(response.status).toBe(400)

      const body = await response.json()
      expect(body).toEqual({
        error: "Token is required",
      })
    })

    it("should return 400 error when token is empty string", async () => {
      vi.stubEnv("SSO_CLIENT_ID", "test-client-id")
      vi.stubEnv("SSO_CLIENT_SECRET", "test-client-secret")

      const { POST } = await import("./route")

      const request = new NextRequest("http://localhost:3000/api/auth/validate", {
        method: "POST",
        body: JSON.stringify({ token: "" }),
        headers: {
          "content-type": "application/json",
        },
      })
      const response = await POST(request)

      expect(response.status).toBe(400)

      const body = await response.json()
      expect(body).toEqual({
        error: "Token is required",
      })
    })

    it("should return 401 error when token validation fails", async () => {
      vi.stubEnv("SSO_CLIENT_ID", "test-client-id")
      vi.stubEnv("SSO_CLIENT_SECRET", "test-client-secret")
      vi.stubEnv("SSO_ENVIRONMENT", "dev")
      vi.stubEnv("SSO_REALM", "standard")
      vi.stubEnv("SSO_PROTOCOL", "openid-connect")

      const isJWTValidModule = await import("@/utils/auth/jwt/isJWTValid")
      vi.mocked(isJWTValidModule.isJWTValid).mockResolvedValue(false)

      const { POST } = await import("./route")

      const request = new NextRequest("http://localhost:3000/api/auth/validate", {
        method: "POST",
        body: JSON.stringify({ token: "invalid-token" }),
        headers: {
          "content-type": "application/json",
        },
      })
      const response = await POST(request)

      expect(response.status).toBe(401)

      const body = await response.json()
      expect(body).toEqual({
        error: "Unauthorized: Invalid token, re-log to get a new one",
      })

      expect(isJWTValidModule.isJWTValid).toHaveBeenCalledWith({
        jwt: "invalid-token",
        clientID: "test-client-id",
        clientSecret: "test-client-secret",
        ssoEnvironment: "dev",
        ssoProtocol: "openid-connect",
        ssoRealm: "standard",
      })
    })

    it("should return valid response with user info and roles", async () => {
      vi.stubEnv("SSO_CLIENT_ID", "test-client-id")
      vi.stubEnv("SSO_CLIENT_SECRET", "test-client-secret")
      vi.stubEnv("SSO_ENVIRONMENT", "dev")
      vi.stubEnv("SSO_REALM", "standard")
      vi.stubEnv("SSO_PROTOCOL", "openid-connect")

      const isJWTValidModule = await import("@/utils/auth/jwt/isJWTValid")
      const decodeJWTModule = await import("@/utils/auth/jwt/decodeJWT")

      vi.mocked(isJWTValidModule.isJWTValid).mockResolvedValue(true)
      vi.mocked(decodeJWTModule.decodeJWT).mockReturnValue(mockUserInfo)

      const { POST } = await import("./route")

      const request = new NextRequest("http://localhost:3000/api/auth/validate", {
        method: "POST",
        body: JSON.stringify({ token: "valid-token" }),
        headers: {
          "content-type": "application/json",
        },
      })
      const response = await POST(request)

      expect(response.status).toBe(200)

      const body = await response.json()
      expect(body).toEqual({
        valid: true,
        user: mockUserInfo,
        roles: ["admin", "user"],
      })

      expect(isJWTValidModule.isJWTValid).toHaveBeenCalledWith({
        jwt: "valid-token",
        clientID: "test-client-id",
        clientSecret: "test-client-secret",
        ssoEnvironment: "dev",
        ssoProtocol: "openid-connect",
        ssoRealm: "standard",
      })

      expect(decodeJWTModule.decodeJWT).toHaveBeenCalledWith("valid-token")
    })

    it("should return empty roles array when client_roles is undefined", async () => {
      vi.stubEnv("SSO_CLIENT_ID", "test-client-id")
      vi.stubEnv("SSO_CLIENT_SECRET", "test-client-secret")

      const userInfoWithoutRoles = {
        ...mockUserInfo,
        client_roles: undefined,
      }

      const isJWTValidModule = await import("@/utils/auth/jwt/isJWTValid")
      const decodeJWTModule = await import("@/utils/auth/jwt/decodeJWT")

      vi.mocked(isJWTValidModule.isJWTValid).mockResolvedValue(true)
      vi.mocked(decodeJWTModule.decodeJWT).mockReturnValue(userInfoWithoutRoles)

      const { POST } = await import("./route")

      const request = new NextRequest("http://localhost:3000/api/auth/validate", {
        method: "POST",
        body: JSON.stringify({ token: "valid-token" }),
        headers: {
          "content-type": "application/json",
        },
      })
      const response = await POST(request)

      expect(response.status).toBe(200)

      const body = await response.json()
      expect(body).toEqual({
        valid: true,
        user: userInfoWithoutRoles,
        roles: [],
      })
    })

    it("should use default values when environment variables are not set", async () => {
      vi.stubEnv("SSO_CLIENT_ID", "test-client-id")
      vi.stubEnv("SSO_CLIENT_SECRET", "test-client-secret")
      // Clear other env vars to test defaults

      const isJWTValidModule = await import("@/utils/auth/jwt/isJWTValid")
      const decodeJWTModule = await import("@/utils/auth/jwt/decodeJWT")

      vi.mocked(isJWTValidModule.isJWTValid).mockResolvedValue(true)
      vi.mocked(decodeJWTModule.decodeJWT).mockReturnValue(mockUserInfo)

      const { POST } = await import("./route")

      const request = new NextRequest("http://localhost:3000/api/auth/validate", {
        method: "POST",
        body: JSON.stringify({ token: "valid-token" }),
        headers: {
          "content-type": "application/json",
        },
      })
      const response = await POST(request)

      expect(response.status).toBe(200)

      expect(isJWTValidModule.isJWTValid).toHaveBeenCalledWith({
        jwt: "valid-token",
        clientID: "test-client-id",
        clientSecret: "test-client-secret",
        ssoEnvironment: "dev", // default
        ssoProtocol: "openid-connect", // default
        ssoRealm: "standard", // default
      })
    })

    it("should handle isJWTValid throwing an error", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
        // Mock implementation - no action needed
      })

      vi.stubEnv("SSO_CLIENT_ID", "test-client-id")
      vi.stubEnv("SSO_CLIENT_SECRET", "test-client-secret")

      const isJWTValidModule = await import("@/utils/auth/jwt/isJWTValid")
      const error = new Error("JWT validation failed")
      vi.mocked(isJWTValidModule.isJWTValid).mockRejectedValue(error)

      const { POST } = await import("./route")

      const request = new NextRequest("http://localhost:3000/api/auth/validate", {
        method: "POST",
        body: JSON.stringify({ token: "test-token" }),
        headers: {
          "content-type": "application/json",
        },
      })
      const response = await POST(request)

      expect(response.status).toBe(500)

      const body = await response.json()
      expect(body).toEqual({
        error: "Token validation failed",
      })

      expect(consoleSpy).toHaveBeenCalledWith("Token validation error:", error)

      consoleSpy.mockRestore()
    })

    it("should handle decodeJWT throwing an error", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
        // Mock implementation - no action needed
      })

      vi.stubEnv("SSO_CLIENT_ID", "test-client-id")
      vi.stubEnv("SSO_CLIENT_SECRET", "test-client-secret")

      const isJWTValidModule = await import("@/utils/auth/jwt/isJWTValid")
      const decodeJWTModule = await import("@/utils/auth/jwt/decodeJWT")

      vi.mocked(isJWTValidModule.isJWTValid).mockResolvedValue(true)

      const error = new Error("JWT decoding failed")
      vi.mocked(decodeJWTModule.decodeJWT).mockImplementation(() => {
        throw error
      })

      const { POST } = await import("./route")

      const request = new NextRequest("http://localhost:3000/api/auth/validate", {
        method: "POST",
        body: JSON.stringify({ token: "test-token" }),
        headers: {
          "content-type": "application/json",
        },
      })
      const response = await POST(request)

      expect(response.status).toBe(500)

      const body = await response.json()
      expect(body).toEqual({
        error: "Token validation failed",
      })

      expect(consoleSpy).toHaveBeenCalledWith("Token validation error:", error)

      consoleSpy.mockRestore()
    })

    it("should handle JSON parsing errors", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
        // Mock implementation - no action needed
      })

      vi.stubEnv("SSO_CLIENT_ID", "test-client-id")
      vi.stubEnv("SSO_CLIENT_SECRET", "test-client-secret")

      const { POST } = await import("./route")

      const request = new NextRequest("http://localhost:3000/api/auth/validate", {
        method: "POST",
        body: "invalid-json", // Invalid JSON
        headers: {
          "content-type": "application/json",
        },
      })
      const response = await POST(request)

      expect(response.status).toBe(500)

      const body = await response.json()
      expect(body).toEqual({
        error: "Token validation failed",
      })

      consoleSpy.mockRestore()
    })
  })
})
