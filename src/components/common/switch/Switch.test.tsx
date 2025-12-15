import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { Switch } from "./Switch"

describe("Switch", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render a button element", () => {
    const mockOnChange = vi.fn()
    render(<Switch checked={false} onChange={mockOnChange} />)

    const button = screen.getByRole("button")
    expect(button).toBeTruthy()
  })

  it("should have aria-pressed attribute set to false when unchecked", () => {
    const mockOnChange = vi.fn()
    render(<Switch checked={false} onChange={mockOnChange} />)

    const button = screen.getByRole("button")
    expect(button).toHaveAttribute("aria-pressed", "false")
  })

  it("should have aria-pressed attribute set to true when checked", () => {
    const mockOnChange = vi.fn()
    render(<Switch checked={true} onChange={mockOnChange} />)

    const button = screen.getByRole("button")
    expect(button).toHaveAttribute("aria-pressed", "true")
  })

  it("should call onChange with true when clicked while unchecked", async () => {
    const mockOnChange = vi.fn()
    render(<Switch checked={false} onChange={mockOnChange} />)

    const button = screen.getByRole("button")
    await userEvent.click(button)

    expect(mockOnChange).toHaveBeenCalledWith(true)
    expect(mockOnChange).toHaveBeenCalledOnce()
  })

  it("should call onChange with false when clicked while checked", async () => {
    const mockOnChange = vi.fn()
    render(<Switch checked={true} onChange={mockOnChange} />)

    const button = screen.getByRole("button")
    await userEvent.click(button)

    expect(mockOnChange).toHaveBeenCalledWith(false)
    expect(mockOnChange).toHaveBeenCalledOnce()
  })

  it("should not call onChange when disabled and clicked", async () => {
    const mockOnChange = vi.fn()
    render(<Switch checked={false} onChange={mockOnChange} disabled={true} />)

    const button = screen.getByRole("button")
    await userEvent.click(button)

    expect(mockOnChange).not.toHaveBeenCalled()
  })

  it("should have disabled attribute when disabled prop is true", () => {
    const mockOnChange = vi.fn()
    render(<Switch checked={false} onChange={mockOnChange} disabled={true} />)

    const button = screen.getByRole("button")
    expect(button).toHaveAttribute("disabled")
  })

  it("should not have disabled attribute when disabled prop is false", () => {
    const mockOnChange = vi.fn()
    render(<Switch checked={false} onChange={mockOnChange} disabled={false} />)

    const button = screen.getByRole("button")
    expect(button).not.toHaveAttribute("disabled")
  })

  it("should apply custom className", () => {
    const mockOnChange = vi.fn()
    const customClass = "my-custom-class"
    render(<Switch checked={false} onChange={mockOnChange} className={customClass} />)

    const button = screen.getByRole("button")
    expect(button).toHaveClass(customClass)
  })

  it("should apply disabled styles when disabled", () => {
    const mockOnChange = vi.fn()
    render(<Switch checked={false} onChange={mockOnChange} disabled={true} />)

    const button = screen.getByRole("button")
    expect(button.className).toContain("opacity-50")
    expect(button.className).toContain("cursor-not-allowed")
  })

  it("should apply cursor-pointer class when enabled", () => {
    const mockOnChange = vi.fn()
    render(<Switch checked={false} onChange={mockOnChange} disabled={false} />)

    const button = screen.getByRole("button")
    expect(button.className).toContain("cursor-pointer")
  })

  it("should toggle state when clicked multiple times", async () => {
    const mockOnChange = vi.fn()
    const { rerender } = render(<Switch checked={false} onChange={mockOnChange} />)

    const button = screen.getByRole("button")

    await userEvent.click(button)
    expect(mockOnChange).toHaveBeenNthCalledWith(1, true)

    rerender(<Switch checked={true} onChange={mockOnChange} />)

    await userEvent.click(button)
    expect(mockOnChange).toHaveBeenNthCalledWith(2, false)

    expect(mockOnChange).toHaveBeenCalledTimes(2)
  })

  it("should have blue background when checked", () => {
    const mockOnChange = vi.fn()
    render(<Switch checked={true} onChange={mockOnChange} />)

    const button = screen.getByRole("button")
    const track = button.querySelector("span")
    expect(track?.className).toContain("bg-background-dark-blue")
  })

  it("should have gray background when unchecked", () => {
    const mockOnChange = vi.fn()
    render(<Switch checked={false} onChange={mockOnChange} />)

    const button = screen.getByRole("button")
    const track = button.querySelector("span")
    expect(track?.className).toContain("bg-background-light-gray")
  })

  it("should update track color when checked prop changes", () => {
    const mockOnChange = vi.fn()
    const { rerender } = render(<Switch checked={false} onChange={mockOnChange} />)

    let button = screen.getByRole("button")
    let track = button.querySelector("span")
    expect(track?.className).toContain("bg-background-light-gray")

    rerender(<Switch checked={true} onChange={mockOnChange} />)

    button = screen.getByRole("button")
    track = button.querySelector("span")
    expect(track?.className).toContain("bg-background-dark-blue")
  })

  it("should translate circle when checked", () => {
    const mockOnChange = vi.fn()
    render(<Switch checked={true} onChange={mockOnChange} />)

    const button = screen.getByRole("button")
    const track = button.querySelector("span")
    const circle = track?.querySelector("span")
    expect(circle?.className).toContain("translate-x-5.5")
  })

  it("should translate circle when unchecked", () => {
    const mockOnChange = vi.fn()
    render(<Switch checked={false} onChange={mockOnChange} />)

    const button = screen.getByRole("button")
    const track = button.querySelector("span")
    const circle = track?.querySelector("span")
    expect(circle?.className).toContain("translate-x-1")
  })

  it("should handle keyboard interaction", async () => {
    const mockOnChange = vi.fn()
    render(<Switch checked={false} onChange={mockOnChange} />)

    const button = screen.getByRole("button")

    // Simulate spacebar press
    button.focus()
    await userEvent.keyboard(" ")

    expect(mockOnChange).toHaveBeenCalledWith(true)
  })

  it("should not respond to keyboard when disabled", async () => {
    const mockOnChange = vi.fn()
    render(<Switch checked={false} onChange={mockOnChange} disabled={true} />)

    const button = screen.getByRole("button")
    button.focus()

    // Try to toggle with keyboard
    await userEvent.keyboard(" ")

    expect(mockOnChange).not.toHaveBeenCalled()
  })
})
