import { beforeEach, describe, expect, it, vi } from "vitest"
import { prisma } from "@/utils/db/prisma"
import { getAllLocations } from "./getAllLocations"
import type { LocationWithRelations } from "./types"

vi.mock("@/utils/db/prisma", () => ({
  prisma: {
    location: {
      findMany: vi.fn(),
    },
  },
}))

describe("getAllLocations", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns an array of locations sorted by name", async () => {
    const mockLocations = [
      {
        id: "loc2",
        name: "Beta Office",
        timezone: "UTC",
        streetAddress: "456 Second St",
        services: [],
        counters: [],
        staffUsers: [],
      },
      {
        id: "loc1",
        name: "Alpha Office",
        timezone: "UTC",
        streetAddress: "123 First St",
        services: [{ code: "SVC1" }],
        counters: [{ id: "c1" }],
        staffUsers: [{ guid: "u1" }],
      },
    ]

    // Return in unsorted order to test sorting
    vi.mocked(prisma.location.findMany).mockResolvedValueOnce(
      mockLocations as LocationWithRelations[]
    )

    const result = await getAllLocations()

    // Should be sorted alphabetically by name (Alpha first, Beta second)
    expect(result[0].name).toBe("Alpha Office")
    expect(result[1].name).toBe("Beta Office")
    expect(prisma.location.findMany).toHaveBeenCalledWith({
      include: { services: true, counters: true, staffUsers: true },
    })
  })

  it("returns an empty array when no locations exist", async () => {
    vi.mocked(prisma.location.findMany).mockResolvedValueOnce([])

    const result = await getAllLocations()

    expect(result).toEqual([])
    expect(prisma.location.findMany).toHaveBeenCalledWith({
      include: { services: true, counters: true, staffUsers: true },
    })
  })
})
