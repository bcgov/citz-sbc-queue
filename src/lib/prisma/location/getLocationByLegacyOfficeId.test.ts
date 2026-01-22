import { beforeEach, describe, expect, it, vi } from "vitest"
import type { Location } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"
import { getLocationByLegacyOfficeId } from "./getLocationByLegacyOfficeId"

vi.mock("@/utils/db/prisma", () => ({
  prisma: {
    location: {
      findUnique: vi.fn(),
    },
  },
}))

describe("getLocationByLegacyOfficeId", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return a location when found", async () => {
    const mockLocation: Location = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Test Office",
      timezone: "America/Vancouver",
      streetAddress: "123 Test St",
      mailAddress: "",
      phoneNumber: "555-5555",
      latitude: 0,
      longitude: 0,
      legacyOfficeNumber: 123,
      deletedAt: null,
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
    }

    vi.mocked(prisma.location.findUnique).mockResolvedValueOnce(mockLocation)

    const result = await getLocationByLegacyOfficeId(123)

    expect(prisma.location.findUnique).toHaveBeenCalledWith({ where: { legacyOfficeNumber: 123 } })
    expect(result).toEqual(mockLocation)
  })

  it("should return null when no location is found", async () => {
    vi.mocked(prisma.location.findUnique).mockResolvedValueOnce(null)

    const result = await getLocationByLegacyOfficeId(999)

    expect(result).toBeNull()
  })
})
