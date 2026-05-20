import { beforeEach, describe, expect, it, vi } from "vitest"
import { prisma } from "@/utils/db/prisma"
import type { CounterWithRelations } from "./types"
import { updateCounter } from "./updateCounter"

vi.mock("@/utils/db/prisma", () => ({
  prisma: {
    counter: {
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    staffUser: {
      updateMany: vi.fn(),
    },
  },
}))

describe("updateCounter", () => {
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
    counterId: "COUNTER-001",
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

  const mockCounterBase = {
    id: "COUNTER-001",
    name: "Counter 1",
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockCounterWithRelations: CounterWithRelations = {
    ...mockCounterBase,
    locations: [mockLocationBase],
    staffUsers: [mockStaffUserBase],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns null when neither id nor prevCounter.id is provided", async () => {
    const result = await updateCounter({}, {})

    expect(result).toBeNull()
    expect(prisma.counter.update).not.toHaveBeenCalled()
  })

  it("returns null when only prevCounter.id is missing and id is not provided", async () => {
    const result = await updateCounter({ name: "Updated Name" }, { id: undefined })

    expect(result).toBeNull()
  })

  it("updates counter with basic fields using provided id", async () => {
    const updatedCounter = { ...mockCounterWithRelations, name: "Updated Counter" }
    vi.mocked(prisma.counter.update).mockResolvedValueOnce(updatedCounter)

    const result = await updateCounter(
      { id: "COUNTER-001", name: "Updated Counter" },
      { id: "COUNTER-001" }
    )

    expect(result).toEqual(updatedCounter)
    expect(prisma.counter.update).toHaveBeenCalledWith({
      where: { id: "COUNTER-001" },
      data: expect.objectContaining({
        name: "Updated Counter",
        updatedAt: expect.any(Date),
      }),
      include: { locations: true, staffUsers: true },
    })
  })

  it("updates counter using prevCounter.id when id is not provided", async () => {
    const updatedCounter = { ...mockCounterWithRelations, name: "Updated Counter" }
    vi.mocked(prisma.counter.update).mockResolvedValueOnce(updatedCounter)

    const result = await updateCounter({ name: "Updated Counter" }, { id: "COUNTER-001" })

    expect(result).toEqual(updatedCounter)
    expect(prisma.counter.update).toHaveBeenCalledWith({
      where: { id: "COUNTER-001" },
      data: expect.objectContaining({
        name: "Updated Counter",
        updatedAt: expect.any(Date),
      }),
      include: { locations: true, staffUsers: true },
    })
  })

  it("updates locations when provided", async () => {
    const newLocation = { ...mockLocationBase, code: "LOC002", name: "Location 2" }
    const updatedCounter = { ...mockCounterWithRelations, locations: [newLocation] }
    vi.mocked(prisma.counter.update).mockResolvedValueOnce(updatedCounter)

    const result = await updateCounter(
      { id: "COUNTER-001", locations: [newLocation] },
      { id: "COUNTER-001" }
    )

    expect(result).toEqual(updatedCounter)
    expect(prisma.counter.update).toHaveBeenCalledWith({
      where: { id: "COUNTER-001" },
      data: expect.objectContaining({
        locations: { set: [{ code: "LOC002" }] },
        updatedAt: expect.any(Date),
      }),
      include: { locations: true, staffUsers: true },
    })
  })

  it("updates staffUsers when provided", async () => {
    const newUser = { ...mockStaffUserBase, guid: "USER-GUID-002", displayName: "John Doe" }
    const updatedCounter = { ...mockCounterWithRelations, staffUsers: [newUser] }
    vi.mocked(prisma.counter.update).mockResolvedValueOnce(updatedCounter)

    const result = await updateCounter(
      { id: "COUNTER-001", staffUsers: [newUser] },
      { id: "COUNTER-001" }
    )

    expect(result).toEqual(updatedCounter)
    expect(prisma.counter.update).toHaveBeenCalledWith({
      where: { id: "COUNTER-001" },
      data: expect.objectContaining({
        staffUsers: { set: [{ guid: "USER-GUID-002" }] },
        updatedAt: expect.any(Date),
      }),
      include: { locations: true, staffUsers: true },
    })
  })

  it("updates multiple fields and relations together", async () => {
    const newLocation = { ...mockLocationBase, code: "LOC002", name: "Location 2" }
    const newUser = { ...mockStaffUserBase, guid: "USER-GUID-002", displayName: "John Doe" }
    const updatedCounter = {
      ...mockCounterWithRelations,
      name: "Updated Counter",
      locations: [newLocation],
      staffUsers: [newUser],
    }
    vi.mocked(prisma.counter.update).mockResolvedValueOnce(updatedCounter)

    const result = await updateCounter(
      {
        id: "COUNTER-001",
        name: "Updated Counter",
        locations: [newLocation],
        staffUsers: [newUser],
      },
      { id: "COUNTER-001" }
    )

    expect(result).toEqual(updatedCounter)
    expect(prisma.counter.update).toHaveBeenCalledWith({
      where: { id: "COUNTER-001" },
      data: expect.objectContaining({
        name: "Updated Counter",
        locations: { set: [{ code: "LOC002" }] },
        staffUsers: { set: [{ guid: "USER-GUID-002" }] },
        updatedAt: expect.any(Date),
      }),
      include: { locations: true, staffUsers: true },
    })
  })

  it("does not update relations if not provided", async () => {
    const updatedCounter = { ...mockCounterWithRelations, name: "Updated Counter" }
    vi.mocked(prisma.counter.update).mockResolvedValueOnce(updatedCounter)

    await updateCounter({ id: "COUNTER-001", name: "Updated Counter" }, { id: "COUNTER-001" })

    expect(prisma.counter.update).toHaveBeenCalledWith({
      where: { id: "COUNTER-001" },
      data: expect.not.objectContaining({
        locations: expect.anything(),
        staffUsers: expect.anything(),
      }),
      include: { locations: true, staffUsers: true },
    })
  })

  it("propagates database errors", async () => {
    const dbError = new Error("Database connection failed")
    vi.mocked(prisma.counter.update).mockRejectedValueOnce(dbError)

    await expect(
      updateCounter({ id: "COUNTER-001", name: "Updated" }, { id: "COUNTER-001" })
    ).rejects.toThrow("Database connection failed")
  })

  describe("location removal — staff user reassignment", () => {
    const mockDefaultCounter = {
      id: "DEFAULT-COUNTER",
      name: "Counter",
      createdAt: new Date(),
      updatedAt: new Date(),
      locations: [],
      staffUsers: [],
    }

    it("reassigns staff at removed locations to the default counter", async () => {
      const removedLocation = { ...mockLocationBase, code: "LOC002", name: "Location 2" }
      const updatedCounter = {
        ...mockCounterWithRelations,
        locations: [mockLocationBase],
      }
      vi.mocked(prisma.counter.findUnique).mockResolvedValueOnce(mockDefaultCounter)
      vi.mocked(prisma.staffUser.updateMany).mockResolvedValueOnce({ count: 1 })
      vi.mocked(prisma.counter.update).mockResolvedValueOnce(updatedCounter)

      const result = await updateCounter(
        { id: "COUNTER-001", locations: [mockLocationBase] },
        { id: "COUNTER-001", locations: [mockLocationBase, removedLocation] }
      )

      expect(result).toEqual(updatedCounter)
      expect(prisma.counter.findUnique).toHaveBeenCalledWith({ where: { name: "Counter" } })
      expect(prisma.staffUser.updateMany).toHaveBeenCalledWith({
        where: { locationCode: { in: ["LOC002"] }, counterId: "COUNTER-001" },
        data: { counterId: "DEFAULT-COUNTER" },
      })
    })

    it("sets counterId to null when the default counter does not exist", async () => {
      const removedLocation = { ...mockLocationBase, code: "LOC002", name: "Location 2" }
      const updatedCounter = { ...mockCounterWithRelations, locations: [mockLocationBase] }
      vi.mocked(prisma.counter.findUnique).mockResolvedValueOnce(null)
      vi.mocked(prisma.staffUser.updateMany).mockResolvedValueOnce({ count: 1 })
      vi.mocked(prisma.counter.update).mockResolvedValueOnce(updatedCounter)

      await updateCounter(
        { id: "COUNTER-001", locations: [mockLocationBase] },
        { id: "COUNTER-001", locations: [mockLocationBase, removedLocation] }
      )

      expect(prisma.staffUser.updateMany).toHaveBeenCalledWith({
        where: { locationCode: { in: ["LOC002"] }, counterId: "COUNTER-001" },
        data: { counterId: null },
      })
    })

    it("skips staff reassignment when no locations are removed", async () => {
      const updatedCounter = { ...mockCounterWithRelations, name: "Renamed" }
      vi.mocked(prisma.counter.update).mockResolvedValueOnce(updatedCounter)

      await updateCounter(
        { id: "COUNTER-001", name: "Renamed", locations: [mockLocationBase] },
        { id: "COUNTER-001", locations: [mockLocationBase] }
      )

      expect(prisma.counter.findUnique).not.toHaveBeenCalled()
      expect(prisma.staffUser.updateMany).not.toHaveBeenCalled()
    })

    it("skips staff reassignment when locations are not provided", async () => {
      const updatedCounter = { ...mockCounterWithRelations, name: "Renamed" }
      vi.mocked(prisma.counter.update).mockResolvedValueOnce(updatedCounter)

      await updateCounter({ id: "COUNTER-001", name: "Renamed" }, { id: "COUNTER-001" })

      expect(prisma.counter.findUnique).not.toHaveBeenCalled()
      expect(prisma.staffUser.updateMany).not.toHaveBeenCalled()
    })

    it("skips staff reassignment when prevCounter has no locations", async () => {
      const updatedCounter = { ...mockCounterWithRelations, locations: [mockLocationBase] }
      vi.mocked(prisma.counter.update).mockResolvedValueOnce(updatedCounter)

      await updateCounter(
        { id: "COUNTER-001", locations: [mockLocationBase] },
        { id: "COUNTER-001" }
      )

      expect(prisma.counter.findUnique).not.toHaveBeenCalled()
      expect(prisma.staffUser.updateMany).not.toHaveBeenCalled()
    })
  })
})
