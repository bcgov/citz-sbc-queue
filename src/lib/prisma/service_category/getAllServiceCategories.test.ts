import { beforeEach, describe, expect, it, vi } from "vitest"
import type { ServiceCategory } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"
import { getAllServiceCategories } from "./getAllServiceCategories"

vi.mock("@/utils/db/prisma", () => ({
  prisma: {
    serviceCategory: {
      findMany: vi.fn(),
    },
  },
}))

describe("getAllServiceCategories", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns an array of categories when categories exist", async () => {
    const mockCategories = [
      {
        id: "1",
        name: "Category 1",
        createdAt: new Date("2020-01-01"),
        services: [],
      },
      {
        id: "2",
        name: "Category 2",
        createdAt: new Date("2021-01-01"),
        services: [],
      },
    ] as unknown as ServiceCategory[]

    // return in unsorted order so the function's sorting is exercised
    vi.mocked(prisma.serviceCategory.findMany).mockResolvedValueOnce([
      mockCategories[0],
      mockCategories[1],
    ])

    const result = await getAllServiceCategories()

    expect(prisma.serviceCategory.findMany).toHaveBeenCalledWith({ include: { services: true } })
    expect(result).toEqual([mockCategories[1], mockCategories[0]])
  })

  it("returns an empty array when no categories exist", async () => {
    vi.mocked(prisma.serviceCategory.findMany).mockResolvedValueOnce([])

    const result = await getAllServiceCategories()

    expect(result).toEqual([])
  })
})
