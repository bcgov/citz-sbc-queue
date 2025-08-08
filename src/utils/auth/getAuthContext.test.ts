import type { NextRequest } from "next/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { getAuthContext } from "./getAuthContext"
import type { SSOIdirUser } from "./types"

// Mock console.error to avoid noise in tests
const mockConsoleError = vi.spyOn(console, "error").mockImplementation(() => {
  // No-op implementation for testing
})

describe("getAuthContext", () => {
  beforeEach(() => {
    mockConsoleError.mockClear()
  })

  const mockUser: SSOIdirUser = {
    exp: 1234567890,
    iat: 1234567800,
    auth_time: 1234567800,
    jti: "test-jti",
    iss: "test-issuer",
    aud: "test-audience",
    sub: "test-subject",
    typ: "Bearer",
    azp: "test-azp",
    nonce: "test-nonce",
    session_state: "test-session",
    sid: "test-sid",
    identity_provider: "idir",
    email_verified: true,
    preferred_username: "testuser",
    idir_user_guid: "test-guid",
    idir_username: "testuser",
    name: "Test User",
    display_name: "Test User",
    given_name: "Test",
    family_name: "User",
    email: "test@example.com",
  }

  const mockRoles = ["admin", "user"]

  const createMockRequest = (headers: Record<string, string | null>): NextRequest => {
    const headerEntries = Object.entries(headers).filter(([, value]) => value !== null)
    const mockHeaders = new Headers(headerEntries as [string, string][])

    return {
      headers: {
        get: (name: string) => mockHeaders.get(name),
      },
    } as NextRequest
  }

  describe("when all required headers are present and valid", () => {
    it("should return auth context with user, token, and roles", () => {
      const request = createMockRequest({
        "x-user-token": "valid-token",
        "x-user-info": JSON.stringify(mockUser),
        "x-user-roles": JSON.stringify(mockRoles),
      })

      const result = getAuthContext(request)

      expect(result).toEqual({
        user: mockUser,
        token: "valid-token",
        roles: mockRoles,
      })
    })

    it("should return auth context with empty roles when x-user-roles header is missing", () => {
      const request = createMockRequest({
        "x-user-token": "valid-token",
        "x-user-info": JSON.stringify(mockUser),
        "x-user-roles": null,
      })

      const result = getAuthContext(request)

      expect(result).toEqual({
        user: mockUser,
        token: "valid-token",
        roles: [],
      })
    })
  })

  describe("when required headers are missing", () => {
    it("should return null when x-user-token header is missing", () => {
      const request = createMockRequest({
        "x-user-token": null,
        "x-user-info": JSON.stringify(mockUser),
        "x-user-roles": JSON.stringify(mockRoles),
      })

      const result = getAuthContext(request)

      expect(result).toBeNull()
    })

    it("should return null when x-user-info header is missing", () => {
      const request = createMockRequest({
        "x-user-token": "valid-token",
        "x-user-info": null,
        "x-user-roles": JSON.stringify(mockRoles),
      })

      const result = getAuthContext(request)

      expect(result).toBeNull()
    })

    it("should return null when both required headers are missing", () => {
      const request = createMockRequest({
        "x-user-token": null,
        "x-user-info": null,
        "x-user-roles": JSON.stringify(mockRoles),
      })

      const result = getAuthContext(request)

      expect(result).toBeNull()
    })
  })

  describe("when headers contain invalid JSON", () => {
    it("should return null and log error when x-user-info contains invalid JSON", () => {
      const request = createMockRequest({
        "x-user-token": "valid-token",
        "x-user-info": "invalid-json",
        "x-user-roles": JSON.stringify(mockRoles),
      })

      const result = getAuthContext(request)

      expect(result).toBeNull()
      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error parsing auth context:",
        expect.any(SyntaxError)
      )
    })

    it("should return null and log error when x-user-roles contains invalid JSON", () => {
      const request = createMockRequest({
        "x-user-token": "valid-token",
        "x-user-info": JSON.stringify(mockUser),
        "x-user-roles": "invalid-json",
      })

      const result = getAuthContext(request)

      expect(result).toBeNull()
      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error parsing auth context:",
        expect.any(SyntaxError)
      )
    })
  })

  describe("edge cases", () => {
    it("should handle empty string headers", () => {
      const request = createMockRequest({
        "x-user-token": "",
        "x-user-info": "",
        "x-user-roles": "",
      })

      const result = getAuthContext(request)

      expect(result).toBeNull()
    })

    it("should handle valid empty arrays for roles", () => {
      const request = createMockRequest({
        "x-user-token": "valid-token",
        "x-user-info": JSON.stringify(mockUser),
        "x-user-roles": JSON.stringify([]),
      })

      const result = getAuthContext(request)

      expect(result).toEqual({
        user: mockUser,
        token: "valid-token",
        roles: [],
      })
    })

    it("should handle valid JSON null for roles", () => {
      const request = createMockRequest({
        "x-user-token": "valid-token",
        "x-user-info": JSON.stringify(mockUser),
        "x-user-roles": "null",
      })

      const result = getAuthContext(request)

      expect(result).toEqual({
        user: mockUser,
        token: "valid-token",
        roles: null,
      })
    })
  })
})
