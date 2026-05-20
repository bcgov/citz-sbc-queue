import { beforeEach, describe, expect, it, vi } from "vitest"
import { prisma } from "@/utils/db/prisma"
import { deleteCounter } from "./deleteCounter"

vi.mock("@/utils/db/prisma", () => ({
  prisma: {
    counter: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    staffUser: {
      updateMany: vi.fn(),
    },
  },
}))

describe("deleteCounter", () => {
  const mockCounter = {
    id: "COUNTER-001",
    name: "My Counter",
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockDefaultCounter = {
    id: "DEFAULT-COUNTER",
    name: "Counter",
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns false when the counter does not exist", async () => {
    vi.mocked(prisma.counter.findUnique).mockResolvedValueOnce(null)

    const result = await deleteCounter("COUNTER-001")

    expect(result).toBe(false)
    expect(prisma.staffUser.updateMany).not.toHaveBeenCalled()
    expect(prisma.counter.delete).not.toHaveBeenCalled()
  })

  it("reassigns staff users to the default counter and deletes the counter", async () => {
    vi.mocked(prisma.counter.findUnique)
      .mockResolvedValueOnce(mockCounter)
      .mockResolvedValueOnce(mockDefaultCounter)
    vi.mocked(prisma.staffUser.updateMany).mockResolvedValueOnce({ count: 2 })
    vi.mocked(prisma.counter.delete).mockResolvedValueOnce(mockCounter)

    const result = await deleteCounter("COUNTER-001")

    expect(result).toBe(true)
    expect(prisma.staffUser.updateMany).toHaveBeenCalledWith({
      where: { counterId: "COUNTER-001" },
      data: { counterId: "DEFAULT-COUNTER" },
    })
    expect(prisma.counter.delete).toHaveBeenCalledWith({ where: { id: "COUNTER-001" } })
  })

  it("sets counterId to null when the default counter does not exist", async () => {
    vi.mocked(prisma.counter.findUnique)
      .mockResolvedValueOnce(mockCounter)
      .mockResolvedValueOnce(null)
    vi.mocked(prisma.staffUser.updateMany).mockResolvedValueOnce({ count: 1 })
    vi.mocked(prisma.counter.delete).mockResolvedValueOnce(mockCounter)

    await deleteCounter("COUNTER-001")

    expect(prisma.staffUser.updateMany).toHaveBeenCalledWith({
      where: { counterId: "COUNTER-001" },
      data: { counterId: null },
    })
  })

  it("proceeds with deletion even when no staff users are assigned", async () => {
    vi.mocked(prisma.counter.findUnique)
      .mockResolvedValueOnce(mockCounter)
      .mockResolvedValueOnce(mockDefaultCounter)
    vi.mocked(prisma.staffUser.updateMany).mockResolvedValueOnce({ count: 0 })
    vi.mocked(prisma.counter.delete).mockResolvedValueOnce(mockCounter)

    const result = await deleteCounter("COUNTER-001")

    expect(result).toBe(true)
    expect(prisma.counter.delete).toHaveBeenCalledWith({ where: { id: "COUNTER-001" } })
  })

  it("propagates database errors", async () => {
    vi.mocked(prisma.counter.findUnique).mockResolvedValueOnce(mockCounter)
    vi.mocked(prisma.counter.findUnique).mockResolvedValueOnce(mockDefaultCounter)
    vi.mocked(prisma.staffUser.updateMany).mockResolvedValueOnce({ count: 0 })
    vi.mocked(prisma.counter.delete).mockRejectedValueOnce(new Error("Database connection failed"))

    await expect(deleteCounter("COUNTER-001")).rejects.toThrow("Database connection failed")
  })
})
