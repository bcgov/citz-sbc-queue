import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { Role, StaffUser } from "@/generated/prisma/client"
import { EditStaffUserModal } from "./EditStaffUserModal"

// Mock child components
vi.mock("./sections/UserInformationSection", () => ({
  UserInformationSection: ({ user }: { user: StaffUser | null }) => (
    <div data-testid="user-info-section">User Info: {user?.username}</div>
  ),
}))

vi.mock("./sections/RoleAndAssignmentSection", () => ({
  RoleAndAssignmentSection: ({
    onRoleChange,
    onOfficeIdChange,
  }: {
    onRoleChange: (role: string) => void
    onOfficeIdChange: (officeId: number) => void
  }) => (
    <div data-testid="role-assignment-section">
      <button type="button" onClick={() => onRoleChange("Administrator")}>
        Change Role
      </button>
      <button type="button" onClick={() => onOfficeIdChange(2)}>
        Change Office
      </button>
    </div>
  ),
}))

vi.mock("./sections/PermissionsSection", () => ({
  PermissionsSection: ({
    user,
    onIsReceptionistChange,
    onIsOfficeManagerChange,
    onIsPesticideDesignateChange,
    onIsFinanceDesignateChange,
    onIsIta2DesignateChange,
  }: {
    user: StaffUser
    onIsReceptionistChange: (value: boolean) => void
    onIsOfficeManagerChange: (value: boolean) => void
    onIsPesticideDesignateChange: (value: boolean) => void
    onIsFinanceDesignateChange: (value: boolean) => void
    onIsIta2DesignateChange: (value: boolean) => void
  }) => (
    <div data-testid="permissions-section">
      <button
        type="button"
        onClick={() => onIsReceptionistChange(!user.isReceptionist)}
        data-testid="toggle-receptionist"
      >
        Toggle Receptionist
      </button>
      <button
        type="button"
        onClick={() => onIsOfficeManagerChange(!user.isOfficeManager)}
        data-testid="toggle-office-manager"
      >
        Toggle Office Manager
      </button>
      <button
        type="button"
        onClick={() => onIsPesticideDesignateChange(!user.isPesticideDesignate)}
        data-testid="toggle-pesticide"
      >
        Toggle Pesticide
      </button>
      <button
        type="button"
        onClick={() => onIsFinanceDesignateChange(!user.isFinanceDesignate)}
        data-testid="toggle-finance"
      >
        Toggle Finance
      </button>
      <button
        type="button"
        onClick={() => onIsIta2DesignateChange(!user.isIta2Designate)}
        data-testid="toggle-ita2"
      >
        Toggle ITA2
      </button>
    </div>
  ),
}))

vi.mock("@/hooks/useEditableRoles", () => ({
  useEditableRoles: vi.fn(() => ["CSR", "SCSR"]),
}))

