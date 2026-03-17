import { beforeEach, describe, expect, it, vi } from "vitest"
import { prisma } from "@/utils/db/prisma"
import { getStaffUserBySub } from "./getStaffUserBySub"
import type { StaffUserWithRelations } from "./types"

vi.mock("@/utils/db/prisma", () => ({
  prisma: {
    staffUser: {
      findUnique: vi.fn(),
    },
  },
}))

describe("getStaffUserBySub", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns a staff user when found", async () => {
    const mockUser = {
      sub: "550e8400-e29b-41d4-a716-446655440000@azureidir",
      guid: "550e8400-e29b-41d4-a716-446655440000",
      legacyCsrId: null,
      username: "user1",
      displayName: "User One",
      locationCode: null,
      counterId: null,
      role: "CSR" as const,
      isActive: true,
      deletedAt: null,
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
      isReceptionist: false,
      isOfficeManager: false,
      isPesticideDesignate: false,
      isFinanceDesignate: false,
      isIta2Designate: false,
    } as StaffUserWithRelations

    vi.mocked(prisma.staffUser.findUnique).mockResolvedValueOnce(mockUser)

    const result = await getStaffUserBySub(mockUser.sub)

    expect(prisma.staffUser.findUnique).toHaveBeenCalledWith({
      where: { sub: mockUser.sub },
      include: { location: true, counter: true },
    })
    expect(result).toEqual(mockUser)
  })

  it("returns null when no user is found", async () => {
    vi.mocked(prisma.staffUser.findUnique).mockResolvedValueOnce(null)

    const result = await getStaffUserBySub("non-existent-sub")

    expect(prisma.staffUser.findUnique).toHaveBeenCalledWith({
      where: { sub: "non-existent-sub" },
      include: { location: true, counter: true },
    })
    expect(result).toBeNull()
  })
})
