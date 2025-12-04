import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import * as hooks from "@/hooks"
import Navigation from "./Navigation"

describe("Navigation", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  beforeEach(() => {
    // Default: authenticated user with no special roles
    vi.spyOn(hooks, "useAuth").mockReturnValue({
      isAuthenticated: true,
      hasRole: () => false,
    } as unknown as ReturnType<typeof hooks.useAuth>)
  })

  it("renders all navigation items", () => {
    render(<Navigation currentPath="/appointments" />)

    // Home and the standard links (Administration requires role and should be hidden by default)
    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(screen.getByText("Appointment Booking")).toBeInTheDocument()
    expect(screen.getByText("Queue")).toBeInTheDocument()
    expect(screen.getByText("Room Bookings")).toBeInTheDocument()
    expect(screen.getByText("Appointments")).toBeInTheDocument()
    expect(screen.getByText("Exam Inventory")).toBeInTheDocument()
    expect(screen.queryByText("Administration")).toBeNull()
  })

  it("marks the current page as active", () => {
    render(<Navigation currentPath="/queue" />)

    const queueLink = screen.getByRole("link", { name: "Queue" })
    expect(queueLink).toHaveAttribute("aria-current", "page")
  })

  it("does not mark other pages as active", () => {
    render(<Navigation currentPath="/appointments" />)

    const queueLink = screen.getByRole("link", { name: "Queue" })
    expect(queueLink).not.toHaveAttribute("aria-current")
  })

  it("marks nested routes as active", () => {
    render(<Navigation currentPath="/appointments/123" />)

    const appointmentLink = screen.getByRole("link", {
      name: "Appointment Booking",
    })
    expect(appointmentLink).toHaveAttribute("aria-current", "page")
  })

  it("renders all links with correct href attributes", () => {
    render(<Navigation currentPath="/" />)
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/")
    expect(screen.getByRole("link", { name: "Appointment Booking" })).toHaveAttribute(
      "href",
      "/appointments"
    )
    expect(screen.getByRole("link", { name: "Queue" })).toHaveAttribute("href", "/queue")
    expect(screen.getByRole("link", { name: "Room Bookings" })).toHaveAttribute(
      "href",
      "/room-bookings"
    )
    expect(screen.getByRole("link", { name: "Appointments" })).toHaveAttribute(
      "href",
      "/appointments-list"
    )
    expect(screen.getByRole("link", { name: "Exam Inventory" })).toHaveAttribute(
      "href",
      "/exam-inventory"
    )
    // Administration link is role-protected; not present by default
    expect(screen.queryByRole("link", { name: "Administration" })).toBeNull()
  })

  it("shows administration when user has Administrator role", () => {
    vi.spyOn(hooks, "useAuth").mockReturnValue({
      isAuthenticated: true,
      hasRole: (r: string) => r === "Administrator",
    } as unknown as ReturnType<typeof hooks.useAuth>)

    render(<Navigation currentPath="/administration" />)

    const adminLink = screen.getByRole("link", { name: "Administration" })
    expect(adminLink).toBeInTheDocument()
    expect(adminLink).toHaveAttribute("href", "/administration")
  })

  it("hides links when not authenticated", () => {
    vi.spyOn(hooks, "useAuth").mockReturnValue({
      isAuthenticated: false,
      hasRole: () => false,
    } as unknown as ReturnType<typeof hooks.useAuth>)

    render(<Navigation currentPath="/" />)

    expect(screen.queryByText("Appointment Booking")).toBeNull()
    expect(screen.queryByText("Queue")).toBeNull()
  })

  it("shows links when authenticated and no role required", () => {
    vi.spyOn(hooks, "useAuth").mockReturnValue({
      isAuthenticated: true,
      hasRole: () => false,
    } as unknown as ReturnType<typeof hooks.useAuth>)

    render(<Navigation currentPath="/" />)

    expect(screen.getByText("Appointment Booking")).toBeInTheDocument()
    expect(screen.getByText("Queue")).toBeInTheDocument()
  })
})
