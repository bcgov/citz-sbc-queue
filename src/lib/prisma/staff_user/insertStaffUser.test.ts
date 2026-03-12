import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { StaffUser } from "@/generated/prisma/client"
import type { Role } from "@/generated/prisma/enums"
import { prisma } from "@/utils/db/prisma"
import { assignRole } from "@/utils/sso/assignRole"
import { insertStaffUser } from "./insertStaffUser"

vi.mock("@/utils/db/prisma", () => ({
  prisma: {
    staffUser: {
      create: vi.fn(),
    },
  },
}))

vi.mock("@/utils/sso/assignRole", () => ({
  assignRole: vi.fn(),
}))

describe("insertStaffUser (staff_user)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("creates a staff user and assigns SSO role", async () => {
    const inputData = {
      guid: "guid-123",
      sub: "sub-123",
      username: "j.doe",
      displayName: "J Doe",
      role: "CSR" as Role,
    }

    const mockCreated = {
      guid: inputData.guid,
      sub: inputData.sub,
      legacyCsrId: null,
      username: inputData.username,
      displayName: inputData.displayName,
      locationCode: null,
      counterId: null,
      role: "CSR" as Role,
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

    vi.mocked(assignRole).mockResolvedValueOnce(["CSR"] as unknown as string[])
    vi.mocked(prisma.staffUser.create).mockResolvedValueOnce(mockCreated)

    const result = await insertStaffUser(inputData)

    expect(assignRole).toHaveBeenCalledWith(inputData.sub, inputData.role)
    expect(prisma.staffUser.create).toHaveBeenCalledWith({
      data: { ...inputData },
      include: { location: true, counter: true },
    })
    expect(result).toEqual(mockCreated)
  })

  it("throws error when guid is missing", async () => {
    const inputData = {
      sub: "s",
      role: "CSR" as Role,
    } as unknown as StaffUser

    await expect(insertStaffUser(inputData)).rejects.toThrow(
      "GUID, SUB, and Role are required to insert a staff user."
    )
    expect(assignRole).not.toHaveBeenCalled()
    expect(prisma.staffUser.create).not.toHaveBeenCalled()
  })

  it("throws error when sub is missing", async () => {
    const inputData = {
      guid: "g",
      role: "CSR" as Role,
    } as unknown as StaffUser

    await expect(insertStaffUser(inputData)).rejects.toThrow(
      "GUID, SUB, and Role are required to insert a staff user."
    )
    expect(assignRole).not.toHaveBeenCalled()
    expect(prisma.staffUser.create).not.toHaveBeenCalled()
  })

  it("throws error when role is missing", async () => {
    const inputData = {
      guid: "g",
      sub: "s",
    } as unknown as StaffUser

    await expect(insertStaffUser(inputData)).rejects.toThrow(
      "GUID, SUB, and Role are required to insert a staff user."
    )
    expect(assignRole).not.toHaveBeenCalled()
    expect(prisma.staffUser.create).not.toHaveBeenCalled()
  })

  it("propagates SSO assignRole errors", async () => {
    const inputData = {
      guid: "g",
      sub: "s",
      username: "u",
      displayName: "d",
      role: "CSR" as Role,
    }
    const ssoError = new Error("SSO failed")
    vi.mocked(assignRole).mockRejectedValueOnce(ssoError)

    await expect(insertStaffUser(inputData)).rejects.toThrow("SSO failed")
    expect(prisma.staffUser.create).not.toHaveBeenCalled()
  })

  it("propagates database errors from prisma.create", async () => {
    const inputData = {
      guid: "g2",
      sub: "s2",
      username: "u2",
      displayName: "d2",
      role: "CSR" as Role,
    }
    const dbError = new Error("DB failed")
    vi.mocked(assignRole).mockResolvedValueOnce(["CSR"] as Role[])
    vi.mocked(prisma.staffUser.create).mockRejectedValueOnce(dbError)

    await expect(insertStaffUser(inputData)).rejects.toThrow("DB failed")
  })
})
