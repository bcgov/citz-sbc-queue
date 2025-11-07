import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import Header from "./Header"

describe("Header", () => {
  it("renders the BC logo and auth buttons", () => {
    render(<Header />)

    // Logo image
    const logo = screen.getByAltText(/BC Government logo/i)
    expect(logo).toBeInTheDocument()

    // Login and Logout buttons are present
    const login = screen.getByRole("button", { name: /login/i })
    const logout = screen.getByRole("button", { name: /logout/i })
    expect(login).toBeInTheDocument()
    expect(logout).toBeInTheDocument()
  })
})
