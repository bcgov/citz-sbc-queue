import { render } from "@testing-library/react"
import { act } from "react-dom/test-utils"
import { beforeEach, describe, expect, it, vi } from "vitest"
import * as hooks from "@/hooks"
// Note: we avoid importing UseAuthReturn directly to ensure mocks use the runtime
// return type. If you need the type elsewhere, import it explicitly.
import { useAuthStore } from "@/stores/auth/store"
import { IsAuthenticated } from "./IsAuthenticated"

describe("IsAuthenticated component", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders children when user is authenticated and no role required", () => {
    vi.spyOn(hooks, "useAuth").mockReturnValue({
      isAuthenticated: true,
      hasRole: (_role: string) => false,
    } as unknown as ReturnType<typeof hooks.useAuth>)

    const { getByText } = render(
      <IsAuthenticated>
        <div>protected</div>
      </IsAuthenticated>
    )

    expect(getByText("protected")).toBeTruthy()
  })

  it("does not render children when user is not authenticated and no role required", () => {
    vi.spyOn(hooks, "useAuth").mockReturnValue({
      isAuthenticated: false,
      hasRole: (_role: string) => false,
    } as unknown as ReturnType<typeof hooks.useAuth>)

    const { queryByText } = render(
      <IsAuthenticated>
        <div>protected</div>
      </IsAuthenticated>
    )

    expect(queryByText("protected")).toBeNull()
  })

  it("renders children when user has required role", () => {
    vi.spyOn(hooks, "useAuth").mockReturnValue({
      isAuthenticated: true,
      hasRole: (role: string) => role === "admin",
    } as unknown as ReturnType<typeof hooks.useAuth>)

    const { getByText } = render(
      <IsAuthenticated hasRole="admin">
        <div>admin-only</div>
      </IsAuthenticated>
    )

    expect(getByText("admin-only")).toBeTruthy()
  })

  it("does not render children when user lacks required role", () => {
    vi.spyOn(hooks, "useAuth").mockReturnValue({
      isAuthenticated: true,
      hasRole: (_role: string) => false,
    } as unknown as ReturnType<typeof hooks.useAuth>)

    const { queryByText } = render(
      <IsAuthenticated hasRole="admin">
        <div>admin-only</div>
      </IsAuthenticated>
    )

    expect(queryByText("admin-only")).toBeNull()
  })

  it("reacts to store updates and renders children when session is set", () => {
    // Start with no session
    act(() => {
      useAuthStore.setState({ session: null })
    })

    const { queryByText } = render(
      <IsAuthenticated>
        <div>reactive</div>
      </IsAuthenticated>
    )

    expect(queryByText("reactive")).toBeNull()

    // Create a simple JWT payload and set session
    const payload = {
      sub: "1",
      iat: 1,
      exp: 9999999999,
      identity_provider: "idir",
      auth_time: 1,
      jti: "j",
      iss: "i",
      aud: "a",
      typ: "Bearer",
      azp: "azp",
      nonce: "n",
      session_state: "s",
      sid: "sid",
      email_verified: true,
      preferred_username: "u",
    }
    const header = { alg: "none", typ: "JWT" }
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url")
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url")
    const jwt = `${encodedHeader}.${encodedPayload}.sig`

    act(() => {
      useAuthStore.setState({
        session: {
          accessToken: jwt,
          accessExpiresAt: Date.now() + 10000,
          refreshExpiresAt: Date.now() + 20000,
          sessionEndsAt: Date.now() + 30000,
        },
      })
    })

    expect(queryByText("reactive")).toBeTruthy()
  })
})
