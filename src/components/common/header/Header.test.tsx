import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
<<<<<<< HEAD
import { afterEach, describe, expect, it, vi } from "vitest"
import * as hooks from "@/hooks"
=======
import { describe, expect, it, vi } from "vitest"
>>>>>>> 458750e (change for auth state and logo size)
import Header from "./Header"

vi.mock("@/hooks", () => ({
  useAuth: () => ({ isAuthenticated: false, hasRole: () => false }),
}))

describe("Header", () => {
<<<<<<< HEAD
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("shows login when not authenticated", () => {
    vi.spyOn(hooks, "useAuth").mockReturnValue({
      isAuthenticated: false,
      hasRole: () => false,
    } as unknown as ReturnType<typeof hooks.useAuth>)
=======
  it("shows login when not authenticated", () => {
>>>>>>> 458750e (change for auth state and logo size)
    render(<Header />)
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /logout/i })).toBeNull()
  })

  it("shows logout when authenticated", () => {
<<<<<<< HEAD
    vi.spyOn(hooks, "useAuth").mockReturnValue({
      isAuthenticated: true,
      hasRole: () => false,
    } as unknown as ReturnType<typeof hooks.useAuth>)
=======
    // Update mock to simulate authenticated user
    vi.mocked(require("@/hooks")).useAuth = () => ({ isAuthenticated: true, hasRole: () => false })
>>>>>>> 458750e (change for auth state and logo size)
    render(<Header />)
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /login/i })).toBeNull()
  })
})
