import { beforeEach, describe, expect, it, vi } from "vitest"
import type { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"
import { getStaffUsers } from "./getStaffUsers"

vi.mock("@/utils/db/prisma", () => ({
  prisma: {
    staffUser: {
      findMany: vi.fn(),
    },
  },
}))

describe("getStaffUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return all staff users when no filter is provided", async () => {
    const mockUsers = [
      {
        guid: "550e8400-e29b-41d4-a716-446655440000",
        sub: "550e8400-e29b-41d4-a716-446655440000@azureidir",
        legacyCsrId: 1,
        username: "user1",
        displayName: "User One",
        locationId: "11111111-1111-1111-1111-111111111111",
        counterId: 1,
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
      },
      {
        guid: "550e8400-e29b-41d4-a716-446655440001",
        sub: "550e8400-e29b-41d4-a716-446655440001@azureidir",
        legacyCsrId: 2,
        username: "user2",
        displayName: "User Two",
        locationId: "11111111-1111-1111-1111-111111111111",
        counterId: 2,
        role: "Administrator" as const,
        isActive: true,
        deletedAt: null,
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-01"),
        isReceptionist: false,
        isOfficeManager: true,
        isPesticideDesignate: false,
        isFinanceDesignate: false,
        isIta2Designate: false,
      },
    ]
    vi.mocked(prisma.staffUser.findMany).mockResolvedValueOnce(mockUsers)

    const result = await getStaffUsers()

    expect(result).toEqual(mockUsers)
    expect(prisma.staffUser.findMany).toHaveBeenCalledWith({ where: {} })
  })

  it("should return filtered staff users when where clause is provided", async () => {
    const allUsers = [
      {
        guid: "550e8400-e29b-41d4-a716-446655440000",
        sub: "550e8400-e29b-41d4-a716-446655440000@azureidir",
        legacyCsrId: 1,
        username: "user1",
        displayName: "User One",
        locationId: "11111111-1111-1111-1111-111111111111",
        counterId: 1,
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
      },
      {
        guid: "550e8400-e29b-41d4-a716-446655440001",
        sub: "550e8400-e29b-41d4-a716-446655440001@azureidir",
        legacyCsrId: 2,
        username: "admin1",
        displayName: "Admin One",
        locationId: "11111111-1111-1111-1111-111111111111",
        counterId: 2,
        role: "Administrator" as const,
        isActive: true,
        deletedAt: null,
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-01"),
        isReceptionist: false,
        isOfficeManager: true,
        isPesticideDesignate: false,
        isFinanceDesignate: false,
        isIta2Designate: false,
      },
    ]
    const filteredUsers = [allUsers[1]]
    const whereFilter: Prisma.StaffUserWhereInput = { role: "Administrator" }
    vi.mocked(prisma.staffUser.findMany).mockResolvedValueOnce(filteredUsers)

    const result = await getStaffUsers(whereFilter)

    expect(result).toEqual(filteredUsers)
    expect(result.length).toBe(1)
    expect(prisma.staffUser.findMany).toHaveBeenCalledWith({
      where: whereFilter,
    })
  })

  it("should return an empty array when no users are found", async () => {
    vi.mocked(prisma.staffUser.findMany).mockResolvedValueOnce([])

    const result = await getStaffUsers()

    expect(result).toEqual([])
  })
})
