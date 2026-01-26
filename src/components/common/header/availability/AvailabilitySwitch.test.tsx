import "@testing-library/jest-dom"
import { render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { Role, StaffUser } from "@/generated/prisma/client"
import { AvailabilitySwitch } from "./AvailabilitySwitch"

const mockOpenDialog = vi.fn()
const mockCloseDialog = vi.fn()

const authState = { isAuthenticated: true as boolean, sub: "test-sub-123" as string | null }

vi.mock("@/hooks", () => ({
  useAuth: () => authState,
  useDialog: () => ({ open: false, openDialog: mockOpenDialog, closeDialog: mockCloseDialog }),
}))

describe("AvailabilitySwitch", () => {
  const mockStaffUser: StaffUser = {
    guid: "test-guid-123",
    sub: "test-sub-123",
    legacyCsrId: 5,
    username: "test.user",
    displayName: "Test User",
    locationId: "11111111-1111-1111-1111-111111111111",
    counterId: null,
    role: "CSR" as Role,
    isActive: true,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    isReceptionist: false,
    isOfficeManager: false,
    isPesticideDesignate: false,
    isFinanceDesignate: false,
    isIta2Designate: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    authState.isAuthenticated = true
    authState.sub = "test-sub-123"
  })

  it("fetches staff user, shows Unavailable and calls toggleAvailableBySub with fetched value", async () => {
    const getStaffUserBySub = vi.fn().mockResolvedValue({ ...mockStaffUser, isActive: false })
    const toggleAvailableBySub = vi.fn()

    render(
      <AvailabilitySwitch
        getStaffUserBySub={getStaffUserBySub}
        toggleAvailableBySub={toggleAvailableBySub}
      />
    )

    await waitFor(() => expect(getStaffUserBySub).toHaveBeenCalledWith("test-sub-123"))

    // After fetch, component should show "Unavailable"
    await waitFor(() => expect(screen.getByText("Unavailable")).toBeInTheDocument())

    // toggleAvailableBySub should be called with the fetched availability (false)
    await waitFor(() => expect(toggleAvailableBySub).toHaveBeenCalledWith("test-sub-123", false))
  })

  it("renders nothing when not authenticated or no sub", () => {
    authState.isAuthenticated = false
    authState.sub = null

    const getStaffUserBySub = vi.fn()
    const toggleAvailableBySub = vi.fn()

    const { container } = render(
      <AvailabilitySwitch
        getStaffUserBySub={getStaffUserBySub}
        toggleAvailableBySub={toggleAvailableBySub}
      />
    )

    expect(container.firstChild).toBeNull()
    expect(getStaffUserBySub).not.toHaveBeenCalled()
    expect(toggleAvailableBySub).not.toHaveBeenCalled()
  })
})
