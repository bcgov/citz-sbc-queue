import { beforeEach, describe, expect, it, vi } from "vitest"
import { prisma } from "@/utils/db/prisma"
import { getCounterByName } from "./getCounterByName"
import type { CounterWithRelations } from "./types"

vi.mock("@/utils/db/prisma", () => ({
  prisma: {
    counter: {
      findUnique: vi.fn(),
    },
  },
}))

describe("getCounterByName", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns a counter with relations when found", async () => {
    const mockCounter = {
      id: "counter1",
      name: "Counter 1",
      createdAt: new Date("2024-03-15T10:00:00Z"),
      locations: [],
      staffUsers: [],
    } as unknown as CounterWithRelations

    vi.mocked(prisma.counter.findUnique).mockResolvedValueOnce(mockCounter)

    const result = await getCounterByName("Counter 1")

    expect(result).toEqual(mockCounter)
    expect(prisma.counter.findUnique).toHaveBeenCalledWith({
      where: { name: "Counter 1" },
      include: { locations: true, staffUsers: true },
    })
  })

  it("returns null when counter is not found", async () => {
    vi.mocked(prisma.counter.findUnique).mockResolvedValueOnce(null)

    const result = await getCounterByName("Nonexistent Counter")

    expect(result).toBeNull()
    expect(prisma.counter.findUnique).toHaveBeenCalledWith({
      where: { name: "Nonexistent Counter" },
      include: { locations: true, staffUsers: true },
    })
  })
})
