import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import Header from "./Header"

vi.mock("@/hooks", () => ({
  useAuth: () => ({ isAuthenticated: false, hasRole: () => false }),
}))

describe("Header", () => {
  it("shows login when not authenticated", () => {
    render(<Header />)
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /logout/i })).toBeNull()
  })

  it("shows logout when authenticated", () => {
    // Update mock to simulate authenticated user
    vi.mocked(require("@/hooks")).useAuth = () => ({ isAuthenticated: true, hasRole: () => false })
    render(<Header />)
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /login/i })).toBeNull()
  })
})
