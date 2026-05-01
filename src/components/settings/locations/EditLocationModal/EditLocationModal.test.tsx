import "@testing-library/jest-dom"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("../LocationForm", () => ({
  LocationForm: () => <div>LocationFormStub</div>,
}))

vi.mock("@/hooks/settings/locations/useEditLocationModal")

import { useEditLocationModal } from "@/hooks/settings/locations/useEditLocationModal"
import type { LocationWithRelations } from "@/lib/prisma/location/types"
import { EditLocationModal } from "./EditLocationModal"

describe("EditLocationModal", () => {
  const now = new Date()
  const location = {
    code: "LOC1",
    name: "Location 1",
    timezone: "America/Vancouver",
    streetAddress: "123 Test St",
    mailAddress: "456 Mail Ave",
    phoneNumber: "(555) 123-4567",
    latitude: 49.2827,
    longitude: -123.1207,
    legacyOfficeNumber: null,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
    staffUsers: [],
    counters: [],
    services: [],
  } as LocationWithRelations

  const mockHandleSave = vi.fn()
  const mockHandleOpenArchive = vi.fn()
  const mockSetFormData = vi.fn()
  const mockOnClose = vi.fn()

  const defaultHookReturn = {
    isSaving: false,
    error: null,
    formData: { ...location } as Partial<LocationWithRelations>,
    setFormData: mockSetFormData,
    isFormValidating: false,
    isFormValidState: true,
    hasMadeChanges: false,
    isArchived: false,
    isReadonly: false,
    isSaveDisabled: false,
    handleSave: mockHandleSave,
    handleOpenArchive: mockHandleOpenArchive,
  }

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    location,
    services: [],
    counters: [],
    staffUsers: [],
    canEdit: true,
    canArchive: true,
    updateLocation: vi.fn(),
    doesLocationCodeExist: vi.fn(),
    revalidateTable: vi.fn(),
    openConfirmArchiveLocationModal: vi.fn(),
  }

  beforeEach(() => {
    vi.mocked(useEditLocationModal).mockReturnValue(defaultHookReturn)
  })

  it("renders modal title and LocationForm when open with a location", async () => {
    render(<EditLocationModal {...defaultProps} />)

    await waitFor(() => expect(screen.getByText(`Edit Location: ${location.code}`)).toBeTruthy())
    expect(screen.getByText("LocationFormStub")).toBeTruthy()
  })

  it("returns null when formData is null", () => {
    vi.mocked(useEditLocationModal).mockReturnValue({ ...defaultHookReturn, formData: null })

    const { queryByText } = render(<EditLocationModal {...defaultProps} />)

    expect(queryByText(`Edit Location: ${location.code}`)).toBeNull()
  })

  it("calls onClose when Cancel button is clicked", async () => {
    render(<EditLocationModal {...defaultProps} />)

    await waitFor(() => expect(screen.getByText("Cancel")).toBeTruthy())
    fireEvent.click(screen.getByText("Cancel"))
    expect(mockOnClose).toHaveBeenCalled()
  })

  it("shows no-permission message when canEdit is false", async () => {
    render(<EditLocationModal {...defaultProps} canEdit={false} />)

    await waitFor(() =>
      expect(screen.getByText("You do not have permission to edit this location.")).toBeTruthy()
    )
  })

  it("shows archived message when isArchived is true", async () => {
    vi.mocked(useEditLocationModal).mockReturnValue({ ...defaultHookReturn, isArchived: true })

    render(<EditLocationModal {...defaultProps} />)

    await waitFor(() =>
      expect(screen.getByText("This location is archived and cannot be edited.")).toBeTruthy()
    )
  })

  it("shows error message when error is set", async () => {
    vi.mocked(useEditLocationModal).mockReturnValue({
      ...defaultHookReturn,
      error: "Something went wrong",
    })

    render(<EditLocationModal {...defaultProps} />)

    await waitFor(() => expect(screen.getByText("Something went wrong")).toBeTruthy())
  })

  it("shows Archive button for active location when canArchive is true", async () => {
    render(<EditLocationModal {...defaultProps} />)

    await waitFor(() => expect(screen.getByText("Archive")).toBeTruthy())
  })

  it("calls handleOpenArchive when Archive button is clicked", async () => {
    render(<EditLocationModal {...defaultProps} />)

    await waitFor(() => expect(screen.getByText("Archive")).toBeTruthy())
    fireEvent.click(screen.getByText("Archive"))
    expect(mockHandleOpenArchive).toHaveBeenCalled()
  })

  it("hides Archive button when canArchive is false", async () => {
    const { queryByText } = render(<EditLocationModal {...defaultProps} canArchive={false} />)

    await waitFor(() => expect(screen.getByText("Save Changes")).toBeTruthy())
    expect(queryByText("Archive")).toBeNull()
  })

  it("shows Unarchive button for archived location", async () => {
    vi.mocked(useEditLocationModal).mockReturnValue({ ...defaultHookReturn, isArchived: true })

    render(<EditLocationModal {...defaultProps} />)

    await waitFor(() => expect(screen.getByText("Unarchive")).toBeTruthy())
  })

  it("disables Save Changes button when isSaveDisabled is true", async () => {
    vi.mocked(useEditLocationModal).mockReturnValue({ ...defaultHookReturn, isSaveDisabled: true })

    render(<EditLocationModal {...defaultProps} />)

    await waitFor(() => expect(screen.getByRole("button", { name: "Save Changes" })).toBeDisabled())
  })

  it("shows Saving... text when isSaving is true", async () => {
    vi.mocked(useEditLocationModal).mockReturnValue({
      ...defaultHookReturn,
      isSaving: true,
      isSaveDisabled: true,
    })

    render(<EditLocationModal {...defaultProps} />)

    await waitFor(() => expect(screen.getByText("Saving...")).toBeTruthy())
  })

  it("calls handleSave when Save Changes button is clicked", async () => {
    render(<EditLocationModal {...defaultProps} />)

    await waitFor(() => expect(screen.getByText("Save Changes")).toBeTruthy())
    fireEvent.click(screen.getByText("Save Changes"))
    expect(mockHandleSave).toHaveBeenCalled()
  })
})
