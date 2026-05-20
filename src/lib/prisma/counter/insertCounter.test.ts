import { beforeEach, describe, expect, it, vi } from "vitest"
import { prisma } from "@/utils/db/prisma"
import { insertCounter } from "./insertCounter"
import type { CounterWithRelations } from "./types"

vi.mock("@/utils/db/prisma", () => ({
  prisma: {
    counter: {
      create: vi.fn(),
    },
  },
}))

describe("insertCounter", () => {
  const mockLocationBase = {
    code: "LOC001",
    name: "Location 1",
    timezone: "America/Vancouver",
    streetAddress: "123 Main St",
    mailAddress: null,
    phoneNumber: null,
    latitude: 49.2827,
    longitude: -123.1207,
    legacyOfficeNumber: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockStaffUserBase = {
    guid: "USER-GUID-001",
    sub: "user-sub-001",
    legacyCsrId: null,
    username: "jsmith",
    displayName: "Jane Smith",
    locationCode: "LOC001",
    counterId: null,
    role: "CSR" as const,
    isActive: true,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    isReceptionist: false,
    isOfficeManager: false,
    isPesticideDesignate: false,
    isFinanceDesignate: false,
    isIta2Designate: false,
    isDeveloper: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("inserts and returns the created counter when name is provided", async () => {
    const input = { name: "Counter 1" }
    const mockCounter: CounterWithRelations = {
      id: "COUNTER-001",
      name: "Counter 1",
      createdAt: new Date(),
      updatedAt: new Date(),
      locations: [],
      staffUsers: [],
    }
    vi.mocked(prisma.counter.create).mockResolvedValueOnce(mockCounter)

    const result = await insertCounter(input)

    expect(result).toEqual(mockCounter)
    expect(prisma.counter.create).toHaveBeenCalledWith({
      data: { name: "Counter 1" },
      include: { locations: true, staffUsers: true },
    })
  })

  it("throws when name is missing and does not call prisma.create", async () => {
    await expect(insertCounter({})).rejects.toThrow("Name is required to insert a counter.")
    expect(prisma.counter.create).not.toHaveBeenCalled()
  })

  it("connects locations when provided", async () => {
    const mockCounter: CounterWithRelations = {
      id: "COUNTER-001",
      name: "Counter 1",
      createdAt: new Date(),
      updatedAt: new Date(),
      locations: [mockLocationBase],
      staffUsers: [],
    }
    vi.mocked(prisma.counter.create).mockResolvedValueOnce(mockCounter)

    await insertCounter({ name: "Counter 1", locations: [mockLocationBase] })

    expect(prisma.counter.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        locations: { connect: [{ code: "LOC001" }] },
      }),
      include: { locations: true, staffUsers: true },
    })
  })

  it("connects staffUsers when provided", async () => {
    const mockCounter: CounterWithRelations = {
      id: "COUNTER-001",
      name: "Counter 1",
      createdAt: new Date(),
      updatedAt: new Date(),
      locations: [],
      staffUsers: [mockStaffUserBase],
    }
    vi.mocked(prisma.counter.create).mockResolvedValueOnce(mockCounter)

    await insertCounter({ name: "Counter 1", staffUsers: [mockStaffUserBase] })

    expect(prisma.counter.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        staffUsers: { connect: [{ guid: "USER-GUID-001" }] },
      }),
      include: { locations: true, staffUsers: true },
    })
  })

  it("does not include empty relation connects when arrays are empty", async () => {
    const mockCounter: CounterWithRelations = {
      id: "COUNTER-001",
      name: "Counter 1",
      createdAt: new Date(),
      updatedAt: new Date(),
      locations: [],
      staffUsers: [],
    }
    vi.mocked(prisma.counter.create).mockResolvedValueOnce(mockCounter)

    await insertCounter({ name: "Counter 1", locations: [], staffUsers: [] })

    expect(prisma.counter.create).toHaveBeenCalledWith({
      data: expect.not.objectContaining({
        locations: expect.anything(),
        staffUsers: expect.anything(),
      }),
      include: { locations: true, staffUsers: true },
    })
  })

  it("propagates database errors", async () => {
    const dbError = new Error("Database connection failed")
    vi.mocked(prisma.counter.create).mockRejectedValueOnce(dbError)

    await expect(insertCounter({ name: "Counter 1" })).rejects.toThrow("Database connection failed")
  })
})
