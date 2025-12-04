import { render } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import * as hooks from "@/hooks"
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

  it("reacts to hook updates and renders children when isAuthenticated is set", () => {
    // Start with no authentication
    const mockUseAuth = vi.spyOn(hooks, "useAuth").mockReturnValue({
      isAuthenticated: false,
      hasRole: (_role: string) => false,
    } as unknown as ReturnType<typeof hooks.useAuth>)

    const { queryByText, rerender } = render(
      <IsAuthenticated>
        <div>reactive</div>
      </IsAuthenticated>
    )

    expect(queryByText("reactive")).toBeNull()

    // Update the mock to simulate store change
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      hasRole: (_role: string) => false,
    } as unknown as ReturnType<typeof hooks.useAuth>)

    // Force re-render to pick up new mock state
    rerender(
      <IsAuthenticated>
        <div>reactive</div>
      </IsAuthenticated>
    )

    expect(queryByText("reactive")).toBeTruthy()
  })
})
