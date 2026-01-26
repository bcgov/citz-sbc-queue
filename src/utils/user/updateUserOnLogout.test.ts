import { beforeEach, describe, expect, it, vi } from "vitest"
import type { Role, StaffUser } from "@/generated/prisma/client"
import { updateUserOnLogout } from "./updateUserOnLogout"

vi.mock("@/lib/prisma/staff_user/getStaffUserBySub", () => ({
  getStaffUserBySub: vi.fn(),
}))

vi.mock("@/lib/prisma/staff_user/updateStaffUser", () => ({
  updateStaffUser: vi.fn(),
}))

import { getStaffUserBySub } from "@/lib/prisma/staff_user/getStaffUserBySub"
import { updateStaffUser } from "@/lib/prisma/staff_user/updateStaffUser"

describe("updateUserOnLogout", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("calls updateStaffUser when staff user exists", async () => {
    const sub = "test-sub-123"
    const mockStaff: StaffUser = {
      guid: "g1",
      sub: "test-sub-123",
      legacyCsrId: null,
      username: "test.user",
      displayName: "Test User",
      locationId: null,
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

    vi.mocked(getStaffUserBySub).mockResolvedValueOnce(mockStaff)

    await updateUserOnLogout(sub)

    expect(getStaffUserBySub).toHaveBeenCalledWith(sub)
    expect(updateStaffUser).toHaveBeenCalledWith({ isActive: false }, mockStaff)
  })

  it("does not call updateStaffUser when staff user is not found", async () => {
    const sub = "missing-sub"

    vi.mocked(getStaffUserBySub).mockResolvedValueOnce(null)

    // spy on console.log to avoid noisy output
    // biome-ignore lint/suspicious/noEmptyBlockStatements: <>
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {})

    await updateUserOnLogout(sub)

    expect(getStaffUserBySub).toHaveBeenCalledWith(sub)
    expect(updateStaffUser).not.toHaveBeenCalled()
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("No staff user found for sub: missing-sub")
    )

    logSpy.mockRestore()
  })
})
