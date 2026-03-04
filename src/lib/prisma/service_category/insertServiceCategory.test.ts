import { beforeEach, describe, expect, it, vi } from "vitest"
import type { ServiceCategory } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"
import { insertServiceCategory } from "./insertServiceCategory"
import type { ServiceCategoryWithRelations } from "./types"

vi.mock("@/utils/db/prisma", () => ({
  prisma: {
    serviceCategory: {
      create: vi.fn(),
    },
  },
}))

describe("insertServiceCategory", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("inserts and returns the created category when name and services provided", async () => {
    const input = { name: "Cat 1", services: [{ code: "S1" }, { code: "S2" }] }
    const mockCategory = {
      id: "c1",
      name: "Cat 1",
      services: [{ code: "S1" }, { code: "S2" }],
    } as unknown as ServiceCategory

    vi.mocked(prisma.serviceCategory.create).mockResolvedValueOnce(mockCategory as ServiceCategory)

    const result = await insertServiceCategory(input as ServiceCategoryWithRelations)

    expect(result).toEqual(mockCategory)
    expect(prisma.serviceCategory.create).toHaveBeenCalledWith({
      data: {
        name: "Cat 1",
        services: { connect: [{ code: "S1" }, { code: "S2" }] },
      },
      include: { services: true },
    })
  })

  it("inserts and returns the created category when only name provided", async () => {
    const input = { name: "Cat 2" }
    const mockCategory = { id: "c2", name: "Cat 2", services: [] } as unknown as ServiceCategory

    vi.mocked(prisma.serviceCategory.create).mockResolvedValueOnce(mockCategory as ServiceCategory)

    const result = await insertServiceCategory(input as ServiceCategoryWithRelations)

    expect(result).toEqual(mockCategory)
    expect(prisma.serviceCategory.create).toHaveBeenCalledWith({
      data: { name: "Cat 2" },
      include: { services: true },
    })
  })

  it("throws when name is missing and does not call prisma.create", async () => {
    await expect(insertServiceCategory({} as ServiceCategoryWithRelations)).rejects.toThrow(
      /Name is required/
    )
    expect(prisma.serviceCategory.create).not.toHaveBeenCalled()
  })
})
