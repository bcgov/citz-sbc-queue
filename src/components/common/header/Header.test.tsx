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
})
