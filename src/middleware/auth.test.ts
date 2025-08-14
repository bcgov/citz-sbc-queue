import type { NextRequest } from "next/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  apiAuthMiddleware,
  authMiddleware,
  frontendAuthMiddleware,
  isFrontendRoute,
  isProtectedRoute,
} from "./auth"

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock console.error to avoid noise in tests
const mockConsoleError = vi.spyOn(console, "error").mockImplementation(() => {
  // No-op implementation for testing
})

describe("middleware/auth", () => {
  beforeEach(() => {
    mockFetch.mockClear()
    mockConsoleError.mockClear()
  })

  describe("isProtectedRoute", () => {
    it("should return true for routes containing '/protected'", () => {
      expect(isProtectedRoute("/api/protected/users")).toBe(true)
      expect(isProtectedRoute("/api/admin/protected/settings")).toBe(true)
      expect(isProtectedRoute("/protected")).toBe(true)
      expect(isProtectedRoute("/some/protected/path")).toBe(true)
      expect(isProtectedRoute("/dashboard/protected/admin")).toBe(true)
    })

    it("should return false for routes not containing '/protected'", () => {
      expect(isProtectedRoute("/api/public/health")).toBe(false)
      expect(isProtectedRoute("/api/auth/login")).toBe(false)
      expect(isProtectedRoute("/")).toBe(false)
      expect(isProtectedRoute("/users")).toBe(false)
      expect(isProtectedRoute("/api/users")).toBe(false)
      expect(isProtectedRoute("/dashboard")).toBe(false)
      expect(isProtectedRoute("/appointments")).toBe(false)
    })

    it("should handle edge cases", () => {
      expect(isProtectedRoute("")).toBe(false)
      expect(isProtectedRoute("protected")).toBe(false) // No leading slash - doesn't contain "/protected"
      expect(isProtectedRoute("/protect")).toBe(false) // Partial match
      expect(isProtectedRoute("/protecteduser")).toBe(true) // Contains "/protected" as substring
    })
  })

  describe("apiAuthMiddleware", () => {
    const createMockRequest = (
      headers: Record<string, string | null>,
      url = "https://example.com/api/test"
    ): NextRequest => {
      const headerEntries = Object.entries(headers).filter(([, value]) => value !== null)
      const mockHeaders = new Headers(headerEntries as [string, string][])

      return {
        url,
        headers: {
          get: (name: string) => mockHeaders.get(name),
        },
      } as NextRequest
    }

    const mockValidationResponse = {
      valid: true,
      user: { id: "123", name: "Test User" },
      roles: ["admin", "user"],
    }

    describe("when authorization header is missing", () => {
      it("should return 401 with error message", async () => {
        const request = createMockRequest({
          authorization: null,
        })

        const response = await apiAuthMiddleware(request)
        const responseData = await response.json()

        expect(response.status).toBe(401)
        expect(responseData).toEqual({ error: "No authorization header found" })
      })

      it("should return 401 when authorization header is empty string", async () => {
        const request = createMockRequest({
          authorization: "",
        })

        const response = await apiAuthMiddleware(request)
        const responseData = await response.json()

        expect(response.status).toBe(401)
        expect(responseData).toEqual({ error: "No authorization header found" })
      })
    })

    describe("when authorization header format is invalid", () => {
      it("should return 401 when token is missing from Bearer format", async () => {
        const request = createMockRequest({
          authorization: "Bearer",
        })

        const response = await apiAuthMiddleware(request)
        const responseData = await response.json()

        expect(response.status).toBe(401)
        expect(responseData).toEqual({ error: "Invalid authorization header format" })
      })

      it("should return 401 when authorization header has no Bearer prefix", async () => {
        const request = createMockRequest({
          authorization: "token123",
        })

        const response = await apiAuthMiddleware(request)
        const responseData = await response.json()

        expect(response.status).toBe(401)
        expect(responseData).toEqual({ error: "Invalid authorization header format" })
      })

      it("should return 401 when token part is empty", async () => {
        const request = createMockRequest({
          authorization: "Bearer ",
        })

        const response = await apiAuthMiddleware(request)
        const responseData = await response.json()

        expect(response.status).toBe(401)
        expect(responseData).toEqual({ error: "Invalid authorization header format" })
      })
    })

    describe("when token validation succeeds", () => {
      beforeEach(() => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockValidationResponse),
        })
      })

      it("should call validation API with correct parameters", async () => {
        const request = createMockRequest(
          {
            authorization: "Bearer valid-token",
          },
          "https://example.com/api/test"
        )

        await apiAuthMiddleware(request)

        expect(mockFetch).toHaveBeenCalledWith("https://example.com/api/auth/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: "valid-token" }),
        })
      })

      it("should return NextResponse.next() with auth headers", async () => {
        const request = createMockRequest({
          authorization: "Bearer valid-token",
        })

        const response = await apiAuthMiddleware(request)

        expect(response.status).toBe(200)
        expect(response.headers.get("x-user-token")).toBe("valid-token")
        expect(response.headers.get("x-user-info")).toBe(
          JSON.stringify(mockValidationResponse.user)
        )
        expect(response.headers.get("x-user-roles")).toBe(
          JSON.stringify(mockValidationResponse.roles)
        )
      })

      it("should handle validation response with no roles", async () => {
        const responseWithoutRoles = {
          valid: true,
          user: { id: "123", name: "Test User" },
        }

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(responseWithoutRoles),
        })

        const request = createMockRequest({
          authorization: "Bearer valid-token",
        })

        const response = await apiAuthMiddleware(request)

        expect(response.status).toBe(200)
        expect(response.headers.get("x-user-roles")).toBe("[]")
      })
    })

    describe("when token validation fails", () => {
      it("should return error response when validation API returns not ok", async () => {
        const errorResponse = { valid: false, error: "Invalid token" }
        mockFetch.mockResolvedValue({
          ok: false,
          status: 401,
          json: () => Promise.resolve(errorResponse),
        })

        const request = createMockRequest({
          authorization: "Bearer invalid-token",
        })

        const response = await apiAuthMiddleware(request)
        const responseData = await response.json()

        expect(response.status).toBe(401)
        expect(responseData).toEqual({ error: "Invalid token" })
      })

      it("should return error response when validation result is invalid", async () => {
        const errorResponse = { valid: false, error: "Token expired" }
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(errorResponse),
        })

        const request = createMockRequest({
          authorization: "Bearer expired-token",
        })

        const response = await apiAuthMiddleware(request)
        const responseData = await response.json()

        expect(response.status).toBe(200) // Uses response status from fetch
        expect(responseData).toEqual({ error: "Token expired" })
      })

      it("should return default error message when validation error is missing", async () => {
        const errorResponse = { valid: false }
        mockFetch.mockResolvedValue({
          ok: false,
          status: 403,
          json: () => Promise.resolve(errorResponse),
        })

        const request = createMockRequest({
          authorization: "Bearer invalid-token",
        })

        const response = await apiAuthMiddleware(request)
        const responseData = await response.json()

        expect(response.status).toBe(403)
        expect(responseData).toEqual({ error: "Token validation failed" })
      })
    })

    describe("when validation API call fails", () => {
      it("should return 500 error when fetch throws an error", async () => {
        mockFetch.mockRejectedValue(new Error("Network error"))

        const request = createMockRequest({
          authorization: "Bearer valid-token",
        })

        const response = await apiAuthMiddleware(request)
        const responseData = await response.json()

        expect(response.status).toBe(500)
        expect(responseData).toEqual({ error: "Authentication middleware failed" })
        expect(mockConsoleError).toHaveBeenCalledWith("Auth middleware error:", expect.any(Error))
      })

      it("should return 500 error when validation response JSON parsing fails", async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.reject(new Error("Invalid JSON")),
        })

        const request = createMockRequest({
          authorization: "Bearer valid-token",
        })

        const response = await apiAuthMiddleware(request)
        const responseData = await response.json()

        expect(response.status).toBe(500)
        expect(responseData).toEqual({ error: "Authentication middleware failed" })
        expect(mockConsoleError).toHaveBeenCalledWith("Auth middleware error:", expect.any(Error))
      })
    })

    describe("edge cases", () => {
      it("should handle different URL formats correctly", async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockValidationResponse),
        })

        const request = createMockRequest(
          {
            authorization: "Bearer valid-token",
          },
          "http://localhost:3000/api/protected/data"
        )

        await apiAuthMiddleware(request)

        expect(mockFetch).toHaveBeenCalledWith("http://localhost:3000/api/auth/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: "valid-token" }),
        })
      })

      it("should handle authorization header with multiple spaces correctly", async () => {
        const request = createMockRequest({
          authorization: "Bearer  valid-token-with-spaces",
        })

        // This should fail because split(" ")[1] will be an empty string
        // when there are multiple spaces
        const response = await apiAuthMiddleware(request)
        const responseData = await response.json()

        expect(response.status).toBe(401)
        expect(responseData).toEqual({ error: "Invalid authorization header format" })
      })

      it("should handle very long tokens", async () => {
        const longToken = "a".repeat(2000)
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockValidationResponse),
        })

        const request = createMockRequest({
          authorization: `Bearer ${longToken}`,
        })

        const response = await apiAuthMiddleware(request)

        expect(response.status).toBe(200)
        expect(response.headers.get("x-user-token")).toBe(longToken)
      })
    })
  })

  describe("authMiddleware", () => {
    const createMockRequest = (
      headers: Record<string, string | null>,
      cookies: Record<string, string> = {},
      url = "https://example.com/dashboard"
    ): NextRequest => {
      const headerEntries = Object.entries(headers).filter(([, value]) => value !== null)
      const mockHeaders = new Headers(headerEntries as [string, string][])

      return {
        url,
        nextUrl: { pathname: new URL(url).pathname },
        headers: {
          get: (name: string) => mockHeaders.get(name),
        },
        cookies: {
          get: (name: string) => (cookies[name] ? { value: cookies[name] } : undefined),
        },
      } as NextRequest
    }

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            valid: true,
            user: { id: "123", name: "Test User" },
            roles: ["user"],
          }),
      })
    })

    it("should call frontendAuthMiddleware for frontend routes", async () => {
      const request = createMockRequest(
        {},
        { access_token: "valid-token" },
        "https://example.com/dashboard"
      )

      const response = await authMiddleware(request)

      expect(response.status).toBe(200)
      expect(mockFetch).toHaveBeenCalledWith("https://example.com/api/auth/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: "valid-token" }),
      })
    })

    it("should call apiAuthMiddleware for API routes", async () => {
      const request = createMockRequest(
        { authorization: "Bearer api-token" },
        {},
        "https://example.com/api/protected/users"
      )

      const response = await authMiddleware(request)

      expect(response.status).toBe(200)
      expect(mockFetch).toHaveBeenCalledWith("https://example.com/api/auth/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: "api-token" }),
      })
    })
  })

  describe("isFrontendRoute", () => {
    it("should return true for non-API routes", () => {
      expect(isFrontendRoute("/")).toBe(true)
      expect(isFrontendRoute("/dashboard")).toBe(true)
      expect(isFrontendRoute("/appointments")).toBe(true)
      expect(isFrontendRoute("/appointments/123")).toBe(true)
      expect(isFrontendRoute("/profile")).toBe(true)
    })

    it("should return false for API routes", () => {
      expect(isFrontendRoute("/api/")).toBe(false)
      expect(isFrontendRoute("/api/auth")).toBe(false)
      expect(isFrontendRoute("/api/auth/login")).toBe(false)
      expect(isFrontendRoute("/api/protected/users")).toBe(false)
      expect(isFrontendRoute("/api/public/health")).toBe(false)
    })
  })

  describe("frontendAuthMiddleware", () => {
    const createMockRequestWithCookies = (
      cookies: Record<string, string>,
      url = "https://example.com/dashboard"
    ): NextRequest => {
      return {
        url,
        cookies: {
          get: (name: string) => (cookies[name] ? { value: cookies[name] } : undefined),
        },
      } as NextRequest
    }

    const mockValidationResponse = {
      valid: true,
      user: { id: "123", name: "Test User" },
      roles: ["user"],
    }

    describe("when access token cookie is missing", () => {
      it("should redirect to home page", async () => {
        const request = createMockRequestWithCookies({})

        const response = await frontendAuthMiddleware(request)

        expect(response.status).toBe(307) // Redirect status
        expect(response.headers.get("location")).toBe("https://example.com/")
      })
    })

    describe("when access token is present and valid", () => {
      beforeEach(() => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockValidationResponse),
        })
      })

      it("should call validation API and continue with request", async () => {
        const request = createMockRequestWithCookies({
          access_token: "valid-token",
        })

        const response = await frontendAuthMiddleware(request)

        expect(mockFetch).toHaveBeenCalledWith("https://example.com/api/auth/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: "valid-token" }),
        })

        expect(response.status).toBe(200)
        // Frontend middleware should not set headers, only API middleware does
      })
    })

    describe("when access token is present but invalid", () => {
      it("should redirect to home page when validation fails", async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ valid: false, error: "Invalid token" }),
        })

        const request = createMockRequestWithCookies({
          access_token: "invalid-token",
        })

        const response = await frontendAuthMiddleware(request)

        expect(response.status).toBe(307) // Redirect status
        expect(response.headers.get("location")).toBe("https://example.com/")
      })

      it("should redirect to home page when validation returns invalid", async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ valid: false }),
        })

        const request = createMockRequestWithCookies({
          access_token: "invalid-token",
        })

        const response = await frontendAuthMiddleware(request)

        expect(response.status).toBe(307) // Redirect status
        expect(response.headers.get("location")).toBe("https://example.com/")
      })
    })

    describe("when validation API call fails", () => {
      it("should redirect to home page on network error", async () => {
        mockFetch.mockRejectedValue(new Error("Network error"))

        const request = createMockRequestWithCookies({
          access_token: "valid-token",
        })

        const response = await frontendAuthMiddleware(request)

        expect(response.status).toBe(307) // Redirect status
        expect(response.headers.get("location")).toBe("https://example.com/")
        expect(mockConsoleError).toHaveBeenCalledWith(
          "Frontend auth middleware error:",
          expect.any(Error)
        )
      })
    })
  })
})
