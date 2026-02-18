import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { TextField } from "./TextField"

describe("TextField", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders label and input with provided value and placeholder", () => {
    const onChange = vi.fn()
    render(
      <TextField id="tf1" label="Name" value="Alice" onChange={onChange} placeholder="Enter name" />
    )

    const input = screen.getByLabelText(/Name/) as HTMLInputElement
    expect(input).toBeInTheDocument()
    expect(input.placeholder).toBe("Enter name")
    expect(input.value).toBe("Alice")
  })

  it("calls onChange with typed value", async () => {
    const onChange = vi.fn()

    // Wrapper to simulate controlled component behavior
    const TestWrapper = () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [value, setValue] = require("react").useState("")
      const handleChange = (v: string) => {
        onChange(v)
        setValue(v)
      }
      return <TextField id="tf2" label="First" value={value} onChange={handleChange} />
    }

    render(<TestWrapper />)

    const input = screen.getByLabelText(/First/) as HTMLInputElement
    await userEvent.type(input, "Bob")

    expect(onChange).toHaveBeenCalled()
    expect(onChange).toHaveBeenLastCalledWith("Bob")
  })

  it("respects the type prop", () => {
    const onChange = vi.fn()
    render(<TextField id="tf3" label="Secret" value="" onChange={onChange} type="password" />)

    const input = screen.getByLabelText(/Secret/) as HTMLInputElement
    expect(input.type).toBe("password")
  })

  it("does not call onChange when disabled", async () => {
    const onChange = vi.fn()
    render(<TextField id="tf4" label="Disabled" value="" onChange={onChange} disabled={true} />)

    const input = screen.getByLabelText(/Disabled/) as HTMLInputElement
    expect(input).toBeDisabled()

    await userEvent.type(input, "X")
    expect(onChange).not.toHaveBeenCalled()
  })

  it("applies minLength and maxLength attributes when provided", () => {
    const onChange = vi.fn()
    render(
      <TextField
        id="tf5"
        label="Constrained"
        value=""
        onChange={onChange}
        minLength={2}
        maxLength={5}
      />
    )

    const input = screen.getByLabelText(/Constrained/) as HTMLInputElement
    expect(input).toHaveAttribute("minlength", "2")
    expect(input).toHaveAttribute("maxlength", "5")
    const lengthIndicator = screen.getByTestId("length-indicator")
    expect(lengthIndicator).toHaveTextContent("0/5")
    expect(lengthIndicator.className).toContain("text-red-600")
    expect(lengthIndicator).toHaveAttribute("title", "min 2 characters")
  })

  it("shows min indicator as normal when min reached", () => {
    const onChange = vi.fn()
    render(
      <TextField
        id="tf6"
        label="Constrained2"
        value={"abcd"}
        onChange={onChange}
        minLength={2}
        maxLength={5}
      />
    )

    const lengthIndicator = screen.getByTestId("length-indicator")
    expect(lengthIndicator).toHaveTextContent("4/5")
    expect(lengthIndicator.className).not.toContain("text-red-600")
    expect(lengthIndicator).not.toHaveAttribute("title")
  })

  it("renders a red asterisk when required prop is true", () => {
    const onChange = vi.fn()
    render(<TextField id="tf7" label="Req" value="" onChange={onChange} required={true} />)

    const label = document.querySelector('label[for="tf7"]')
    expect(label).toBeTruthy()
    const asterisk = label?.querySelector("span.ml-1") || label?.querySelector("span")
    expect(asterisk).toBeTruthy()
    expect(asterisk?.textContent).toBe("*")
    expect(asterisk?.className).toContain("text-red-600")
  })
})
