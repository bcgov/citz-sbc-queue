import { beforeEach, describe, expect, it, vi } from "vitest"
import { prisma } from "@/utils/db/prisma"
import { getLocationByCode } from "./getLocationByCode"
import type { LocationWithRelations } from "./types"

vi.mock("@/utils/db/prisma", () => ({
  prisma: {
    location: {
      findUnique: vi.fn(),
    },
  },
}))

describe("getLocationByCode", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns a location when found", async () => {
    const mockLocation = {
      code: "loc1",
      name: "Office 1",
      timezone: "UTC",
      streetAddress: "123 Test St",
      services: [{ code: "SVC1" }],
      counters: [{ id: "c1" }],
      staffUsers: [{ guid: "u1" }],
    }

    vi.mocked(prisma.location.findUnique).mockResolvedValueOnce(
      mockLocation as LocationWithRelations
    )

    const result = await getLocationByCode("loc1")

    expect(result).toEqual(mockLocation)
    expect(prisma.location.findUnique).toHaveBeenCalledWith({
      where: { code: "loc1" },
      include: { services: true, counters: true, staffUsers: true },
    })
  })

  it("returns null when location is not found", async () => {
    vi.mocked(prisma.location.findUnique).mockResolvedValueOnce(null)

    const result = await getLocationByCode("nonexistent")

    expect(result).toBeNull()
    expect(prisma.location.findUnique).toHaveBeenCalledWith({
      where: { code: "nonexistent" },
      include: { services: true, counters: true, staffUsers: true },
    })
  })
})
