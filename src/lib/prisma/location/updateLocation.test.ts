import { beforeEach, describe, expect, it, vi } from "vitest"
import { prisma } from "@/utils/db/prisma"
import type { LocationWithRelations } from "./types"
import { updateLocation } from "./updateLocation"

vi.mock("@/utils/db/prisma", () => ({
  prisma: {
    location: {
      update: vi.fn(),
    },
  },
}))

describe("updateLocation", () => {
  const mockLocationBase = {
    code: "LOC001",
    name: "Original Location",
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

  const mockService = {
    code: "SVC001",
    name: "Service 1",
    description: "Service 1 Description",
    publicName: "Public Service 1",
    ticketPrefix: "SVC",
    legacyServiceId: null,
    backOffice: false,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockCounter = {
    id: "CTR001",
    name: "Counter 1",
    locationCode: "LOC001",
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockStaffUser = {
    guid: "user-guid-1",
    sub: "user-sub-1",
    legacyCsrId: null,
    username: "user1",
    displayName: "User One",
    locationCode: "LOC001",
    counterId: "CTR001",
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
  }

  const mockLocationWithRelations: LocationWithRelations = {
    ...mockLocationBase,
    services: [mockService],
    counters: [mockCounter],
    staffUsers: [mockStaffUser],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns null when neither code nor prevLocation.code is provided", async () => {
    const result = await updateLocation({}, {})

    expect(result).toBeNull()
    expect(prisma.location.update).not.toHaveBeenCalled()
  })

  it("returns null when only prevLocation.code is missing and code is not provided", async () => {
    const result = await updateLocation({ name: "Updated Name" }, { code: undefined })

    expect(result).toBeNull()
  })

  it("updates location with basic fields using provided code", async () => {
    const updatedLocation = {
      ...mockLocationWithRelations,
      name: "Updated Location",
    }
    vi.mocked(prisma.location.update).mockResolvedValueOnce(updatedLocation)

    const result = await updateLocation(
      { code: "LOC001", name: "Updated Location" },
      { code: "LOC001" }
    )

    expect(result).toEqual(updatedLocation)
    expect(prisma.location.update).toHaveBeenCalledWith({
      where: { code: "LOC001" },
      data: expect.objectContaining({
        name: "Updated Location",
        updatedAt: expect.any(Date),
      }),
      include: { services: true, counters: true, staffUsers: true },
    })
  })

  it("updates location using prevLocation.code when code is not provided", async () => {
    const updatedLocation = {
      ...mockLocationWithRelations,
      phoneNumber: "604-123-4567",
    }
    vi.mocked(prisma.location.update).mockResolvedValueOnce(updatedLocation)

    const result = await updateLocation({ phoneNumber: "604-123-4567" }, { code: "LOC001" })

    expect(result).toEqual(updatedLocation)
    expect(prisma.location.update).toHaveBeenCalledWith({
      where: { code: "LOC001" },
      data: expect.objectContaining({
        phoneNumber: "604-123-4567",
        updatedAt: expect.any(Date),
      }),
      include: { services: true, counters: true, staffUsers: true },
    })
  })

  it("handles changing the primary key (code)", async () => {
    const updatedLocation = {
      ...mockLocationWithRelations,
      code: "LOC002",
    }
    vi.mocked(prisma.location.update).mockResolvedValueOnce(updatedLocation)

    const result = await updateLocation({ code: "LOC002" }, { code: "LOC001" })

    expect(result).toEqual(updatedLocation)
    expect(prisma.location.update).toHaveBeenCalledWith({
      where: { code: "LOC001" },
      data: expect.objectContaining({
        code: "LOC002",
        updatedAt: expect.any(Date),
      }),
      include: { services: true, counters: true, staffUsers: true },
    })
  })

  it("updates services when provided", async () => {
    const newService = {
      ...mockService,
      code: "SVC002",
      name: "Service 2",
      description: "Service 2 Description",
      publicName: "Public Service 2",
    }
    const updatedLocation = {
      ...mockLocationWithRelations,
      services: [newService],
    }
    vi.mocked(prisma.location.update).mockResolvedValueOnce(updatedLocation)

    const result = await updateLocation(
      { code: "LOC001", services: [newService] },
      { code: "LOC001" }
    )

    expect(result).toEqual(updatedLocation)
    expect(prisma.location.update).toHaveBeenCalledWith({
      where: { code: "LOC001" },
      data: expect.objectContaining({
        services: {
          set: [{ code: "SVC002" }],
        },
        updatedAt: expect.any(Date),
      }),
      include: { services: true, counters: true, staffUsers: true },
    })
  })

  it("updates counters when provided", async () => {
    const newCounter = {
      ...mockCounter,
      id: "CTR002",
      name: "Counter 2",
    }
    const updatedLocation = {
      ...mockLocationWithRelations,
      counters: [newCounter],
    }
    vi.mocked(prisma.location.update).mockResolvedValueOnce(updatedLocation)

    const result = await updateLocation(
      { code: "LOC001", counters: [newCounter] },
      { code: "LOC001" }
    )

    expect(result).toEqual(updatedLocation)
    expect(prisma.location.update).toHaveBeenCalledWith({
      where: { code: "LOC001" },
      data: expect.objectContaining({
        counters: {
          set: [{ id: "CTR002" }],
        },
        updatedAt: expect.any(Date),
      }),
      include: { services: true, counters: true, staffUsers: true },
    })
  })

  it("updates staffUsers when provided", async () => {
    const newStaffUser = {
      ...mockStaffUser,
      guid: "user-guid-2",
      role: "CSR" as const,
      username: "user2",
      displayName: "User Two",
    }
    const updatedLocation = {
      ...mockLocationWithRelations,
      staffUsers: [newStaffUser],
    }
    vi.mocked(prisma.location.update).mockResolvedValueOnce(updatedLocation)

    const result = await updateLocation(
      { code: "LOC001", staffUsers: [newStaffUser] },
      { code: "LOC001" }
    )

    expect(result).toEqual(updatedLocation)
    expect(prisma.location.update).toHaveBeenCalledWith({
      where: { code: "LOC001" },
      data: expect.objectContaining({
        staffUsers: {
          set: [{ guid: "user-guid-2" }],
        },
        updatedAt: expect.any(Date),
      }),
      include: { services: true, counters: true, staffUsers: true },
    })
  })

  it("updates multiple fields and relations together", async () => {
    const newService = {
      ...mockService,
      code: "SVC002",
      name: "Service 2",
      description: "Service 2 Description",
      publicName: "Public Service 2",
    }
    const newCounter = { ...mockCounter, id: "CTR002" }
    const updatedLocation = {
      ...mockLocationWithRelations,
      name: "Updated Location",
      phoneNumber: "604-555-1234",
      services: [newService],
      counters: [newCounter],
    }
    vi.mocked(prisma.location.update).mockResolvedValueOnce(updatedLocation)

    const result = await updateLocation(
      {
        code: "LOC001",
        name: "Updated Location",
        phoneNumber: "604-555-1234",
        services: [newService],
        counters: [newCounter],
      },
      { code: "LOC001" }
    )

    expect(result).toEqual(updatedLocation)
    expect(prisma.location.update).toHaveBeenCalledWith({
      where: { code: "LOC001" },
      data: expect.objectContaining({
        name: "Updated Location",
        phoneNumber: "604-555-1234",
        services: {
          set: [{ code: "SVC002" }],
        },
        counters: {
          set: [{ id: "CTR002" }],
        },
        updatedAt: expect.any(Date),
      }),
      include: { services: true, counters: true, staffUsers: true },
    })
  })

  it("propagates database errors", async () => {
    const dbError = new Error("Database connection failed")
    vi.mocked(prisma.location.update).mockRejectedValueOnce(dbError)

    await expect(
      updateLocation({ code: "LOC001", name: "Updated" }, { code: "LOC001" })
    ).rejects.toThrow("Database connection failed")
  })

  it("does not update relations if not provided", async () => {
    const updatedLocation = {
      ...mockLocationWithRelations,
      timezone: "America/Toronto",
    }
    vi.mocked(prisma.location.update).mockResolvedValueOnce(updatedLocation)

    await updateLocation({ code: "LOC001", timezone: "America/Toronto" }, { code: "LOC001" })

    expect(prisma.location.update).toHaveBeenCalledWith({
      where: { code: "LOC001" },
      data: expect.not.objectContaining({
        services: expect.anything(),
        counters: expect.anything(),
        staffUsers: expect.anything(),
      }),
      include: { services: true, counters: true, staffUsers: true },
    })
  })
})
