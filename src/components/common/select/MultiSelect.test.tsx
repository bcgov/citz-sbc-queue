import "@testing-library/jest-dom"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MultiSelect } from "./MultiSelect"

const options = Array.from({ length: 6 }).map((_, i) => ({
  key: `option-${i + 1}`,
  label: `Option ${i + 1}`,
}))

function Wrapper(props: { initial?: string[] }) {
  const [selected, setSelected] = useState<string[]>(props.initial ?? [])
  return (
    <MultiSelect
      id="test-multi"
      options={options}
      selected={selected}
      onChange={setSelected}
      placeholder="Search options"
    />
  )
}

describe("MultiSelect", () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.clearAllTimers())

  it("shows the options when input is focused", async () => {
    render(<Wrapper />)
    const input = screen.getByRole("combobox", { name: /search options/i })
    await userEvent.click(input)

    const list = screen.getByRole("listbox")
    expect(list).toBeVisible()
    const opts = within(list).getAllByRole("option")
    expect(opts.length).toBeGreaterThan(0)
  })

  it("filters options when typing", async () => {
    render(<Wrapper />)
    const input = screen.getByRole("combobox", { name: /search options/i })
    await userEvent.click(input)
    await userEvent.type(input, "Option 2")

    const list = screen.getByRole("listbox")
    const opts = within(list).queryAllByRole("option")
    expect(opts.some((o) => o.textContent === "Option 2")).toBeTruthy()
    expect(opts.some((o) => o.textContent === "Option 1")).toBeFalsy()
  })

  it("selects an option via click and shows it in the selected list", async () => {
    render(<Wrapper />)
    const input = screen.getByRole("combobox", { name: /search options/i })
    await userEvent.click(input)

    const list = screen.getByRole("listbox")
    const opt = within(list).getByText("Option 3")
    await userEvent.click(opt)

    // selected pill should appear
    const pill = screen.getByText("Option 3")
    expect(pill).toBeVisible()

    // the option should no longer appear in the dropdown
    await userEvent.click(input)
    const opts = within(screen.getByRole("listbox")).queryAllByRole("option")
    expect(opts.some((o) => o.textContent === "Option 3")).toBeFalsy()
  })

  it("removes a selected option when the remove button is clicked", async () => {
    render(<Wrapper initial={["option-4"]} />)
    // remove button has accessible label
    const remove = screen.getByLabelText("Remove Option 4")
    expect(remove).toBeVisible()
    await userEvent.click(remove)
    // the selected pill (and its remove button) should be gone
    await waitFor(() => expect(screen.queryByLabelText("Remove Option 4")).toBeNull())
  })

  it("allows keyboard selection with ArrowDown + Enter", async () => {
    render(<Wrapper />)
    const input = screen.getByRole("combobox", { name: /search options/i })
    await userEvent.click(input)
    await userEvent.type(input, "Option 5")

    // ArrowDown should focus first option, Enter selects it
    await userEvent.keyboard("{ArrowDown}")
    await userEvent.keyboard("{Enter}")

    expect(screen.getByText("Option 5")).toBeVisible()
  })
})
