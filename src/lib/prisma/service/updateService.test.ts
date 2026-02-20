import { beforeEach, describe, expect, it, vi } from "vitest"
import { prisma } from "@/utils/db/prisma"
import type { ServiceWithRelations } from "./types"
import { updateService } from "./updateService"

vi.mock("@/utils/db/prisma", () => ({
  prisma: {
    service: {
      update: vi.fn(),
    },
  },
}))

describe("updateService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("updates and returns the service when service.code is provided", async () => {
    const input = { code: "SVC1", name: "Updated" }
    const mockService = {
      id: "1",
      code: "SVC1",
      name: "Updated",
      locations: [],
    } as unknown as ServiceWithRelations

    vi.mocked(prisma.service.update).mockResolvedValueOnce(mockService)

    const result = await updateService(input as ServiceWithRelations, {})

    expect(result).toEqual(mockService)
    expect(prisma.service.update).toHaveBeenCalledWith({
      where: { code: "SVC1" },
      data: { name: "Updated", updatedAt: expect.any(Date) },
      include: { locations: true },
    })
  })

  it("falls back to prevService.code when service.code is missing", async () => {
    const input = { name: "Updated2" }
    const prev = { code: "OLD" }
    const mockService = {
      id: "2",
      code: "OLD",
      name: "Updated2",
      locations: [],
    } as unknown as ServiceWithRelations

    vi.mocked(prisma.service.update).mockResolvedValueOnce(mockService)

    const result = await updateService(input as ServiceWithRelations, prev as ServiceWithRelations)

    expect(result).toEqual(mockService)
    expect(prisma.service.update).toHaveBeenCalledWith({
      where: { code: "OLD" },
      data: { name: "Updated2", updatedAt: expect.any(Date) },
      include: { locations: true },
    })
  })

  it("returns null when no code provided and no prevService.code", async () => {
    const result = await updateService({}, {})
    expect(result).toBeNull()
    expect(prisma.service.update).not.toHaveBeenCalled()
  })
})
