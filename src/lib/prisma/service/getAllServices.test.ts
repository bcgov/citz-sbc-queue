import { beforeEach, describe, expect, it, vi } from "vitest"
import type { Service } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"
import { getAllServices } from "./getAllServices"

vi.mock("@/utils/db/prisma", () => ({
  prisma: {
    service: {
      findMany: vi.fn(),
    },
  },
}))

describe("getAllServices", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns an array of services when services exist", async () => {
    const mockServices = [
      {
        id: "1",
        code: "SVC1",
        name: "Service 1",
        createdAt: new Date("2020-01-01"),
        locations: [],
      },
      {
        id: "2",
        code: "SVC2",
        name: "Service 2",
        createdAt: new Date("2021-01-01"),
        locations: [],
      },
    ] as unknown as Service[]

    // return in unsorted order (older first) so the function's sorting is exercised
    vi.mocked(prisma.service.findMany).mockResolvedValueOnce([mockServices[0], mockServices[1]])

    const result = await getAllServices()

    // should include locations and be sorted by createdAt descending (newest first)
    expect(prisma.service.findMany).toHaveBeenCalledWith({
      include: { locations: true, categories: true },
    })
    expect(result).toEqual([mockServices[1], mockServices[0]])
  })

  it("returns an empty array when no services exist", async () => {
    vi.mocked(prisma.service.findMany).mockResolvedValueOnce([])

    const result = await getAllServices()

    expect(result).toEqual([])
  })
})
