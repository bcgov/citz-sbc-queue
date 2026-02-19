import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { TextArea } from "./TextArea"

describe("TextArea", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders label and textarea with provided value and placeholder", () => {
    const onChange = vi.fn()
    render(
      <TextArea id="ta1" label="Bio" value="Hello" onChange={onChange} placeholder="Enter bio" />
    )

    const textarea = screen.getByLabelText(/Bio/) as HTMLTextAreaElement
    expect(textarea).toBeInTheDocument()
    expect(textarea.placeholder).toBe("Enter bio")
    expect(textarea.value).toBe("Hello")
  })

  it("calls onChange with typed value", async () => {
    const onChange = vi.fn()

    const TestWrapper = () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [value, setValue] = require("react").useState("")
      const handleChange = (v: string) => {
        onChange(v)
        setValue(v)
      }
      return <TextArea id="ta2" label="About" value={value} onChange={handleChange} />
    }

    render(<TestWrapper />)

    const textarea = screen.getByLabelText(/About/) as HTMLTextAreaElement
    await userEvent.type(textarea, "Hello")

    expect(onChange).toHaveBeenCalled()
    expect(onChange).toHaveBeenLastCalledWith("Hello")
  })

  it("does not call onChange when disabled", async () => {
    const onChange = vi.fn()
    render(<TextArea id="ta3" label="Disabled" value="" onChange={onChange} disabled={true} />)

    const textarea = screen.getByLabelText(/Disabled/) as HTMLTextAreaElement
    expect(textarea).toBeDisabled()

    await userEvent.type(textarea, "X")
    expect(onChange).not.toHaveBeenCalled()
  })

  it("applies minLength and maxLength attributes when provided", () => {
    const onChange = vi.fn()
    render(
      <TextArea
        id="ta4"
        label="Constrained"
        value=""
        onChange={onChange}
        minLength={2}
        maxLength={5}
      />
    )

    const textarea = screen.getByLabelText(/Constrained/) as HTMLTextAreaElement
    expect(textarea).toHaveAttribute("minlength", "2")
    expect(textarea).toHaveAttribute("maxlength", "5")
    const lengthIndicator = screen.getByTestId("length-indicator")
    expect(lengthIndicator).toHaveTextContent("0/5")
    expect(lengthIndicator.className).toContain("text-red-600")
    expect(lengthIndicator).toHaveAttribute("title", "min 2 characters")
  })

  it("shows min indicator as normal when min reached", () => {
    const onChange = vi.fn()
    render(
      <TextArea
        id="ta5"
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
    render(<TextArea id="ta6" label="Req" value="" onChange={onChange} required={true} />)

    const label = document.querySelector('label[for="ta6"]')
    expect(label).toBeTruthy()
    const asterisk = label?.querySelector("span.ml-1") || label?.querySelector("span")
    expect(asterisk).toBeTruthy()
    expect(asterisk?.textContent).toBe("*")
    expect(asterisk?.className).toContain("text-red-600")
  })
})
