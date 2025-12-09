import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { Role, StaffUser } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"
import { assignRole } from "@/utils/sso/assignRole"
import { unassignRole } from "@/utils/sso/unassignRole"
import { updateStaffUser } from "./updateStaffUser"

vi.mock("@/utils/db/prisma", () => ({
  prisma: {
    staffUser: {
      update: vi.fn(),
    },
  },
}))
vi.mock("@/utils/sso/assignRole")
vi.mock("@/utils/sso/unassignRole")

describe("updateStaffUser", () => {
  const mockStaffUser: StaffUser = {
    guid: "test-guid-123",
    sub: "test-sub-123",
    csrId: 5,
    username: "test.user",
    displayName: "Test User",
    officeId: 1,
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

  it("should update staff user with valid data", async () => {
    const updatedUser = {
      ...mockStaffUser,
      displayName: "Updated Name",
    }

    const user = {
      guid: mockStaffUser.guid,
      sub: mockStaffUser.sub,
      displayName: "Updated Name",
    }

    const prevUser = {
      role: mockStaffUser.role,
    }

    const availableRoles: Role[] = ["CSR", "SDM"]

    vi.mocked(prisma.staffUser.update).mockResolvedValueOnce(updatedUser)

    const result = await updateStaffUser(user, prevUser, availableRoles)

    expect(result).toEqual(updatedUser)
    expect(prisma.staffUser.update).toHaveBeenCalledWith({
      where: { guid: mockStaffUser.guid },
      data: { displayName: "Updated Name" },
    })
  })

  it("should handle role change with SSO update", async () => {
    const updatedUser = {
      ...mockStaffUser,
      role: "SDM" as Role,
    }

    const user = {
      guid: mockStaffUser.guid,
      sub: mockStaffUser.sub,
      role: "SDM" as Role,
    }

    const prevUser = {
      role: "CSR" as Role,
    }

    const availableRoles: Role[] = ["CSR", "SDM"]

    vi.mocked(prisma.staffUser.update).mockResolvedValueOnce(updatedUser)
    vi.mocked(unassignRole).mockResolvedValueOnce(undefined)
    vi.mocked(assignRole).mockResolvedValueOnce([])

    const result = await updateStaffUser(user, prevUser, availableRoles)

    expect(unassignRole).toHaveBeenCalledWith(mockStaffUser.sub, "CSR")
    expect(assignRole).toHaveBeenCalledWith(mockStaffUser.sub, "SDM")
    expect(prisma.staffUser.update).toHaveBeenCalled()
    expect(result).toEqual(updatedUser)
  })

  it("should throw error when trying to assign role without permission", async () => {
    const user = {
      guid: mockStaffUser.guid,
      sub: mockStaffUser.sub,
      role: "SDM" as Role,
    }

    const prevUser = {
      role: "CSR" as Role,
    }

    const availableRoles: Role[] = ["CSR"]

    await expect(updateStaffUser(user, prevUser, availableRoles)).rejects.toThrow(
      "You do not have permission to assign this role."
    )

    expect(prisma.staffUser.update).not.toHaveBeenCalled()
  })

  it("should return null when guid is missing", async () => {
    const user = {
      sub: mockStaffUser.sub,
    }

    const prevUser = {}
    const availableRoles: Role[] = ["CSR"]

    const result = await updateStaffUser(user, prevUser, availableRoles)

    expect(result).toBeNull()
    expect(prisma.staffUser.update).not.toHaveBeenCalled()
  })

  it("should return null when sub is missing", async () => {
    const user = {
      guid: mockStaffUser.guid,
    }

    const prevUser = {}
    const availableRoles: Role[] = ["CSR"]

    const result = await updateStaffUser(user, prevUser, availableRoles)

    expect(result).toBeNull()
    expect(prisma.staffUser.update).not.toHaveBeenCalled()
  })

  it("should not trigger role change when role is the same", async () => {
    const updatedUser = mockStaffUser

    const user = {
      guid: mockStaffUser.guid,
      sub: mockStaffUser.sub,
      role: "CSR" as Role,
    }

    const prevUser = {
      role: "CSR" as Role,
    }

    const availableRoles: Role[] = ["CSR"]

    vi.mocked(prisma.staffUser.update).mockResolvedValueOnce(updatedUser)

    await updateStaffUser(user, prevUser, availableRoles)

    expect(unassignRole).not.toHaveBeenCalled()
    expect(assignRole).not.toHaveBeenCalled()
    expect(prisma.staffUser.update).toHaveBeenCalled()
  })

  it("should not trigger SSO role change when new role is missing", async () => {
    const updatedUser = mockStaffUser

    const user = {
      guid: mockStaffUser.guid,
      sub: mockStaffUser.sub,
    }

    const prevUser = {
      role: "CSR" as Role,
    }

    const availableRoles: Role[] = ["CSR"]

    vi.mocked(prisma.staffUser.update).mockResolvedValueOnce(updatedUser)

    await updateStaffUser(user, prevUser, availableRoles)

    expect(unassignRole).not.toHaveBeenCalled()
    expect(assignRole).not.toHaveBeenCalled()
    expect(prisma.staffUser.update).toHaveBeenCalled()
  })
})
