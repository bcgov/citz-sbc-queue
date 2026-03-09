import { beforeEach, describe, expect, it, vi } from "vitest"
import { prisma } from "@/utils/db/prisma"
import type { LocationWithRelations } from "./types"
import { updateLocation } from "./updateLocation"

vi.mock("@/utils/db/prisma", () => ({
  prisma: {
    location: {
      update: vi.fn(),
    },
  },
}))

describe("updateLocation", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("updates and returns the location when id is provided with relations", async () => {
    const input = {
      id: "loc1",
      name: "Updated Office",
      services: [{ code: "SVC1" }, { code: "SVC2" }],
      counters: [{ id: "c1" }, { id: "c2" }],
      staffUsers: [{ guid: "u1" }, { guid: "u2" }],
    }
    const mockLocation = {
      id: "loc1",
      name: "Updated Office",
      services: [{ code: "SVC1" }, { code: "SVC2" }],
      counters: [{ id: "c1" }, { id: "c2" }],
      staffUsers: [{ guid: "u1" }, { guid: "u2" }],
    }

    vi.mocked(prisma.location.update).mockResolvedValueOnce(mockLocation as LocationWithRelations)

    const result = await updateLocation(input as LocationWithRelations)

    expect(result).toEqual(mockLocation)
    expect(prisma.location.update).toHaveBeenCalledWith({
      where: { id: "loc1" },
      data: {
        name: "Updated Office",
        services: { set: [{ code: "SVC1" }, { code: "SVC2" }] },
        counters: { set: [{ id: "c1" }, { id: "c2" }] },
        staffUsers: { set: [{ guid: "u1" }, { guid: "u2" }] },
        updatedAt: expect.any(Date),
      },
      include: { services: true, counters: true, staffUsers: true },
    })
  })

  it("updates and returns the location when id provided without relations", async () => {
    const input = { id: "loc2", name: "Simple Office" }
    const mockLocation = {
      id: "loc2",
      name: "Simple Office",
      services: [],
      counters: [],
      staffUsers: [],
    }

    vi.mocked(prisma.location.update).mockResolvedValueOnce(
      mockLocation as unknown as LocationWithRelations
    )

    const result = await updateLocation(input as LocationWithRelations)

    expect(result).toEqual(mockLocation)
    expect(prisma.location.update).toHaveBeenCalledWith({
      where: { id: "loc2" },
      data: { name: "Simple Office", updatedAt: expect.any(Date) },
      include: { services: true, counters: true, staffUsers: true },
    })
  })

  it("returns null when no id provided", async () => {
    const result = await updateLocation({})
    expect(result).toBeNull()
    expect(prisma.location.update).not.toHaveBeenCalled()
  })
})
