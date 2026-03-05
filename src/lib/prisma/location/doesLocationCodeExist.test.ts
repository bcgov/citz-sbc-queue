import { beforeEach, describe, expect, it, vi } from "vitest"
import { prisma } from "@/utils/db/prisma"
import { doesLocationCodeExist } from "./doesLocationCodeExist"

vi.mock("@/utils/db/prisma", () => ({
  prisma: {
    location: {
      findUnique: vi.fn(),
    },
  },
}))

describe("doesLocationCodeExist", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return true when location code exists", async () => {
    const mockLocation = {
      code: "LOC001",
      name: "Test Location",
      timezone: "America/Vancouver",
      streetAddress: "123 Main St",
      mailAddress: null,
      phoneNumber: null,
      latitude: 49.2827,
      longitude: -123.1207,
      legacyOfficeNumber: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(prisma.location.findUnique).mockResolvedValueOnce(mockLocation)

    const result = await doesLocationCodeExist("LOC001")

    expect(result).toBe(true)
    expect(prisma.location.findUnique).toHaveBeenCalledWith({
      where: { code: "LOC001" },
    })
  })

  it("should return false when location code does not exist", async () => {
    vi.mocked(prisma.location.findUnique).mockResolvedValueOnce(null)

    const result = await doesLocationCodeExist("NONEXISTENT")

    expect(result).toBe(false)
    expect(prisma.location.findUnique).toHaveBeenCalledWith({
      where: { code: "NONEXISTENT" },
    })
  })

  it("should handle empty string code", async () => {
    vi.mocked(prisma.location.findUnique).mockResolvedValueOnce(null)

    const result = await doesLocationCodeExist("")

    expect(result).toBe(false)
    expect(prisma.location.findUnique).toHaveBeenCalledWith({
      where: { code: "" },
    })
  })

  it("should propagate database errors", async () => {
    const dbError = new Error("Database connection failed")
    vi.mocked(prisma.location.findUnique).mockRejectedValueOnce(dbError)

    await expect(doesLocationCodeExist("LOC001")).rejects.toThrow("Database connection failed")
  })
})
