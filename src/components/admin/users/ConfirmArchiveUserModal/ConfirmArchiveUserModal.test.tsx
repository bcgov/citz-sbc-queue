import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { StaffUser } from "@/generated/prisma/client"
import { ConfirmArchiveUserModal } from "./ConfirmArchiveUserModal"

vi.mock("@/hooks/useEditableRoles", () => ({
  useEditableRoles: vi.fn(() => ["CSR", "OFFICE_MANAGER"]),
}))

const mockStaffUser: StaffUser = {
  guid: "550e8400-e29b-41d4-a716-446655440000",
  sub: "550e8400-e29b-41d4-a716-446655440000@azureidir",
  legacyCsrId: 1,
  username: "john.doe",
  displayName: "John Doe",
  locationId: "111e8400-e29b-41d4-a716-446655440000",
  counterId: 1,
  role: "CSR",
  isActive: true,
  deletedAt: null,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  isReceptionist: false,
  isOfficeManager: false,
  isPesticideDesignate: false,
  isFinanceDesignate: false,
  isIta2Designate: false,
}

describe("ConfirmArchiveModal", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render nothing when user is null", () => {
    const mockUpdateStaffUser = vi.fn()
    const mockRevalidateTable = vi.fn()
    const { container } = render(
      <ConfirmArchiveUserModal
        open={true}
        onClose={vi.fn()}
        user={null}
        updateStaffUser={mockUpdateStaffUser}
        revalidateTable={mockRevalidateTable}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it("should render nothing when modal is closed", () => {
    const mockUpdateStaffUser = vi.fn()
    const mockRevalidateTable = vi.fn()
    const { container } = render(
      <ConfirmArchiveUserModal
        open={false}
        onClose={vi.fn()}
        user={mockStaffUser}
        updateStaffUser={mockUpdateStaffUser}
        revalidateTable={mockRevalidateTable}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it("should display archive modal when user is active", () => {
    const mockUpdateStaffUser = vi.fn()
    const mockRevalidateTable = vi.fn()
    render(
      <ConfirmArchiveUserModal
        open={true}
        onClose={vi.fn()}
        user={mockStaffUser}
        updateStaffUser={mockUpdateStaffUser}
        revalidateTable={mockRevalidateTable}
      />
    )

    expect(
      within(screen.getByRole("dialog")).getByText(
        (_, node) => {
          const text = node?.textContent ?? ""
          return new RegExp(
            `Type\\s+"${mockStaffUser.username}"\\s+to confirm\\s+archiving this user\\.`
          ).test(text)
        },
        { selector: "label" }
      )
    ).toBeTruthy()
  })

  it("should display unarchive modal when user is archived", () => {
    const archivedUser = { ...mockStaffUser, deletedAt: new Date("2025-01-15") }
    const mockUpdateStaffUser = vi.fn()
    const mockRevalidateTable = vi.fn()
    render(
      <ConfirmArchiveUserModal
        open={true}
        onClose={vi.fn()}
        user={archivedUser}
        updateStaffUser={mockUpdateStaffUser}
        revalidateTable={mockRevalidateTable}
      />
    )

    expect(
      within(screen.getByRole("dialog")).getByText(
        (_, node) => {
          const text = node?.textContent ?? ""
          return new RegExp(
            `Type\\s+"${archivedUser.username}"\\s+to confirm\\s+unarchiving this user\\.`
          ).test(text)
        },
        { selector: "label" }
      )
    ).toBeTruthy()
  })

  it("should disable archive button until username is typed", async () => {
    const mockUpdateStaffUser = vi.fn()
    const mockRevalidateTable = vi.fn()
    render(
      <ConfirmArchiveUserModal
        open={true}
        onClose={vi.fn()}
        user={mockStaffUser}
        updateStaffUser={mockUpdateStaffUser}
        revalidateTable={mockRevalidateTable}
      />
    )

    const archiveButton = screen.getByRole("button", {
      name: /archive/i,
    })
    expect(archiveButton.hasAttribute("disabled")).toBe(true)

    const input = screen.getByDisplayValue("")
    await userEvent.type(input, mockStaffUser.username)

    expect(archiveButton.hasAttribute("disabled")).toBe(false)
  })

  it("should call updateStaffUser with deletedAt when archiving", async () => {
    const mockUpdateStaffUser = vi.fn().mockResolvedValue(undefined)
    const mockRevalidateTable = vi.fn().mockResolvedValue(undefined)
    render(
      <ConfirmArchiveUserModal
        open={true}
        onClose={vi.fn()}
        user={mockStaffUser}
        updateStaffUser={mockUpdateStaffUser}
        revalidateTable={mockRevalidateTable}
      />
    )

    const input = screen.getByDisplayValue("")
    await userEvent.type(input, mockStaffUser.username)

    const archiveButton = screen.getByRole("button", { name: /archive/i })
    await userEvent.click(archiveButton)

    await waitFor(() => {
      const callArgs = mockUpdateStaffUser.mock.calls[0]
      expect(callArgs[0]).toEqual(
        expect.objectContaining({
          deletedAt: expect.any(Date),
        })
      )
      expect(callArgs[0].deletedAt).not.toBeNull()
    })
  })

  it("should set deletedAt to null when unarchiving", async () => {
    const archivedUser = { ...mockStaffUser, deletedAt: new Date("2025-01-15") }
    const mockUpdateStaffUser = vi.fn().mockResolvedValue(undefined)
    const mockRevalidateTable = vi.fn().mockResolvedValue(undefined)
    render(
      <ConfirmArchiveUserModal
        open={true}
        onClose={vi.fn()}
        user={archivedUser}
        updateStaffUser={mockUpdateStaffUser}
        revalidateTable={mockRevalidateTable}
      />
    )

    const input = screen.getByDisplayValue("")
    await userEvent.type(input, archivedUser.username)

    const unarchiveButton = screen.getByRole("button", { name: /unarchive/i })
    await userEvent.click(unarchiveButton)

    await waitFor(() => {
      const callArgs = mockUpdateStaffUser.mock.calls[0]
      expect(callArgs[0]).toEqual(
        expect.objectContaining({
          deletedAt: null,
        })
      )
    })
  })

  it("should call revalidateTable after successful update", async () => {
    const mockUpdateStaffUser = vi.fn().mockResolvedValue(undefined)
    const mockRevalidateTable = vi.fn().mockResolvedValue(undefined)
    render(
      <ConfirmArchiveUserModal
        open={true}
        onClose={vi.fn()}
        user={mockStaffUser}
        updateStaffUser={mockUpdateStaffUser}
        revalidateTable={mockRevalidateTable}
      />
    )

    const input = screen.getByDisplayValue("")
    await userEvent.type(input, mockStaffUser.username)

    const archiveButton = screen.getByRole("button", { name: /archive/i })
    await userEvent.click(archiveButton)

    await waitFor(() => {
      expect(mockRevalidateTable).toHaveBeenCalledOnce()
    })
  })

  it("should call onClose after successful archive", async () => {
    const mockOnClose = vi.fn()
    const mockUpdateStaffUser = vi.fn().mockResolvedValue(undefined)
    const mockRevalidateTable = vi.fn().mockResolvedValue(undefined)
    render(
      <ConfirmArchiveUserModal
        open={true}
        onClose={mockOnClose}
        user={mockStaffUser}
        updateStaffUser={mockUpdateStaffUser}
        revalidateTable={mockRevalidateTable}
      />
    )

    const input = screen.getByDisplayValue("")
    await userEvent.type(input, mockStaffUser.username)

    const archiveButton = screen.getByRole("button", { name: /archive/i })
    await userEvent.click(archiveButton)

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledOnce()
    })
  })

  it("should call onClose when cancel button is clicked", async () => {
    const mockOnClose = vi.fn()
    const mockUpdateStaffUser = vi.fn()
    const mockRevalidateTable = vi.fn()
    render(
      <ConfirmArchiveUserModal
        open={true}
        onClose={mockOnClose}
        user={mockStaffUser}
        updateStaffUser={mockUpdateStaffUser}
        revalidateTable={mockRevalidateTable}
      />
    )

    const cancelButton = screen.getByRole("button", { name: /cancel/i })
    await userEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalledOnce()
  })

  it("should clear confirmation text after successful archive", async () => {
    const mockUpdateStaffUser = vi.fn().mockResolvedValue(undefined)
    const mockRevalidateTable = vi.fn().mockResolvedValue(undefined)
    const mockOnClose = vi.fn()
    render(
      <ConfirmArchiveUserModal
        open={true}
        onClose={mockOnClose}
        user={mockStaffUser}
        updateStaffUser={mockUpdateStaffUser}
        revalidateTable={mockRevalidateTable}
      />
    )

    const input = screen.getByDisplayValue("") as HTMLInputElement
    await userEvent.type(input, mockStaffUser.username)

    expect(input.value).toBe(mockStaffUser.username)

    const archiveButton = screen.getByRole("button", { name: /archive/i })
    await userEvent.click(archiveButton)

    await waitFor(() => {
      expect(input.value).toBe("")
    })
  })
})
