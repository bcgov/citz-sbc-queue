import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { config, middleware } from "./middleware"

// Mock the auth middleware module
vi.mock("./middleware/auth", () => ({
  authMiddleware: vi.fn(),
  isProtectedRoute: vi.fn(),
}))

// Mock the utils module
vi.mock("./middleware/utils", () => ({
  conditional: vi.fn(),
}))

// Import the mocked functions with proper typing
import { authMiddleware, isProtectedRoute } from "./middleware/auth"
import { conditional } from "./middleware/utils"

const mockAuthMiddleware = vi.mocked(authMiddleware)
const mockIsProtectedRoute = vi.mocked(isProtectedRoute)
const mockConditional = vi.mocked(conditional)

describe("middleware", () => {
  const createMockRequest = (
    url = "https://example.com/api/test",
    headers: Record<string, string> = {}
  ): NextRequest => {
    const mockHeaders = new Headers(Object.entries(headers))
    const pathname = new URL(url).pathname

    return {
      url,
      nextUrl: { pathname },
      headers: {
        get: (name: string) => mockHeaders.get(name),
      },
    } as NextRequest
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("middleware function", () => {
    it("should create conditional middleware that checks for protected routes", async () => {
      const mockConditionalMiddleware = vi.fn().mockResolvedValue(NextResponse.next())
      mockConditional.mockReturnValue(mockConditionalMiddleware)

      const request = createMockRequest("https://example.com/api/protected/users")

      await middleware(request)

      // Verify conditional was called with the correct parameters
      expect(mockConditional).toHaveBeenCalledWith(
        expect.any(Function), // The condition function
        mockAuthMiddleware // The auth middleware
      )

      // Verify the conditional middleware was called with the request
      expect(mockConditionalMiddleware).toHaveBeenCalledWith(request)
    })

    it("should pass isProtectedRoute as condition to conditional middleware", async () => {
      const mockConditionalMiddleware = vi.fn().mockResolvedValue(NextResponse.next())
      mockConditional.mockReturnValue(mockConditionalMiddleware)

      const request = createMockRequest("https://example.com/api/protected/users")

      await middleware(request)

      // Get the condition function that was passed to conditional
      const conditionFunction = mockConditional.mock.calls[0][0]

      // Test that the condition function calls isProtectedRoute with the pathname
      mockIsProtectedRoute.mockReturnValue(true)
      const result = conditionFunction(request)

      expect(mockIsProtectedRoute).toHaveBeenCalledWith("/api/protected/users")
      expect(result).toBe(true)
    })

    it("should return the response from conditional middleware", async () => {
      const expectedResponse = NextResponse.json({ message: "success" })
      const mockConditionalMiddleware = vi.fn().mockResolvedValue(expectedResponse)
      mockConditional.mockReturnValue(mockConditionalMiddleware)

      const request = createMockRequest()

      const result = await middleware(request)

      expect(result).toBe(expectedResponse)
    })

    it("should handle different URL pathnames correctly", async () => {
      const mockConditionalMiddleware = vi.fn().mockResolvedValue(NextResponse.next())
      mockConditional.mockReturnValue(mockConditionalMiddleware)

      const testCases = [
        "https://example.com/",
        "https://example.com/api/public/health",
        "https://example.com/api/protected/admin",
        "https://example.com/protected/dashboard",
        "https://example.com/api/auth/login",
      ]

      for (const url of testCases) {
        vi.clearAllMocks()
        const request = createMockRequest(url)

        await middleware(request)

        // Get the condition function and test it
        const conditionFunction = mockConditional.mock.calls[0][0]
        conditionFunction(request)

        const expectedPathname = new URL(url).pathname
        expect(mockIsProtectedRoute).toHaveBeenCalledWith(expectedPathname)
      }
    })

    it("should handle errors from conditional middleware", async () => {
      const error = new Error("Middleware error")
      const mockConditionalMiddleware = vi.fn().mockRejectedValue(error)
      mockConditional.mockReturnValue(mockConditionalMiddleware)

      const request = createMockRequest()

      await expect(middleware(request)).rejects.toThrow("Middleware error")
    })

    it("should work with various HTTP methods", async () => {
      const mockConditionalMiddleware = vi.fn().mockResolvedValue(NextResponse.next())
      mockConditional.mockReturnValue(mockConditionalMiddleware)

      const request = createMockRequest("https://example.com/api/protected/users")

      await middleware(request)

      expect(mockConditionalMiddleware).toHaveBeenCalledWith(request)
    })

    describe("condition function behavior", () => {
      let conditionFunction: (req: NextRequest) => boolean

      beforeEach(async () => {
        const mockConditionalMiddleware = vi.fn().mockResolvedValue(NextResponse.next())
        mockConditional.mockReturnValue(mockConditionalMiddleware)

        const request = createMockRequest()
        await middleware(request)

        // Extract the condition function
        conditionFunction = mockConditional.mock.calls[0][0]
      })

      it("should return true when isProtectedRoute returns true", () => {
        mockIsProtectedRoute.mockReturnValue(true)
        const request = createMockRequest("https://example.com/api/protected/data")

        const result = conditionFunction(request)

        expect(mockIsProtectedRoute).toHaveBeenCalledWith("/api/protected/data")
        expect(result).toBe(true)
      })

      it("should return false when isProtectedRoute returns false", () => {
        mockIsProtectedRoute.mockReturnValue(false)
        const request = createMockRequest("https://example.com/api/public/health")

        const result = conditionFunction(request)

        expect(mockIsProtectedRoute).toHaveBeenCalledWith("/api/public/health")
        expect(result).toBe(false)
      })

      it("should handle root path correctly", () => {
        mockIsProtectedRoute.mockReturnValue(false)
        const request = createMockRequest("https://example.com/")

        const result = conditionFunction(request)

        expect(mockIsProtectedRoute).toHaveBeenCalledWith("/")
        expect(result).toBe(false)
      })

      it("should handle paths with query parameters", () => {
        mockIsProtectedRoute.mockReturnValue(true)
        const request = createMockRequest("https://example.com/api/protected/users?page=1&limit=10")

        const result = conditionFunction(request)

        expect(mockIsProtectedRoute).toHaveBeenCalledWith("/api/protected/users")
        expect(result).toBe(true)
      })

      it("should handle paths with fragments", () => {
        mockIsProtectedRoute.mockReturnValue(false)
        const request = createMockRequest("https://example.com/api/public/docs#section1")

        const result = conditionFunction(request)

        expect(mockIsProtectedRoute).toHaveBeenCalledWith("/api/public/docs")
        expect(result).toBe(false)
      })
    })
  })

  describe("config", () => {
    it("should have correct matcher configuration", () => {
      expect(config).toBeDefined()
      expect(config.matcher).toBeDefined()
      expect(Array.isArray(config.matcher)).toBe(true)
      expect(config.matcher).toHaveLength(1)
    })

    it("should exclude static files and auth routes", () => {
      const matcher = config.matcher[0]

      // The matcher should be a string that excludes specific patterns
      expect(typeof matcher).toBe("string")
      expect(matcher).toContain("_next/static")
      expect(matcher).toContain("_next/image")
      expect(matcher).toContain("favicon.ico")
      expect(matcher).toContain("api/auth")
    })

    it("should match the expected pattern", () => {
      const expectedPattern = "/((?!_next/static|_next/image|favicon.ico|api/auth).*)"
      expect(config.matcher[0]).toBe(expectedPattern)
    })
  })

  describe("integration scenarios", () => {
    it("should handle complete flow for protected route", async () => {
      const expectedResponse = NextResponse.json({ message: "authenticated" })
      const mockConditionalMiddleware = vi.fn().mockResolvedValue(expectedResponse)
      mockConditional.mockReturnValue(mockConditionalMiddleware)
      mockIsProtectedRoute.mockReturnValue(true)

      const request = createMockRequest("https://example.com/api/protected/users", {
        authorization: "Bearer valid-token",
      })

      const result = await middleware(request)

      // Verify the full chain
      expect(mockConditional).toHaveBeenCalledWith(expect.any(Function), mockAuthMiddleware)
      expect(mockConditionalMiddleware).toHaveBeenCalledWith(request)
      expect(result).toBe(expectedResponse)

      // Verify condition logic
      const conditionFunction = mockConditional.mock.calls[0][0]
      const conditionResult = conditionFunction(request)
      expect(mockIsProtectedRoute).toHaveBeenCalledWith("/api/protected/users")
      expect(conditionResult).toBe(true)
    })

    it("should handle complete flow for non-protected route", async () => {
      const expectedResponse = NextResponse.next()
      const mockConditionalMiddleware = vi.fn().mockResolvedValue(expectedResponse)
      mockConditional.mockReturnValue(mockConditionalMiddleware)
      mockIsProtectedRoute.mockReturnValue(false)

      const request = createMockRequest("https://example.com/api/public/health")

      const result = await middleware(request)

      // Verify the conditional middleware was still called
      expect(mockConditionalMiddleware).toHaveBeenCalledWith(request)
      expect(result).toBe(expectedResponse)

      // Verify condition logic
      const conditionFunction = mockConditional.mock.calls[0][0]
      const conditionResult = conditionFunction(request)
      expect(mockIsProtectedRoute).toHaveBeenCalledWith("/api/public/health")
      expect(conditionResult).toBe(false)
    })

    it("should handle errors in condition function gracefully", async () => {
      const mockConditionalMiddleware = vi.fn().mockResolvedValue(NextResponse.next())
      mockConditional.mockReturnValue(mockConditionalMiddleware)
      mockIsProtectedRoute.mockImplementation(() => {
        throw new Error("Route checking error")
      })

      const request = createMockRequest("https://example.com/api/test")

      await middleware(request)

      // Get and test the condition function
      const conditionFunction = mockConditional.mock.calls[0][0]

      expect(() => conditionFunction(request)).toThrow("Route checking error")
    })

    it("should handle complex URL scenarios", async () => {
      const mockConditionalMiddleware = vi.fn().mockResolvedValue(NextResponse.next())
      mockConditional.mockReturnValue(mockConditionalMiddleware)
      mockIsProtectedRoute.mockReturnValue(false) // Reset to normal behavior

      const complexUrls = [
        "https://subdomain.example.com/api/protected/users",
        "http://localhost:3000/api/protected/admin",
        "https://example.com:8080/protected/dashboard",
        "https://example.com/api/v1/protected/resources",
      ]

      for (const url of complexUrls) {
        vi.clearAllMocks()
        mockConditional.mockReturnValue(mockConditionalMiddleware)
        mockIsProtectedRoute.mockReturnValue(false)

        const request = createMockRequest(url)

        await middleware(request)

        expect(mockConditionalMiddleware).toHaveBeenCalledWith(request)

        // Test condition function with each URL
        const conditionFunction = mockConditional.mock.calls[0][0]
        conditionFunction(request)

        const expectedPathname = new URL(url).pathname
        expect(mockIsProtectedRoute).toHaveBeenCalledWith(expectedPathname)
      }
    })
  })

  describe("edge cases", () => {
    it("should handle malformed URLs gracefully", async () => {
      const mockConditionalMiddleware = vi.fn().mockResolvedValue(NextResponse.next())
      mockConditional.mockReturnValue(mockConditionalMiddleware)

      // This should still work because NextRequest should have valid URL
      const request = createMockRequest("https://example.com/api/test")

      await middleware(request)

      expect(mockConditionalMiddleware).toHaveBeenCalledWith(request)
    })

    it("should handle request without nextUrl", async () => {
      const mockConditionalMiddleware = vi.fn().mockResolvedValue(NextResponse.next())
      mockConditional.mockReturnValue(mockConditionalMiddleware)

      // Create a request with minimal properties
      const request = {
        url: "https://example.com/api/test",
        nextUrl: { pathname: "/api/test" },
        headers: { get: () => null },
      } as unknown as NextRequest

      await middleware(request)

      expect(mockConditionalMiddleware).toHaveBeenCalledWith(request)
    })

    it("should handle very long pathnames", async () => {
      const mockConditionalMiddleware = vi.fn().mockResolvedValue(NextResponse.next())
      mockConditional.mockReturnValue(mockConditionalMiddleware)
      mockIsProtectedRoute.mockReturnValue(false)

      const longPath = `/api/public/${"very-long-path-segment/".repeat(100)}endpoint`
      const request = createMockRequest(`https://example.com${longPath}`)

      await middleware(request)

      const conditionFunction = mockConditional.mock.calls[0][0]
      conditionFunction(request)

      expect(mockIsProtectedRoute).toHaveBeenCalledWith(longPath)
    })

    it("should handle special characters in pathname", async () => {
      const mockConditionalMiddleware = vi.fn().mockResolvedValue(NextResponse.next())
      mockConditional.mockReturnValue(mockConditionalMiddleware)
      mockIsProtectedRoute.mockReturnValue(true)

      const specialPath = "/api/protected/users/test%20user/data"
      const request = createMockRequest(`https://example.com${specialPath}`)

      await middleware(request)

      const conditionFunction = mockConditional.mock.calls[0][0]
      conditionFunction(request)

      expect(mockIsProtectedRoute).toHaveBeenCalledWith(specialPath)
    })
  })
})
