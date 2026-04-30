import { beforeEach, describe, expect, it, vi } from "vitest"
import { prisma } from "@/utils/db/prisma"
import { getAllCounters } from "./getAllCounters"
import type { CounterWithRelations } from "./types"

vi.mock("@/utils/db/prisma", () => ({
  prisma: {
    counter: {
      findMany: vi.fn(),
    },
  },
}))

describe("getAllCounters", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns counters sorted by createdAt descending (newest first)", async () => {
    const mockCounters = [
      {
        id: "counter1",
        name: "Counter 1",
        createdAt: new Date("2024-01-01T00:00:00Z"),
        locations: [],
        staffUsers: [],
      },
      {
        id: "counter2",
        name: "Counter 2",
        createdAt: new Date("2024-06-01T00:00:00Z"),
        locations: [{ id: "loc1" }],
        staffUsers: [{ guid: "u1" }],
      },
    ]

    // Return in ascending order to verify sorting is applied
    vi.mocked(prisma.counter.findMany).mockResolvedValueOnce(
      mockCounters as unknown as CounterWithRelations[]
    )

    const result = await getAllCounters()

    // Newest first (counter2 created June, counter1 created January)
    expect(result[0].id).toBe("counter2")
    expect(result[1].id).toBe("counter1")
    expect(prisma.counter.findMany).toHaveBeenCalledWith({
      include: { locations: true, staffUsers: true },
    })
  })

  it("returns an empty array when no counters exist", async () => {
    vi.mocked(prisma.counter.findMany).mockResolvedValueOnce([])

    const result = await getAllCounters()

    expect(result).toEqual([])
    expect(prisma.counter.findMany).toHaveBeenCalledWith({
      include: { locations: true, staffUsers: true },
    })
  })

  it("returns a single counter without sorting issues", async () => {
    const mockCounter = {
      id: "counter1",
      name: "Counter 1",
      createdAt: new Date("2024-03-15T10:00:00Z"),
      locations: [],
      staffUsers: [],
    }

    vi.mocked(prisma.counter.findMany).mockResolvedValueOnce([
      mockCounter as unknown as CounterWithRelations,
    ])

    const result = await getAllCounters()

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("counter1")
  })
})
