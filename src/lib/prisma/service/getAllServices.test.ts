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
      { id: "1", code: "SVC1", name: "Service 1" },
      { id: "2", code: "SVC2", name: "Service 2" },
    ] as unknown as Service[]

    vi.mocked(prisma.service.findMany).mockResolvedValueOnce(mockServices)

    const result = await getAllServices()

    expect(result).toEqual(mockServices)
  })

  it("returns an empty array when no services exist", async () => {
    vi.mocked(prisma.service.findMany).mockResolvedValueOnce([])

    const result = await getAllServices()

    expect(result).toEqual([])
  })
})
