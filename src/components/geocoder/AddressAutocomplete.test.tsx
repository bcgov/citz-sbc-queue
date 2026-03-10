import "@testing-library/jest-dom"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import * as useGeocodeAutocompleteModule from "@/hooks"
import * as useAuthModule from "@/hooks/useAuth"
import { AddressAutocomplete } from "./AddressAutocomplete"

describe("AddressAutocomplete", () => {
  const mockOnSelect = vi.fn()
  const mockOnChange = vi.fn()

  const mockSuggestions = [
    {
      id: "site-1",
      label: "525 Superior Street, Victoria, BC",
      address: "525 Superior Street, Victoria, BC",
      siteName: "Victoria Office",
      locality: "Victoria",
      province: "BC",
      coordinates: { latitude: 48.4261, longitude: -123.3656 },
    },
    {
      id: "site-2",
      label: "525 Superior Avenue, Victoria, BC",
      address: "525 Superior Avenue, Victoria, BC",
      locality: "Victoria",
      province: "BC",
      coordinates: { latitude: 48.426, longitude: -123.365 },
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnSelect.mockClear()
    mockOnChange.mockClear()

    // Mock useAuth hook
    vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
      authorizationHeader: "Bearer test-token",
      user: null,
      role: null,
      isAuthenticated: true,
      logout: vi.fn(),
      // biome-ignore lint/suspicious/noExplicitAny: <>
    } as any)
  })

  it("renders input with label", () => {
    vi.spyOn(useGeocodeAutocompleteModule, "useGeocodeAutocomplete").mockReturnValue({
      suggestions: [],
      loading: false,
      error: null,
      search: vi.fn(),
      clear: vi.fn(),
    })

    render(
      <AddressAutocomplete id="address-input" label="Address" value="" onSelect={mockOnSelect} />
    )

    expect(screen.getByLabelText("Address")).toBeInTheDocument()
    expect(screen.getByRole("combobox")).toBeInTheDocument()
  })

  it("shows required asterisk when required prop is true", () => {
    vi.spyOn(useGeocodeAutocompleteModule, "useGeocodeAutocomplete").mockReturnValue({
      suggestions: [],
      loading: false,
      error: null,
      search: vi.fn(),
      clear: vi.fn(),
    })

    render(
      <AddressAutocomplete
        id="address-input"
        label="Address"
        value=""
        onSelect={mockOnSelect}
        required
      />
    )

    expect(screen.getByText("*")).toBeInTheDocument()
  })

  it("calls onChange when input value changes", async () => {
    const mockSearch = vi.fn()
    vi.spyOn(useGeocodeAutocompleteModule, "useGeocodeAutocomplete").mockReturnValue({
      suggestions: [],
      loading: false,
      error: null,
      search: mockSearch,
      clear: vi.fn(),
    })

    render(
      <AddressAutocomplete
        id="address-input"
        label="Address"
        value=""
        onSelect={mockOnSelect}
        onChange={mockOnChange}
      />
    )

    const input = screen.getByRole("combobox")
    await userEvent.type(input, "525")

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(expect.stringContaining("525"))
    })
  })

  it("shows suggestions dropdown when typing", async () => {
    const mockSearch = vi.fn()
    vi.spyOn(useGeocodeAutocompleteModule, "useGeocodeAutocomplete").mockReturnValue({
      suggestions: mockSuggestions,
      loading: false,
      error: null,
      search: mockSearch,
      clear: vi.fn(),
    })

    render(
      <AddressAutocomplete id="address-input" label="Address" value="" onSelect={mockOnSelect} />
    )

    const input = screen.getByRole("combobox")
    await userEvent.type(input, "525")

    await waitFor(() => {
      expect(screen.getByText("525 Superior Street, Victoria, BC")).toBeInTheDocument()
      expect(screen.getByText("525 Superior Avenue, Victoria, BC")).toBeInTheDocument()
    })
  })

  it("calls onSelect when suggestion is clicked", async () => {
    const mockSearch = vi.fn()
    vi.spyOn(useGeocodeAutocompleteModule, "useGeocodeAutocomplete").mockReturnValue({
      suggestions: mockSuggestions,
      loading: false,
      error: null,
      search: mockSearch,
      clear: vi.fn(),
    })

    render(
      <AddressAutocomplete id="address-input" label="Address" value="" onSelect={mockOnSelect} />
    )

    const input = screen.getByRole("combobox")
    await userEvent.type(input, "525")

    await waitFor(() => {
      const firstOption = screen.getByText("525 Superior Street, Victoria, BC")
      fireEvent.click(firstOption)
    })

    expect(mockOnSelect).toHaveBeenCalledWith(mockSuggestions[0])
  })

  it("closes dropdown when suggestion is selected", async () => {
    const mockSearch = vi.fn()
    const mockClear = vi.fn()
    vi.spyOn(useGeocodeAutocompleteModule, "useGeocodeAutocomplete").mockReturnValue({
      suggestions: mockSuggestions,
      loading: false,
      error: null,
      search: mockSearch,
      clear: mockClear,
    })

    render(
      <AddressAutocomplete id="address-input" label="Address" value="" onSelect={mockOnSelect} />
    )

    const input = screen.getByRole("combobox")
    await userEvent.type(input, "525")

    await waitFor(() => {
      const firstOption = screen.getByText("525 Superior Street, Victoria, BC")
      fireEvent.click(firstOption)
    })

    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    })
  })

  it("shows loading spinner while searching", () => {
    vi.spyOn(useGeocodeAutocompleteModule, "useGeocodeAutocomplete").mockReturnValue({
      suggestions: [],
      loading: true,
      error: null,
      search: vi.fn(),
      clear: vi.fn(),
    })

    render(
      <AddressAutocomplete id="address-input" label="Address" value="" onSelect={mockOnSelect} />
    )

    const spinner = screen.getByRole("combobox").parentElement?.querySelector(".animate-spin")
    expect(spinner).toBeInTheDocument()
  })

  it("displays error message", () => {
    vi.spyOn(useGeocodeAutocompleteModule, "useGeocodeAutocomplete").mockReturnValue({
      suggestions: [],
      loading: false,
      error: "Network error",
      search: vi.fn(),
      clear: vi.fn(),
    })

    render(
      <AddressAutocomplete id="address-input" label="Address" value="" onSelect={mockOnSelect} />
    )

    expect(screen.getByText("Network error")).toBeInTheDocument()
  })

  it("displays custom error prop", () => {
    vi.spyOn(useGeocodeAutocompleteModule, "useGeocodeAutocomplete").mockReturnValue({
      suggestions: [],
      loading: false,
      error: null,
      search: vi.fn(),
      clear: vi.fn(),
    })

    render(
      <AddressAutocomplete
        id="address-input"
        label="Address"
        value=""
        onSelect={mockOnSelect}
        error="Custom error"
      />
    )

    expect(screen.getByText("Custom error")).toBeInTheDocument()
  })

  it("shows 'No addresses found' when no suggestions and valid input", async () => {
    const mockSearch = vi.fn()
    vi.spyOn(useGeocodeAutocompleteModule, "useGeocodeAutocomplete").mockReturnValue({
      suggestions: [],
      loading: false,
      error: null,
      search: mockSearch,
      clear: vi.fn(),
    })

    render(
      <AddressAutocomplete id="address-input" label="Address" value="" onSelect={mockOnSelect} />
    )

    const input = screen.getByRole("combobox")
    await userEvent.type(input, "xyz123")

    await waitFor(() => {
      expect(screen.getByText("No addresses found")).toBeInTheDocument()
    })
  })

  it("disables input when disabled prop is true", () => {
    vi.spyOn(useGeocodeAutocompleteModule, "useGeocodeAutocomplete").mockReturnValue({
      suggestions: [],
      loading: false,
      error: null,
      search: vi.fn(),
      clear: vi.fn(),
    })

    render(
      <AddressAutocomplete
        id="address-input"
        label="Address"
        value=""
        onSelect={mockOnSelect}
        disabled
      />
    )

    expect(screen.getByRole("combobox")).toBeDisabled()
  })

  it("clears suggestions when input is cleared", async () => {
    const mockClear = vi.fn()
    vi.spyOn(useGeocodeAutocompleteModule, "useGeocodeAutocomplete").mockReturnValue({
      suggestions: mockSuggestions,
      loading: false,
      error: null,
      search: vi.fn(),
      clear: mockClear,
    })

    render(
      <AddressAutocomplete id="address-input" label="Address" value="" onSelect={mockOnSelect} />
    )

    const input = screen.getByRole("combobox") as HTMLInputElement
    await userEvent.type(input, "525")
    await userEvent.clear(input)

    expect(mockClear).toHaveBeenCalled()
  })

  it("displays site name when available", async () => {
    const mockSearch = vi.fn()
    vi.spyOn(useGeocodeAutocompleteModule, "useGeocodeAutocomplete").mockReturnValue({
      suggestions: mockSuggestions,
      loading: false,
      error: null,
      search: mockSearch,
      clear: vi.fn(),
    })

    render(
      <AddressAutocomplete id="address-input" label="Address" value="" onSelect={mockOnSelect} />
    )

    const input = screen.getByRole("combobox")
    await userEvent.type(input, "525")

    await waitFor(() => {
      expect(screen.getByText("Victoria Office")).toBeInTheDocument()
    })
  })

  it("closes dropdown when clicking outside", async () => {
    const mockSearch = vi.fn()
    vi.spyOn(useGeocodeAutocompleteModule, "useGeocodeAutocomplete").mockReturnValue({
      suggestions: mockSuggestions,
      loading: false,
      error: null,
      search: mockSearch,
      clear: vi.fn(),
    })

    render(
      <div>
        <AddressAutocomplete id="address-input" label="Address" value="" onSelect={mockOnSelect} />
        <div data-testid="outside">Outside element</div>
      </div>
    )

    const input = screen.getByRole("combobox")
    await userEvent.type(input, "525")

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument()
    })

    const outside = screen.getByTestId("outside")
    fireEvent.mouseDown(outside)

    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    })
  })
})
