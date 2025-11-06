import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"
import { useAuthStore } from "@/stores/auth/store"
import { useAuth } from "./useAuth"

// Helper to create a simple JWT with base64url encoding using Node Buffer
const createJWT = (payload: Record<string, unknown>) => {
  const header = { alg: "none", typ: "JWT" }
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url")
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signature = "fake-signature"
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

describe("useAuth hook", () => {
  beforeEach(() => {
    // Reset store session between tests
    useAuthStore.setState({ session: null })
  })

  it("returns unauthenticated when no session is set", () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.display_name).toBeUndefined()
    expect(result.current.hasRole("admin")).toBe(false)
  })

  it("returns authenticated info and roles when session is present", () => {
    const payload = {
      exp: 9999999999,
      iat: 1,
      auth_time: 1,
      jti: "jti",
      iss: "iss",
      aud: "aud",
      sub: "sub",
      typ: "Bearer",
      azp: "azp",
      nonce: "nonce",
      session_state: "state",
      sid: "sid",
      identity_provider: "idir",
      email_verified: true,
      preferred_username: "user",
      display_name: "Test User",
      given_name: "Test",
      family_name: "User",
      idir_username: "testuser",
      email: "test@example.com",
      client_roles: ["admin", "user"],
    }

    const jwt = createJWT(payload)

    act(() => {
      useAuthStore.setState({
        session: {
          accessToken: jwt,
          accessExpiresAt: Date.now() + 10000,
          refreshExpiresAt: Date.now() + 20000,
          sessionEndsAt: Date.now() + 3600000,
          idToken: "id",
        },
      })
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.display_name).toBe("Test User")
    expect(result.current.given_name).toBe("Test")
    expect(result.current.family_name).toBe("User")
    expect(result.current.email).toBe("test@example.com")
    expect(result.current.idir_username).toBe("testuser")
    expect(result.current.hasRole("admin")).toBe(true)
    expect(result.current.hasRole("missing-role")).toBe(false)
  })

  it("handles invalid access token gracefully (decoding error)", () => {
    act(() => {
      useAuthStore.setState({
        session: {
          accessToken: "not-a-jwt",
          accessExpiresAt: Date.now() + 10000,
          refreshExpiresAt: Date.now() + 20000,
          sessionEndsAt: Date.now() + 3600000,
        },
      })
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.isAuthenticated).toBe(true)
    // decoded token should be undefined so user fields are undefined
    expect(result.current.display_name).toBeUndefined()
    expect(result.current.hasRole("admin")).toBe(false)
  })
})
