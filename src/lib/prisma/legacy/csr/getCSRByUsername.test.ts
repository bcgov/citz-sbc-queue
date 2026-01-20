import { beforeEach, describe, expect, it, vi } from "vitest"
import type { CSR } from "@/generated/prisma/client"
import { legacyPrisma } from "@/utils/db/prisma"
import { getCSRByUsername } from "./getCSRByUsername"

vi.mock("@/utils/db/prisma", () => ({
  legacyPrisma: {
    cSR: {
      findFirst: vi.fn(),
    },
  },
}))

describe("getCSRByUsername", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns a CSR when found and normalizes the username", async () => {
    const mockCsr: Partial<CSR> = {
      csrId: 1,
      username: "jdoe",
    }

    vi.mocked(legacyPrisma.cSR.findFirst).mockResolvedValueOnce(mockCsr as CSR)

    const result = await getCSRByUsername("JDoe")

    expect(vi.mocked(legacyPrisma.cSR.findFirst)).toHaveBeenCalledWith({
      where: { username: { equals: "jdoe", mode: "insensitive" } },
    })
    expect(result).toEqual(mockCsr)
  })

  it("returns null when no CSR is found", async () => {
    vi.mocked(legacyPrisma.cSR.findFirst).mockResolvedValueOnce(null)

    const result = await getCSRByUsername("nonexistent")

    expect(result).toBeNull()
  })
})
