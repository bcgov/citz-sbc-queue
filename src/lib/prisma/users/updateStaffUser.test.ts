import { beforeEach, describe, expect, it, vi } from "vitest"
import type { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"
import { updateStaffUser } from "./updateStaffUser"

vi.mock("@/utils/db/prisma", () => ({
  prisma: {
    staffUser: {
      update: vi.fn(),
    },
  },
}))

describe("updateStaffUser", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should update a staff user by GUID", async () => {
    const mockUpdatedUser = {
      guid: "550e8400-e29b-41d4-a716-446655440000",
      sub: "550e8400-e29b-41d4-a716-446655440000@azureidir",
      csrId: 1,
      username: "updated_user",
      displayName: "Updated User",
      officeId: 1,
      counterId: 1,
      role: "CSR" as const,
      isActive: true,
      deletedAt: null,
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-02"),
      isReceptionist: false,
      isOfficeManager: false,
      isPesticideDesignate: false,
      isFinanceDesignate: false,
      isIta2Designate: false,
    }
    const whereInput: Prisma.StaffUserWhereUniqueInput = {
      guid: "550e8400-e29b-41d4-a716-446655440000",
    }
    const dataInput: Prisma.StaffUserUpdateInput = {
      displayName: "Updated User",
    }

    vi.mocked(prisma.staffUser.update).mockResolvedValueOnce(mockUpdatedUser)

    const result = await updateStaffUser(whereInput, dataInput)

    expect(result).toEqual(mockUpdatedUser)
    expect(prisma.staffUser.update).toHaveBeenCalledWith({
      where: whereInput,
      data: dataInput,
    })
    expect(prisma.staffUser.update).toHaveBeenCalledOnce()
  })

  it("should update multiple fields of a staff user", async () => {
    const mockUpdatedUser = {
      guid: "550e8400-e29b-41d4-a716-446655440001",
      sub: "550e8400-e29b-41d4-a716-4466554400001@azureidir",
      csrId: 2,
      username: "admin_user",
      displayName: "Admin User",
      officeId: 2,
      counterId: 3,
      role: "Administrator" as const,
      isActive: true,
      deletedAt: null,
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-02"),
      isReceptionist: true,
      isOfficeManager: true,
      isPesticideDesignate: false,
      isFinanceDesignate: true,
      isIta2Designate: false,
    }
    const whereInput: Prisma.StaffUserWhereUniqueInput = {
      guid: "550e8400-e29b-41d4-a716-446655440001",
    }
    const dataInput: Prisma.StaffUserUpdateInput = {
      displayName: "Admin User",
      officeId: 2,
      isReceptionist: true,
      isFinanceDesignate: true,
    }

    vi.mocked(prisma.staffUser.update).mockResolvedValueOnce(mockUpdatedUser)

    const result = await updateStaffUser(whereInput, dataInput)

    expect(result).toEqual(mockUpdatedUser)
    expect(prisma.staffUser.update).toHaveBeenCalledWith({
      where: whereInput,
      data: dataInput,
    })
  })

  it("should deactivate a staff user", async () => {
    const mockDeactivatedUser = {
      guid: "550e8400-e29b-41d4-a716-446655440002",
      sub: "550e8400-e29b-41d4-a716-446655440002@azureidir",
      csrId: 3,
      username: "inactive_user",
      displayName: "Inactive User",
      officeId: 1,
      counterId: 1,
      role: "CSR" as const,
      isActive: false,
      deletedAt: null,
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-02"),
      isReceptionist: false,
      isOfficeManager: false,
      isPesticideDesignate: false,
      isFinanceDesignate: false,
      isIta2Designate: false,
    }
    const whereInput: Prisma.StaffUserWhereUniqueInput = {
      guid: "550e8400-e29b-41d4-a716-446655440002",
    }
    const dataInput: Prisma.StaffUserUpdateInput = {
      isActive: false,
    }

    vi.mocked(prisma.staffUser.update).mockResolvedValueOnce(mockDeactivatedUser)

    const result = await updateStaffUser(whereInput, dataInput)

    expect(result).toEqual(mockDeactivatedUser)
    expect(result?.isActive).toBe(false)
  })

  it("should update a staff user by username", async () => {
    const mockUpdatedUser = {
      guid: "550e8400-e29b-41d4-a716-446655440003",
      sub: "550e8400-e29b-41d4-a716-446655440003@azureidir",
      csrId: 4,
      username: "john.doe",
      displayName: "John Doe Updated",
      officeId: 1,
      counterId: 2,
      role: "CSR" as const,
      isActive: true,
      deletedAt: null,
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-02"),
      isReceptionist: false,
      isOfficeManager: false,
      isPesticideDesignate: false,
      isFinanceDesignate: false,
      isIta2Designate: false,
    }
    const whereInput: Prisma.StaffUserWhereUniqueInput = {
      username: "john.doe",
    }
    const dataInput: Prisma.StaffUserUpdateInput = {
      displayName: "John Doe Updated",
    }

    vi.mocked(prisma.staffUser.update).mockResolvedValueOnce(mockUpdatedUser)

    const result = await updateStaffUser(whereInput, dataInput)

    expect(result).toEqual(mockUpdatedUser)
    expect(prisma.staffUser.update).toHaveBeenCalledWith({
      where: whereInput,
      data: dataInput,
    })
  })

  it("should handle updating designate flags", async () => {
    const mockUpdatedUser = {
      guid: "550e8400-e29b-41d4-a716-446655440004",
      sub: "550e8400-e29b-41d4-a716-446655440004@azureidir",
      csrId: 5,
      username: "designate_user",
      displayName: "Designate User",
      officeId: 1,
      counterId: 1,
      role: "CSR" as const,
      isActive: true,
      deletedAt: null,
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-02"),
      isReceptionist: false,
      isOfficeManager: false,
      isPesticideDesignate: true,
      isFinanceDesignate: true,
      isIta2Designate: true,
    }
    const whereInput: Prisma.StaffUserWhereUniqueInput = {
      guid: "550e8400-e29b-41d4-a716-446655440004",
    }
    const dataInput: Prisma.StaffUserUpdateInput = {
      isPesticideDesignate: true,
      isFinanceDesignate: true,
      isIta2Designate: true,
    }

    vi.mocked(prisma.staffUser.update).mockResolvedValueOnce(mockUpdatedUser)

    const result = await updateStaffUser(whereInput, dataInput)

    expect(result).toEqual(mockUpdatedUser)
    expect(result?.isPesticideDesignate).toBe(true)
    expect(result?.isFinanceDesignate).toBe(true)
    expect(result?.isIta2Designate).toBe(true)
  })

  it("should throw an error when staff user is not found", async () => {
    const whereInput: Prisma.StaffUserWhereUniqueInput = {
      guid: "non-existent-guid",
    }
    const dataInput: Prisma.StaffUserUpdateInput = {
      displayName: "Updated Name",
    }

    vi.mocked(prisma.staffUser.update).mockRejectedValueOnce(
      new Error("Record to update not found.")
    )

    await expect(updateStaffUser(whereInput, dataInput)).rejects.toThrow(
      "Record to update not found."
    )
  })

  it("should pass where and data parameters correctly to prisma.staffUser.update", async () => {
    const mockUser = {
      guid: "550e8400-e29b-41d4-a716-446655440005",
      sub: "550e8400-e29b-41d4-a716-446655440005@azureidir",
      csrId: 6,
      username: "test_user",
      displayName: "Test User",
      officeId: 1,
      counterId: 1,
      role: "CSR" as const,
      isActive: true,
      deletedAt: null,
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-02"),
      isReceptionist: false,
      isOfficeManager: false,
      isPesticideDesignate: false,
      isFinanceDesignate: false,
      isIta2Designate: false,
    }
    const whereInput: Prisma.StaffUserWhereUniqueInput = {
      csrId: 6,
    }
    const dataInput: Prisma.StaffUserUpdateInput = {
      username: "test_user",
    }

    vi.mocked(prisma.staffUser.update).mockResolvedValueOnce(mockUser)

    await updateStaffUser(whereInput, dataInput)

    expect(prisma.staffUser.update).toHaveBeenCalledWith({
      where: whereInput,
      data: dataInput,
    })
  })
})
