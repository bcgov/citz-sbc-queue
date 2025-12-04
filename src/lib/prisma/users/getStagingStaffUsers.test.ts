import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { Role, StagingStaffUser } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"
import { getStagingStaffUsers } from "./getStagingStaffUsers"

vi.mock("@/utils/db/prisma", () => ({
  prisma: {
    stagingStaffUser: {
      findMany: vi.fn(),
    },
  },
}))

describe("getStagingStaffUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it("should return all staging staff users when no filter is provided", async () => {
    const mockUsers: StagingStaffUser[] = [
      {
        id: 1,
        username: "user1",
        officeId: 1,
        counterId: null,
        role: "STAFF" as Role,
        deletedAt: null,
        isReceptionist: false,
        isOfficeManager: false,
        isPesticideDesignate: false,
        isFinanceDesignate: false,
        isIta2Designate: false,
      },
      {
        id: 2,
        username: "user2",
        officeId: 2,
        counterId: 1,
        role: "STAFF" as Role,
        deletedAt: null,
        isReceptionist: true,
        isOfficeManager: false,
        isPesticideDesignate: false,
        isFinanceDesignate: false,
        isIta2Designate: false,
      },
    ]

    vi.mocked(prisma.stagingStaffUser.findMany).mockResolvedValueOnce(mockUsers)

    const result = await getStagingStaffUsers()

    expect(result).toEqual(mockUsers)
    expect(prisma.stagingStaffUser.findMany).toHaveBeenCalledWith({
      where: {},
    })
  })

  it("should return filtered staging staff users when where filter is provided", async () => {
    const mockUser: StagingStaffUser[] = [
      {
        id: 1,
        username: "user1",
        officeId: 1,
        counterId: null,
        role: "STAFF" as Role,
        deletedAt: null,
        isReceptionist: false,
        isOfficeManager: true,
        isPesticideDesignate: false,
        isFinanceDesignate: false,
        isIta2Designate: false,
      },
    ]

    const whereFilter = { username: "user1" }

    vi.mocked(prisma.stagingStaffUser.findMany).mockResolvedValueOnce(mockUser)

    const result = await getStagingStaffUsers(whereFilter)

    expect(result).toEqual(mockUser)
    expect(prisma.stagingStaffUser.findMany).toHaveBeenCalledWith({
      where: whereFilter,
    })
  })

  it("should return an empty array when no users are found", async () => {
    vi.mocked(prisma.stagingStaffUser.findMany).mockResolvedValueOnce([])

    const result = await getStagingStaffUsers()

    expect(result).toEqual([])
    expect(prisma.stagingStaffUser.findMany).toHaveBeenCalledWith({
      where: {},
    })
  })

  it("should handle database errors gracefully", async () => {
    const error = new Error("Database connection failed")
    vi.mocked(prisma.stagingStaffUser.findMany).mockRejectedValueOnce(error)

    await expect(getStagingStaffUsers()).rejects.toThrow("Database connection failed")
  })
})