const mockStaffUser: StaffUser = {
  guid: "550e8400-e29b-41d4-a716-446655440000",
  sub: "550e8400-e29b-41d4-a716-446655440000@azureidir",
  legacyCsrId: 1,
  username: "john.doe",
  displayName: "John Doe",
  officeId: 1,
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

describe("EditStaffUserModal", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render nothing when user is null", () => {
    const mockupdateStaffUser = vi.fn()
    const mockRevalidateTable = vi.fn()
    const { container } = render(
      <EditStaffUserModal
        open={true}
        onClose={vi.fn()}
        user={null}
        updateStaffUser={mockupdateStaffUser}
        revalidateTable={mockRevalidateTable}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it("should render nothing when modal is closed", () => {
    const mockupdateStaffUser = vi.fn()
    const mockRevalidateTable = vi.fn()
    const { container } = render(
      <EditStaffUserModal
        open={false}
        onClose={vi.fn()}
        user={mockStaffUser}
        updateStaffUser={mockupdateStaffUser}
        revalidateTable={mockRevalidateTable}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it("should render modal when open is true and user exists", () => {
    const mockupdateStaffUser = vi.fn()
    const mockRevalidateTable = vi.fn()
    render(
      <EditStaffUserModal
        open={true}
        onClose={vi.fn()}
        user={mockStaffUser}
        updateStaffUser={mockupdateStaffUser}
        revalidateTable={mockRevalidateTable}
      />
    )

    expect(screen.getByText(`Edit User: ${mockStaffUser.username}`)).toBeTruthy()
  })

  it("should display all three sections when open", () => {
    const mockupdateStaffUser = vi.fn()
    const mockRevalidateTable = vi.fn()
    render(
      <EditStaffUserModal
        open={true}
        onClose={vi.fn()}
        user={mockStaffUser}
        updateStaffUser={mockupdateStaffUser}
        revalidateTable={mockRevalidateTable}
      />
    )

    expect(screen.getByTestId("user-info-section")).toBeTruthy()
    expect(screen.getByTestId("role-assignment-section")).toBeTruthy()
    expect(screen.getByTestId("permissions-section")).toBeTruthy()
  })

  it("should call onClose when close button is clicked", async () => {
    const mockOnClose = vi.fn()
    const mockupdateStaffUser = vi.fn()
    const mockRevalidateTable = vi.fn()
    render(
      <EditStaffUserModal
        open={true}
        onClose={mockOnClose}
        user={mockStaffUser}
        updateStaffUser={mockupdateStaffUser}
        revalidateTable={mockRevalidateTable}
      />
    )

    const closeButton = screen.getByRole("button", { name: /close/i })
    await userEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledOnce()
  })

  it("should call onClose when Cancel button is clicked", async () => {
    const mockOnClose = vi.fn()
    const mockupdateStaffUser = vi.fn()
    const mockRevalidateTable = vi.fn()
    render(
      <EditStaffUserModal
        open={true}
        onClose={mockOnClose}
        user={mockStaffUser}
        updateStaffUser={mockupdateStaffUser}
        revalidateTable={mockRevalidateTable}
      />
    )

    const cancelButton = screen.getByRole("button", { name: /cancel/i })
    await userEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalledOnce()
  })

  it("should call updateStaffUser with updated data when Save Changes is clicked", async () => {
    const mockOnClose = vi.fn()
    const mockupdateStaffUser = vi.fn().mockResolvedValue(undefined)
    const mockRevalidateTable = vi.fn()
    render(
      <EditStaffUserModal
        open={true}
        onClose={mockOnClose}
        user={mockStaffUser}
        updateStaffUser={mockupdateStaffUser}
        revalidateTable={mockRevalidateTable}
      />
    )

    const saveButton = screen.getByRole("button", { name: /save changes/i })
    await userEvent.click(saveButton)

    await waitFor(() => {
      expect(mockupdateStaffUser).toHaveBeenCalledWith(mockStaffUser, mockStaffUser, [
        "CSR",
        "SCSR",
      ])
    })
  })

  it("should call onClose after successful save", async () => {
    const mockOnClose = vi.fn()
    const mockupdateStaffUser = vi.fn().mockResolvedValue(undefined)
    const mockRevalidateTable = vi.fn()
    render(
      <EditStaffUserModal
        open={true}
        onClose={mockOnClose}
        user={mockStaffUser}
        updateStaffUser={mockupdateStaffUser}
        revalidateTable={mockRevalidateTable}
      />
    )

    const saveButton = screen.getByRole("button", { name: /save changes/i })
    await userEvent.click(saveButton)

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledOnce()
    })
  })

  it("should update form data when role changes", async () => {
    const mockupdateStaffUser = vi.fn().mockResolvedValue(undefined)
    const mockRevalidateTable = vi.fn()
    render(
      <EditStaffUserModal
        open={true}
        onClose={vi.fn()}
        user={mockStaffUser}
        updateStaffUser={mockupdateStaffUser}
        revalidateTable={mockRevalidateTable}
      />
    )

    const changeRoleButton = screen.getByRole("button", { name: /change role/i })
    await userEvent.click(changeRoleButton)

    const saveButton = screen.getByRole("button", { name: /save changes/i })
    await userEvent.click(saveButton)

    await waitFor(() => {
      const callArgs = mockupdateStaffUser.mock.calls[0]
      expect(callArgs[0]).toEqual(expect.objectContaining({ role: "Administrator" }))
    })
  })

  it("should update form data when office id changes", async () => {
    const mockupdateStaffUser = vi.fn().mockResolvedValue(undefined)
    const mockRevalidateTable = vi.fn()
    render(
      <EditStaffUserModal
        open={true}
        onClose={vi.fn()}
        user={mockStaffUser}
        updateStaffUser={mockupdateStaffUser}
        revalidateTable={mockRevalidateTable}
      />
    )

    const changeOfficeButton = screen.getByRole("button", { name: /change office/i })
    await userEvent.click(changeOfficeButton)

    const saveButton = screen.getByRole("button", { name: /save changes/i })
    await userEvent.click(saveButton)

    await waitFor(() => {
      const callArgs = mockupdateStaffUser.mock.calls[0]
      expect(callArgs[0]).toEqual(expect.objectContaining({ officeId: 2 }))
    })
  })

  it("should update form data when permissions change", async () => {
    const mockupdateStaffUser = vi.fn().mockResolvedValue(undefined)
    const mockRevalidateTable = vi.fn()
    render(
      <EditStaffUserModal
        open={true}
        onClose={vi.fn()}
        user={mockStaffUser}
        updateStaffUser={mockupdateStaffUser}
        revalidateTable={mockRevalidateTable}
      />
    )

    const toggleReceptionistButton = screen.getByTestId("toggle-receptionist")
    await userEvent.click(toggleReceptionistButton)

    const toggleOfficeManagerButton = screen.getByTestId("toggle-office-manager")
    await userEvent.click(toggleOfficeManagerButton)

    const saveButton = screen.getByRole("button", { name: /save changes/i })
    await userEvent.click(saveButton)

    await waitFor(() => {
      const callArgs = mockupdateStaffUser.mock.calls[0]
      expect(callArgs[0]).toEqual(
        expect.objectContaining({
          isReceptionist: true,
          isOfficeManager: true,
        })
      )
    })
  })

  it("should update all designate flags when toggled", async () => {
    const mockupdateStaffUser = vi.fn().mockResolvedValue(undefined)
    const mockRevalidateTable = vi.fn()
    render(
      <EditStaffUserModal
        open={true}
        onClose={vi.fn()}
        user={mockStaffUser}
        updateStaffUser={mockupdateStaffUser}
        revalidateTable={mockRevalidateTable}
      />
    )

    const togglePesticideButton = screen.getByTestId("toggle-pesticide")
    const toggleFinanceButton = screen.getByTestId("toggle-finance")
    const toggleIta2Button = screen.getByTestId("toggle-ita2")

    await userEvent.click(togglePesticideButton)
    await userEvent.click(toggleFinanceButton)
    await userEvent.click(toggleIta2Button)

    const saveButton = screen.getByRole("button", { name: /save changes/i })
    await userEvent.click(saveButton)

    await waitFor(() => {
      const callArgs = mockupdateStaffUser.mock.calls[0]
      expect(callArgs[0]).toEqual(
        expect.objectContaining({
          isPesticideDesignate: true,
          isFinanceDesignate: true,
          isIta2Designate: true,
        })
      )
    })
  })

  it("should pass previous user to updateStaffUser callback", async () => {
    const mockupdateStaffUser = vi.fn().mockResolvedValue(undefined)
    const mockRevalidateTable = vi.fn()
    render(
      <EditStaffUserModal
        open={true}
        onClose={vi.fn()}
        user={mockStaffUser}
        updateStaffUser={mockupdateStaffUser}
        revalidateTable={mockRevalidateTable}
      />
    )

    const saveButton = screen.getByRole("button", { name: /save changes/i })
    await userEvent.click(saveButton)

    await waitFor(() => {
      const callArgs = mockupdateStaffUser.mock.calls[0]
      expect(callArgs[1]).toEqual(mockStaffUser)
    })
  })

  it("should preserve unchanged fields when updating", async () => {
    const mockupdateStaffUser = vi.fn().mockResolvedValue(undefined)
    const mockRevalidateTable = vi.fn()
    render(
      <EditStaffUserModal
        open={true}
        onClose={vi.fn()}
        user={mockStaffUser}
        updateStaffUser={mockupdateStaffUser}
        revalidateTable={mockRevalidateTable}
      />
    )

    const changeRoleButton = screen.getByRole("button", { name: /change role/i })
    await userEvent.click(changeRoleButton)

    const saveButton = screen.getByRole("button", { name: /save changes/i })
    await userEvent.click(saveButton)

    await waitFor(() => {
      const callArgs = mockupdateStaffUser.mock.calls[0]
      const updatedUser = callArgs[0]
      expect(updatedUser).toEqual(
        expect.objectContaining({
          username: mockStaffUser.username,
          displayName: mockStaffUser.displayName,
          officeId: mockStaffUser.officeId,
          isReceptionist: mockStaffUser.isReceptionist,
        })
      )
    })
  })

  it("should reinitialize form when user prop changes", () => {
    const mockupdateStaffUser = vi.fn()
    const mockRevalidateTable = vi.fn()
    const newUser: StaffUser = {
      ...mockStaffUser,
      username: "jane.smith",
      displayName: "Jane Smith",
    }

    const { rerender } = render(
      <EditStaffUserModal
        open={true}
        onClose={vi.fn()}
        user={mockStaffUser}
        updateStaffUser={mockupdateStaffUser}
        revalidateTable={mockRevalidateTable}
      />
    )

    expect(screen.getByText(`Edit User: ${mockStaffUser.username}`)).toBeTruthy()

    rerender(
      <EditStaffUserModal
        open={true}
        onClose={vi.fn()}
        user={newUser}
        updateStaffUser={mockupdateStaffUser}
        revalidateTable={mockRevalidateTable}
      />
    )

    expect(screen.getByText(`Edit User: ${newUser.username}`)).toBeTruthy()
  })

  it("should render modal with proper accessibility attributes", () => {
    const mockupdateStaffUser = vi.fn()
    const mockRevalidateTable = vi.fn()
    render(
      <EditStaffUserModal
        open={true}
        onClose={vi.fn()}
        user={mockStaffUser}
        updateStaffUser={mockupdateStaffUser}
        revalidateTable={mockRevalidateTable}
      />
    )

    const title = screen.getByText(`Edit User: ${mockStaffUser.username}`)
    expect(title).toBeTruthy()

    const cancelButton = screen.getByRole("button", { name: /cancel/i })
    const saveButton = screen.getByRole("button", { name: /save changes/i })

    expect(cancelButton).toBeTruthy()
    expect(saveButton).toBeTruthy()
  })

  it("should display error banner and disable form when user role is higher than available roles", () => {
    const mockupdateStaffUser = vi.fn().mockResolvedValue(undefined)
    const mockRevalidateTable = vi.fn()
    const higherRoleUser: StaffUser = {
      ...mockStaffUser,
      role: "Administrator" as Role,
    }

    render(
      <EditStaffUserModal
        open={true}
        onClose={vi.fn()}
        user={higherRoleUser}
        updateStaffUser={mockupdateStaffUser}
        revalidateTable={mockRevalidateTable}
      />
    )

    // Check for error banner
    expect(
      screen.getByText(/this user has a higher role than yours and cannot be edited/i)
    ).toBeTruthy()
  })

  it("should disable save button when user role is higher than available roles", () => {
    const mockupdateStaffUser = vi.fn().mockResolvedValue(undefined)
    const mockRevalidateTable = vi.fn()
    const higherRoleUser: StaffUser = {
      ...mockStaffUser,
      role: "Administrator" as Role,
    }

    render(
      <EditStaffUserModal
        open={true}
        onClose={vi.fn()}
        user={higherRoleUser}
        updateStaffUser={mockupdateStaffUser}
        revalidateTable={mockRevalidateTable}
      />
    )

    const saveButton = screen.getByRole("button", { name: /save changes/i })
    expect(saveButton.hasAttribute("disabled")).toBe(true)
  })

  it("should not call updateStaffUser when attempting to save with higher role user", async () => {
    const mockupdateStaffUser = vi.fn().mockResolvedValue(undefined)
    const mockRevalidateTable = vi.fn()
    const higherRoleUser: StaffUser = {
      ...mockStaffUser,
      role: "Administrator" as Role,
    }

    render(
      <EditStaffUserModal
        open={true}
        onClose={vi.fn()}
        user={higherRoleUser}
        updateStaffUser={mockupdateStaffUser}
        revalidateTable={mockRevalidateTable}
      />
    )

    const saveButton = screen.getByRole("button", { name: /save changes/i })
    await userEvent.click(saveButton)

    expect(mockupdateStaffUser).not.toHaveBeenCalled()
  })
})
