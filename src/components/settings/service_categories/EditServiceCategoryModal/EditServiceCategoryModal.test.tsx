import "@testing-library/jest-dom"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("../ServiceCategoryForm", () => ({
  ServiceCategoryForm: () => <div>ServiceCategoryFormStub</div>,
}))

vi.mock("@/hooks/settings/service_categories/useEditServiceCategoryModal")

import { useEditServiceCategoryModal } from "@/hooks/settings/service_categories/useEditServiceCategoryModal"
import type { ServiceCategoryWithRelations } from "@/lib/prisma/service_category/types"
import { EditServiceCategoryModal } from "./EditServiceCategoryModal"

describe("EditServiceCategoryModal", () => {
  const now = new Date()
  const serviceCategory = {
    id: "sc1",
    name: "Category 1",
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
    services: [],
  } as unknown as ServiceCategoryWithRelations

  const mockHandleSave = vi.fn()
  const mockHandleOpenArchive = vi.fn()
  const mockSetFormData = vi.fn()
  const mockOnClose = vi.fn()

  const defaultHookReturn = {
    isSaving: false,
    error: null,
    formData: { ...serviceCategory } as Partial<ServiceCategoryWithRelations>,
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
    serviceCategory,
    services: [],
    canEdit: true,
    canArchive: true,
    updateServiceCategory: vi.fn(),
    revalidateTable: vi.fn(),
    openConfirmArchiveServiceCategoryModal: vi.fn(),
  }

  beforeEach(() => {
    vi.mocked(useEditServiceCategoryModal).mockReturnValue(defaultHookReturn)
  })

  it("renders modal title and ServiceCategoryForm when open", async () => {
    render(<EditServiceCategoryModal {...defaultProps} />)

    await waitFor(() =>
      expect(screen.getByText(`Edit Category: ${serviceCategory.name}`)).toBeTruthy()
    )
    expect(screen.getByText("ServiceCategoryFormStub")).toBeTruthy()
  })

  it("returns null when formData is null", () => {
    vi.mocked(useEditServiceCategoryModal).mockReturnValue({ ...defaultHookReturn, formData: null })

    const { queryByText } = render(<EditServiceCategoryModal {...defaultProps} />)

    expect(queryByText(`Edit Category: ${serviceCategory.name}`)).toBeNull()
  })

  it("calls onClose when Cancel button is clicked", async () => {
    render(<EditServiceCategoryModal {...defaultProps} />)

    await waitFor(() => expect(screen.getByText("Cancel")).toBeTruthy())
    fireEvent.click(screen.getByText("Cancel"))
    expect(mockOnClose).toHaveBeenCalled()
  })

  it("shows no-permission message when canEdit is false", async () => {
    render(<EditServiceCategoryModal {...defaultProps} canEdit={false} />)

    await waitFor(() =>
      expect(
        screen.getByText("You do not have permission to edit this service category.")
      ).toBeTruthy()
    )
  })

  it("shows archived message when isArchived is true", async () => {
    vi.mocked(useEditServiceCategoryModal).mockReturnValue({
      ...defaultHookReturn,
      isArchived: true,
    })

    render(<EditServiceCategoryModal {...defaultProps} />)

    await waitFor(() =>
      expect(
        screen.getByText("This service category is archived and cannot be edited.")
      ).toBeTruthy()
    )
  })

  it("shows error message when error is set", async () => {
    vi.mocked(useEditServiceCategoryModal).mockReturnValue({
      ...defaultHookReturn,
      error: "Something went wrong",
    })

    render(<EditServiceCategoryModal {...defaultProps} />)

    await waitFor(() => expect(screen.getByText("Something went wrong")).toBeTruthy())
  })

  it("shows Archive button for active location when canArchive is true", async () => {
    render(<EditServiceCategoryModal {...defaultProps} />)

    await waitFor(() => expect(screen.getByText("Archive")).toBeTruthy())
  })

  it("calls handleOpenArchive when Archive button is clicked", async () => {
    render(<EditServiceCategoryModal {...defaultProps} />)

    await waitFor(() => expect(screen.getByText("Archive")).toBeTruthy())
    fireEvent.click(screen.getByText("Archive"))
    expect(mockHandleOpenArchive).toHaveBeenCalled()
  })

  it("hides Archive button when canArchive is false", async () => {
    const { queryByText } = render(
      <EditServiceCategoryModal {...defaultProps} canArchive={false} />
    )

    await waitFor(() => expect(screen.getByText("Save Changes")).toBeTruthy())
    expect(queryByText("Archive")).toBeNull()
  })

  it("shows Unarchive button for archived service category", async () => {
    vi.mocked(useEditServiceCategoryModal).mockReturnValue({
      ...defaultHookReturn,
      isArchived: true,
    })

    render(<EditServiceCategoryModal {...defaultProps} />)

    await waitFor(() => expect(screen.getByText("Unarchive")).toBeTruthy())
  })

  it("disables Save Changes button when isSaveDisabled is true", async () => {
    vi.mocked(useEditServiceCategoryModal).mockReturnValue({
      ...defaultHookReturn,
      isSaveDisabled: true,
    })

    render(<EditServiceCategoryModal {...defaultProps} />)

    await waitFor(() => expect(screen.getByRole("button", { name: "Save Changes" })).toBeDisabled())
  })

  it("shows Saving... text when isSaving is true", async () => {
    vi.mocked(useEditServiceCategoryModal).mockReturnValue({
      ...defaultHookReturn,
      isSaving: true,
      isSaveDisabled: true,
    })

    render(<EditServiceCategoryModal {...defaultProps} />)

    await waitFor(() => expect(screen.getByText("Saving...")).toBeTruthy())
  })

  it("calls handleSave when Save Changes button is clicked", async () => {
    render(<EditServiceCategoryModal {...defaultProps} />)

    await waitFor(() => expect(screen.getByText("Save Changes")).toBeTruthy())
    fireEvent.click(screen.getByText("Save Changes"))
    expect(mockHandleSave).toHaveBeenCalled()
  })
})
