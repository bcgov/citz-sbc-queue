import { beforeEach, describe, expect, it, vi } from "vitest"
import type { Service } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"
import { doesServiceCodeExist } from "./doesServiceCodeExist"

vi.mock("@/utils/db/prisma", () => ({
  prisma: {
    service: {
      findUnique: vi.fn(),
    },
  },
}))

describe("doesServiceCodeExist", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns true when service exists", async () => {
    vi.mocked(prisma.service.findUnique).mockResolvedValueOnce({
      id: "1",
      code: "SVC1",
    } as unknown as Service)

    const result = await doesServiceCodeExist("SVC1")

    expect(result).toBe(true)
  })

  it("returns false when service does not exist", async () => {
    vi.mocked(prisma.service.findUnique).mockResolvedValueOnce(null)

    const result = await doesServiceCodeExist("NOPE")

    expect(result).toBe(false)
  })
})
