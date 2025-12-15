import { beforeEach, describe, expect, it, vi } from "vitest"
import { prisma } from "@/utils/db/prisma"
import { getAllStaffUsers } from "./getAllStaffUsers"

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

  it("should return all staff users", async () => {
    const mockUsers = [
      {
        sub: "550e8400-e29b-41d4-a716-446655440000@azureidir",
        guid: "550e8400-e29b-41d4-a716-446655440000",
        csrId: 1,
        username: "user1",
        displayName: "User One",
        officeId: 1,
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
        sub: "550e8400-e29b-41d4-a716-446655440001@azureidir",
        guid: "550e8400-e29b-41d4-a716-446655440001",
        csrId: 2,
        username: "user2",
        displayName: "User Two",
        officeId: 1,
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

    const result = await getAllStaffUsers()

    expect(result).toEqual(mockUsers)
  })

  it("should return an empty array when no users are found", async () => {
    vi.mocked(prisma.staffUser.findMany).mockResolvedValueOnce([])

    const result = await getAllStaffUsers()

    expect(result).toEqual([])
  })
})
