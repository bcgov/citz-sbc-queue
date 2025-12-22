import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import * as hooks from "@/hooks"
import Header from "./Header"

describe("Header", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("shows login when not authenticated", () => {
    vi.spyOn(hooks, "useAuth").mockReturnValue({
      isAuthenticated: false,
      hasRole: () => false,
    } as unknown as ReturnType<typeof hooks.useAuth>)
    render(<Header />)
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /logout/i })).toBeNull()
  })

  it("shows logout when authenticated", () => {
    vi.spyOn(hooks, "useAuth").mockReturnValue({
      isAuthenticated: true,
      hasRole: () => false,
    } as unknown as ReturnType<typeof hooks.useAuth>)
    render(<Header />)
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /login/i })).toBeNull()
  })

  it("shows hamburger icon button when in mobile", () => {
    window.innerWidth = 639
    window.dispatchEvent(new Event("resize"))
    render(<Header />)
    expect(screen.getByRole("button", { name: /show navigation items/i })).toBeInTheDocument()
  })

  it("does not show hamburger icon button when not in mobile", () => {
    // Simulate desktop width
    window.innerWidth = 640
    window.dispatchEvent(new Event("resize"))
    render(<Header />)
    const hamburgerParent = screen.getByTestId("hamburgerNav-parent")
    expect(hamburgerParent.className).toMatch(/md:hidden/)
  })
})
