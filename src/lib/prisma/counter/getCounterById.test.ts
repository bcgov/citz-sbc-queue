import { beforeEach, describe, expect, it, vi } from "vitest"
import { prisma } from "@/utils/db/prisma"
import { getCounterById } from "./getCounterById"
import type { CounterWithRelations } from "./types"

vi.mock("@/utils/db/prisma", () => ({
  prisma: {
    counter: {
      findUnique: vi.fn(),
    },
  },
}))

describe("getCounterById", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns a counter with relations when found", async () => {
    const mockCounter: CounterWithRelations = {
      id: "counter1",
      name: "Counter 1",
      createdAt: new Date("2024-03-15T10:00:00Z"),
      locations: [{ id: "loc1" }],
      staffUsers: [{ guid: "u1" }],
    } as unknown as CounterWithRelations

    vi.mocked(prisma.counter.findUnique).mockResolvedValueOnce(mockCounter)

    const result = await getCounterById("counter1")

    expect(result).toEqual(mockCounter)
    expect(prisma.counter.findUnique).toHaveBeenCalledWith({
      where: { id: "counter1" },
      include: { locations: true, staffUsers: true },
    })
  })

  it("returns null when counter is not found", async () => {
    vi.mocked(prisma.counter.findUnique).mockResolvedValueOnce(null)

    const result = await getCounterById("nonexistent")

    expect(result).toBeNull()
    expect(prisma.counter.findUnique).toHaveBeenCalledWith({
      where: { id: "nonexistent" },
      include: { locations: true, staffUsers: true },
    })
  })
})
