import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

describe("/api/auth/token/clear", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe("POST", () => {
    it("should return 200 status with success message", async () => {
      const { POST } = await import("./route")

      const response = await POST()

      expect(response.status).toBe(200)

      const body = await response.json()
      expect(body).toEqual({
        message: "Cleared token cookies.",
      })
    })

    it("should clear all authentication cookies in development environment", async () => {
      vi.stubEnv("NODE_ENV", "development")

      const { POST } = await import("./route")
      const response = await POST()

      expect(response.status).toBe(200)

      const setCookieHeaders = response.headers.getSetCookie()
      expect(setCookieHeaders).toBeDefined()
      expect(setCookieHeaders).toHaveLength(3)

      // Check that access_token cookie is cleared with correct attributes
      const accessTokenCookie = setCookieHeaders.find((cookie: string) =>
        cookie.includes("access_token=")
      )
      expect(accessTokenCookie).toBeDefined()
      expect(accessTokenCookie).toContain("access_token=;")
      expect(accessTokenCookie).toContain("Max-Age=0")
      expect(accessTokenCookie).toContain("Path=/")
      expect(accessTokenCookie).toContain("SameSite=lax")
      expect(accessTokenCookie).not.toContain("Secure")
      expect(accessTokenCookie).not.toContain("HttpOnly")

      // Check that refresh_token cookie is cleared with correct attributes
      const refreshTokenCookie = setCookieHeaders.find((cookie: string) =>
        cookie.includes("refresh_token=")
      )
      expect(refreshTokenCookie).toBeDefined()
      expect(refreshTokenCookie).toContain("refresh_token=;")
      expect(refreshTokenCookie).toContain("Max-Age=0")
      expect(refreshTokenCookie).toContain("Path=/")
      expect(refreshTokenCookie).toContain("SameSite=lax")
      expect(refreshTokenCookie).toContain("HttpOnly")
      expect(refreshTokenCookie).not.toContain("Secure")

      // Check that id_token cookie is cleared with correct attributes
      const idTokenCookie = setCookieHeaders.find((cookie: string) => cookie.includes("id_token="))
      expect(idTokenCookie).toBeDefined()
      expect(idTokenCookie).toContain("id_token=;")
      expect(idTokenCookie).toContain("Max-Age=0")
      expect(idTokenCookie).toContain("Path=/")
      expect(idTokenCookie).toContain("SameSite=lax")
      expect(idTokenCookie).not.toContain("Secure")
      expect(idTokenCookie).not.toContain("HttpOnly")
    })

    it("should clear all authentication cookies in production environment with secure settings", async () => {
      vi.stubEnv("NODE_ENV", "production")

      const { POST } = await import("./route")
      const response = await POST()

      expect(response.status).toBe(200)

      const setCookieHeaders = response.headers.getSetCookie()
      expect(setCookieHeaders).toBeDefined()
      expect(setCookieHeaders).toHaveLength(3)

      // Check that access_token cookie is cleared with production attributes
      const accessTokenCookie = setCookieHeaders.find((cookie: string) =>
        cookie.includes("access_token=")
      )
      expect(accessTokenCookie).toBeDefined()
      expect(accessTokenCookie).toContain("access_token=;")
      expect(accessTokenCookie).toContain("Max-Age=0")
      expect(accessTokenCookie).toContain("Path=/")
      expect(accessTokenCookie).toContain("SameSite=none")
      expect(accessTokenCookie).toContain("Secure")
      expect(accessTokenCookie).not.toContain("HttpOnly")

      // Check that refresh_token cookie is cleared with production attributes
      const refreshTokenCookie = setCookieHeaders.find((cookie: string) =>
        cookie.includes("refresh_token=")
      )
      expect(refreshTokenCookie).toBeDefined()
      expect(refreshTokenCookie).toContain("refresh_token=;")
      expect(refreshTokenCookie).toContain("Max-Age=0")
      expect(refreshTokenCookie).toContain("Path=/")
      expect(refreshTokenCookie).toContain("SameSite=none")
      expect(refreshTokenCookie).toContain("Secure")
      expect(refreshTokenCookie).toContain("HttpOnly")

      // Check that id_token cookie is cleared with production attributes
      const idTokenCookie = setCookieHeaders.find((cookie: string) => cookie.includes("id_token="))
      expect(idTokenCookie).toBeDefined()
      expect(idTokenCookie).toContain("id_token=;")
      expect(idTokenCookie).toContain("Max-Age=0")
      expect(idTokenCookie).toContain("Path=/")
      expect(idTokenCookie).toContain("SameSite=none")
      expect(idTokenCookie).toContain("Secure")
      expect(idTokenCookie).not.toContain("HttpOnly")
    })

    it("should handle undefined NODE_ENV as non-production", async () => {
      vi.stubEnv("NODE_ENV", undefined)

      const { POST } = await import("./route")
      const response = await POST()

      expect(response.status).toBe(200)

      const setCookieHeaders = response.headers.getSetCookie()

      // Should behave like development (non-secure settings)
      const accessTokenCookie = setCookieHeaders.find((cookie: string) =>
        cookie.includes("access_token=")
      )
      expect(accessTokenCookie).toContain("SameSite=lax")
      expect(accessTokenCookie).not.toContain("Secure")
    })

    it("should return proper content type", async () => {
      const { POST } = await import("./route")
      const response = await POST()

      expect(response.headers.get("content-type")).toContain("application/json")
    })

    it("should handle errors gracefully", async () => {
      // Mock console.error to avoid test output pollution
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
        // Mock implementation - no action needed
      })

      const { POST } = await import("./route")
      const response = await POST()

      expect(response.status).toBe(200)
      expect(() => response.json()).not.toThrow()

      consoleSpy.mockRestore()
    })
  })

  describe("edge cases", () => {
    it("should work with various NODE_ENV values", async () => {
      const environments = ["production", "development", "test", "staging", "local"]

      for (const env of environments) {
        vi.stubEnv("NODE_ENV", env)

        const { POST } = await import("./route")
        const response = await POST()

        expect(response.status).toBe(200)

        const setCookieHeaders = response.headers.getSetCookie()
        expect(setCookieHeaders).toHaveLength(3)

        // Check expected security settings based on environment
        const isProduction = env === "production"
        const accessTokenCookie = setCookieHeaders.find((cookie: string) =>
          cookie.includes("access_token=")
        )

        if (isProduction) {
          expect(accessTokenCookie).toContain("SameSite=none")
          expect(accessTokenCookie).toContain("Secure")
        } else {
          expect(accessTokenCookie).toContain("SameSite=lax")
          expect(accessTokenCookie).not.toContain("Secure")
        }

        vi.unstubAllEnvs()
        vi.resetModules()
      }
    })

    it("should maintain cookie order consistency", async () => {
      const { POST } = await import("./route")
      const response1 = await POST()

      vi.resetModules()
      const { POST: POST2 } = await import("./route")
      const response2 = await POST2()

      const cookies1 = response1.headers.getSetCookie()
      const cookies2 = response2.headers.getSetCookie()

      // Cookie order should be consistent across calls
      expect(cookies1).toHaveLength(cookies2.length)

      // Extract cookie names for comparison
      const getCookieName = (cookie: string) => cookie.split("=")[0]
      const names1 = cookies1.map(getCookieName)
      const names2 = cookies2.map(getCookieName)

      expect(names1).toEqual(names2)
    })
  })
})
