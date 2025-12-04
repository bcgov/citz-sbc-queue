import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import * as navigation from "next/navigation"
import { afterEach, describe, expect, it, vi } from "vitest"
import Navigation from "./Navigation"

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}))

vi.mock("@/components", async () => {
  const actual = await vi.importActual("@/components")
  return {
    ...actual,
    IsAuthenticated: vi.fn(({ children }) => children),
  }
})

describe("Navigation", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("renders all navigation items", () => {
    vi.spyOn(navigation, "usePathname").mockReturnValue("/appointments")

    render(<Navigation />)

    expect(screen.getByText("Appointment Booking")).toBeInTheDocument()
    expect(screen.getByText("Queue")).toBeInTheDocument()
    expect(screen.getByText("Room Bookings")).toBeInTheDocument()
    expect(screen.getByText("Appointments")).toBeInTheDocument()
    expect(screen.getByText("Exam Inventory")).toBeInTheDocument()
    expect(screen.getByText("Administration")).toBeInTheDocument()
  })

  it("marks the current page as active", () => {
    vi.spyOn(navigation, "usePathname").mockReturnValue("/queue")

    render(<Navigation />)

    const queueLink = screen.getByRole("link", { name: "Queue" })
    expect(queueLink).toHaveAttribute("aria-current", "page")
  })

  it("does not mark other pages as active", () => {
    vi.spyOn(navigation, "usePathname").mockReturnValue("/appointments")

    render(<Navigation />)

    const queueLink = screen.getByRole("link", { name: "Queue" })
    expect(queueLink).not.toHaveAttribute("aria-current")
  })

  it("marks nested routes as active", () => {
    vi.spyOn(navigation, "usePathname").mockReturnValue("/appointments/123")

    render(<Navigation />)

    const appointmentLink = screen.getByRole("link", {
      name: "Appointment Booking",
    })
    expect(appointmentLink).toHaveAttribute("aria-current", "page")
  })

  it("renders all links with correct href attributes", () => {
    vi.spyOn(navigation, "usePathname").mockReturnValue("/")

    render(<Navigation />)

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
    expect(screen.getByRole("link", { name: "Administration" })).toHaveAttribute(
      "href",
      "/administration"
    )
  })
})
