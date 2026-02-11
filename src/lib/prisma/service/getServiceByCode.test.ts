import { beforeEach, describe, expect, it, vi } from "vitest"
import type { Service } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"
import { getServiceByCode } from "./getServiceByCode"

vi.mock("@/utils/db/prisma", () => ({
  prisma: {
    service: {
      findUnique: vi.fn(),
    },
  },
}))

describe("getServiceByCode", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns the service when found", async () => {
    const mockService = {
      id: "1",
      code: "SVC1",
      name: "Service 1",
    } as unknown as Service

    vi.mocked(prisma.service.findUnique).mockResolvedValueOnce(mockService)

    const result = await getServiceByCode("SVC1")

    expect(result).toEqual(mockService)
  })

  it("returns null when service not found", async () => {
    vi.mocked(prisma.service.findUnique).mockResolvedValueOnce(null)

    const result = await getServiceByCode("NOPE")

    expect(result).toBeNull()
  })
})
