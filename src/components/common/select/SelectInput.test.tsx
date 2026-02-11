import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { SelectInput } from "./SelectInput"

describe("SelectInput", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the label and select element", () => {
    const mockOnChange = vi.fn()
    const options = [
      { value: "1", label: "One" },
      { value: "2", label: "Two" },
    ]

    render(
      <SelectInput
        id="test"
        label="Test Label"
        value="1"
        onChange={mockOnChange}
        disabled={false}
        options={options}
      />
    )

    const select = screen.getByLabelText("Test Label")
    expect(select).toBeInTheDocument()
    expect((select as HTMLSelectElement).value).toBe("1")
  })

  it("renders the provided options", () => {
    const mockOnChange = vi.fn()
    const options = [
      { value: "1", label: "One" },
      { value: "2", label: "Two" },
    ]

    render(
      <SelectInput
        id="test2"
        label="Options Label"
        value={undefined}
        onChange={mockOnChange}
        disabled={false}
        options={options}
      />
    )

    const select = screen.getByLabelText("Options Label") as HTMLSelectElement
    const rendered = Array.from(select.querySelectorAll("option")).map((o) => o.textContent)
    expect(rendered).toEqual(["One", "Two"])
  })

  it("calls onChange with the selected value", async () => {
    const mockOnChange = vi.fn()
    const options = [
      { value: "1", label: "One" },
      { value: "2", label: "Two" },
    ]

    render(
      <SelectInput
        id="test3"
        label="Change Label"
        value="1"
        onChange={mockOnChange}
        disabled={false}
        options={options}
      />
    )

    const select = screen.getByLabelText("Change Label") as HTMLSelectElement
    await userEvent.selectOptions(select, "2")

    expect(mockOnChange).toHaveBeenCalledWith("2")
    expect(mockOnChange).toHaveBeenCalledOnce()
  })

  it("does not call onChange when disabled", async () => {
    const mockOnChange = vi.fn()
    const options = [
      { value: "1", label: "One" },
      { value: "2", label: "Two" },
    ]

    render(
      <SelectInput
        id="test4"
        label="Disabled Label"
        value="1"
        onChange={mockOnChange}
        disabled={true}
        options={options}
      />
    )

    const select = screen.getByLabelText("Disabled Label") as HTMLSelectElement
    expect(select).toBeDisabled()

    await userEvent.selectOptions(select, "2")
    expect(mockOnChange).not.toHaveBeenCalled()
  })
})
