import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { Role, StaffUser } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"
import { toggleAvailabilityBySub } from "./toggleAvailabilityBySub"

vi.mock("@/utils/db/prisma", () => ({
  prisma: {
    staffUser: {
      update: vi.fn(),
    },
  },
}))

describe("toggleAvailabilityBySub", () => {
  const sub = "test-sub-123"

  const mockStaffUser: StaffUser = {
    guid: "test-guid-123",
    sub,
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
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("updates availability to true and returns true", async () => {
    const updated: StaffUser = { ...mockStaffUser, isActive: true, updatedAt: new Date() }

    vi.mocked(prisma.staffUser.update).mockResolvedValueOnce(updated)

    const result = await toggleAvailabilityBySub(sub, true)

    expect(result).toBe(true)
    expect(prisma.staffUser.update).toHaveBeenCalledWith({
      where: { sub },
      data: { isActive: true, updatedAt: expect.any(Date) },
    })
  })

  it("updates availability to false and returns false", async () => {
    const updated: StaffUser = { ...mockStaffUser, isActive: false, updatedAt: new Date() }

    vi.mocked(prisma.staffUser.update).mockResolvedValueOnce(updated)

    const result = await toggleAvailabilityBySub(sub, false)

    expect(result).toBe(false)
    expect(prisma.staffUser.update).toHaveBeenCalledWith({
      where: { sub },
      data: { isActive: false, updatedAt: expect.any(Date) },
    })
  })
})
