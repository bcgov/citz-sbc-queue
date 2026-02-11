import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CheckboxInput } from "./CheckboxInput"

describe("CheckboxInput", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the label and checkbox", () => {
    const mockOnChange = vi.fn()
    render(
      <CheckboxInput
        id="chk1"
        label="Agree"
        checked={false}
        onChange={mockOnChange}
        disabled={false}
      />
    )

    const checkbox = screen.getByLabelText("Agree") as HTMLInputElement
    expect(checkbox).toBeInTheDocument()
    expect(checkbox.type).toBe("checkbox")
    expect(checkbox.checked).toBe(false)
  })

  it("reflects checked prop", () => {
    const mockOnChange = vi.fn()
    render(
      <CheckboxInput
        id="chk2"
        label="Checked"
        checked={true}
        onChange={mockOnChange}
        disabled={false}
      />
    )

    const checkbox = screen.getByLabelText("Checked") as HTMLInputElement
    expect(checkbox.checked).toBe(true)
  })

  it("calls onChange with new checked value when clicked", async () => {
    const mockOnChange = vi.fn()
    render(
      <CheckboxInput
        id="chk3"
        label="ClickMe"
        checked={false}
        onChange={mockOnChange}
        disabled={false}
      />
    )

    const checkbox = screen.getByLabelText("ClickMe") as HTMLInputElement
    await userEvent.click(checkbox)

    expect(mockOnChange).toHaveBeenCalledWith(true)
    expect(mockOnChange).toHaveBeenCalledOnce()
  })

  it("does not call onChange when disabled", async () => {
    const mockOnChange = vi.fn()
    render(
      <CheckboxInput
        id="chk4"
        label="Disabled"
        checked={false}
        onChange={mockOnChange}
        disabled={true}
      />
    )

    const checkbox = screen.getByLabelText("Disabled") as HTMLInputElement
    expect(checkbox).toBeDisabled()

    await userEvent.click(checkbox)
    expect(mockOnChange).not.toHaveBeenCalled()
  })
})
