import { beforeEach, describe, expect, it, vi } from "vitest"
import { prisma } from "@/utils/db/prisma"
import type { ServiceCategoryWithRelations } from "./types"
import { updateServiceCategory } from "./updateServiceCategory"

vi.mock("@/utils/db/prisma", () => ({
  prisma: {
    serviceCategory: {
      update: vi.fn(),
    },
  },
}))

describe("updateServiceCategory", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("updates and returns the service category when id is provided and services are set", async () => {
    const input = { id: "sc1", name: "Updated", services: [{ code: "S1" }, { code: "S2" }] }
    const mockCategory = {
      id: "sc1",
      name: "Updated",
      services: [{ code: "S1" }, { code: "S2" }],
    }

    vi.mocked(prisma.serviceCategory.update).mockResolvedValueOnce(
      mockCategory as ServiceCategoryWithRelations
    )

    const result = await updateServiceCategory(input as ServiceCategoryWithRelations)

    expect(result).toEqual(mockCategory)
    expect(prisma.serviceCategory.update).toHaveBeenCalledWith({
      where: { id: "sc1" },
      data: {
        name: "Updated",
        services: { set: [{ code: "S1" }, { code: "S2" }] },
        updatedAt: expect.any(Date),
      },
      include: { services: true },
    })
  })

  it("updates and returns the service category when id provided and no services passed", async () => {
    const input = { id: "sc2", name: "NoServices" }
    const mockCategory = { id: "sc2", name: "NoServices", services: [] }

    vi.mocked(prisma.serviceCategory.update).mockResolvedValueOnce(
      mockCategory as unknown as ServiceCategoryWithRelations
    )

    const result = await updateServiceCategory(input as ServiceCategoryWithRelations)

    expect(result).toEqual(mockCategory)
    expect(prisma.serviceCategory.update).toHaveBeenCalledWith({
      where: { id: "sc2" },
      data: { name: "NoServices", updatedAt: expect.any(Date) },
      include: { services: true },
    })
  })

  it("returns null when no id provided", async () => {
    const result = await updateServiceCategory({})
    expect(result).toBeNull()
    expect(prisma.serviceCategory.update).not.toHaveBeenCalled()
  })
})
