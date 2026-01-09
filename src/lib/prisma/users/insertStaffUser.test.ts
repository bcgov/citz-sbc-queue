import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { Role } from "@/generated/prisma/enums"
import { prisma } from "@/utils/db/prisma"
import { insertStaffUser } from "./insertStaffUser"

vi.mock("@/utils/db/prisma", () => ({
  prisma: {
    staffUser: {
      create: vi.fn(),
    },
  },
}))

describe("insertStaffUser", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should create and return a staff user with valid data", async () => {
    const mockStaffUser = {
      guid: "test-id-123",
      sub: "test-sub-123",
      csrId: null,
      username: "john.doe",
      displayName: "John Doe",
      officeId: 1,
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

    const inputData = {
      guid: "test-id-123",
      sub: "test-sub-123",
      username: "john.doe",
      displayName: "John Doe",
      officeId: 1,
      role: "CSR" as Role,
    }

    vi.mocked(prisma.staffUser.create).mockResolvedValueOnce(mockStaffUser)

    const result = await insertStaffUser(inputData)

    expect(result).toEqual(mockStaffUser)
    expect(prisma.staffUser.create).toHaveBeenCalledWith({ data: inputData })
    expect(prisma.staffUser.create).toHaveBeenCalledTimes(1)
  })

  it("should pass data correctly to prisma.staffUser.create", async () => {
    const mockStaffUser = {
      guid: "test-id-456",
      sub: "test-sub-456",
      csrId: 10,
      username: "jane.smith",
      displayName: "Jane Smith",
      officeId: 2,
      counterId: 5,
      role: "CSR" as Role,
      isActive: true,
      deletedAt: null,
      createdAt: new Date("2025-01-02"),
      updatedAt: new Date("2025-01-02"),
      isReceptionist: false,
      isOfficeManager: true,
      isPesticideDesignate: false,
      isFinanceDesignate: true,
      isIta2Designate: false,
    }

    const inputData = {
      guid: "test-id-456",
      sub: "test-sub-456",
      csrId: 10,
      username: "jane.smith",
      displayName: "Jane Smith",
      officeId: 2,
      counterId: 5,
      role: "CSR" as Role,
    }

    vi.mocked(prisma.staffUser.create).mockResolvedValueOnce(mockStaffUser)

    await insertStaffUser(inputData)

    expect(prisma.staffUser.create).toHaveBeenCalledWith({ data: inputData })
  })

  it("should handle database errors gracefully", async () => {
    const inputData = {
      guid: "test-id-error",
      sub: "test-sub-error",
      username: "error.user",
      displayName: "Error User",
      officeId: 1,
      role: "CSR" as Role,
    }

    const dbError = new Error("Database connection failed")
    vi.mocked(prisma.staffUser.create).mockRejectedValueOnce(dbError)

    await expect(insertStaffUser(inputData)).rejects.toThrow("Database connection failed")
  })
})
