import { beforeEach, describe, expect, it, vi } from "vitest"
import { prisma } from "@/utils/db/prisma"
import { insertLocation } from "./insertLocation"
import type { LocationWithRelations } from "./types"

vi.mock("@/utils/db/prisma", () => ({
  prisma: {
    location: {
      create: vi.fn(),
    },
  },
}))

describe("insertLocation", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("inserts and returns the created location when name is provided with relations", async () => {
    const input = {
      name: "New Office",
      timezone: "UTC",
      streetAddress: "456 Main St",
      services: [{ code: "SVC1" }],
      counters: [{ id: "c1" }],
      staffUsers: [{ guid: "u1" }],
    }
    const mockLocation = {
      id: "loc1",
      name: "New Office",
      timezone: "UTC",
      streetAddress: "456 Main St",
      services: [{ code: "SVC1" }],
      counters: [{ id: "c1" }],
      staffUsers: [{ guid: "u1" }],
    }

    vi.mocked(prisma.location.create).mockResolvedValueOnce(mockLocation as LocationWithRelations)

    const result = await insertLocation(input as Partial<LocationWithRelations>)

    expect(result).toEqual(mockLocation)
    expect(prisma.location.create).toHaveBeenCalledWith({
      data: {
        name: "New Office",
        timezone: "UTC",
        streetAddress: "456 Main St",
        services: { connect: [{ code: "SVC1" }] },
        counters: { connect: [{ id: "c1" }] },
        staffUsers: { connect: [{ guid: "u1" }] },
      },
      include: { services: true, counters: true, staffUsers: true },
    })
  })

  it("inserts and returns the created location when only name is provided", async () => {
    const input = { name: "Simple Office" }
    const mockLocation = {
      id: "loc2",
      name: "Simple Office",
      services: [],
      counters: [],
      staffUsers: [],
    }

    vi.mocked(prisma.location.create).mockResolvedValueOnce(
      mockLocation as unknown as LocationWithRelations
    )

    const result = await insertLocation(input as Partial<LocationWithRelations>)

    expect(result).toEqual(mockLocation)
    expect(prisma.location.create).toHaveBeenCalledWith({
      data: { name: "Simple Office" },
      include: { services: true, counters: true, staffUsers: true },
    })
  })

  it("throws when name is missing", async () => {
    const input = { timezone: "UTC" }

    await expect(insertLocation(input as Partial<LocationWithRelations>)).rejects.toThrow(
      /Name is required to insert a location/
    )

    expect(prisma.location.create).not.toHaveBeenCalled()
  })
})
