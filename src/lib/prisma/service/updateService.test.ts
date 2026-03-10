import { beforeEach, describe, expect, it, vi } from "vitest"
import { prisma } from "@/utils/db/prisma"
import type { ServiceWithRelations } from "./types"
import { updateService } from "./updateService"

vi.mock("@/utils/db/prisma", () => ({
  prisma: {
    service: {
      update: vi.fn(),
    },
  },
}))

describe("updateService", () => {
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

  const mockCategoryBase = {
    id: "CAT001",
    name: "Category 1",
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockServiceBase = {
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

  const mockServiceWithRelations: ServiceWithRelations = {
    ...mockServiceBase,
    locations: [mockLocationBase],
    categories: [mockCategoryBase],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns null when neither code nor prevService.code is provided", async () => {
    const result = await updateService({}, {})

    expect(result).toBeNull()
    expect(prisma.service.update).not.toHaveBeenCalled()
  })

  it("returns null when only prevService.code is missing and code is not provided", async () => {
    const result = await updateService({ name: "Updated Name" }, { code: undefined })

    expect(result).toBeNull()
  })

  it("updates service with basic fields using provided code", async () => {
    const updatedService = {
      ...mockServiceWithRelations,
      name: "Updated Service",
    }
    vi.mocked(prisma.service.update).mockResolvedValueOnce(updatedService)

    const result = await updateService(
      { code: "SVC001", name: "Updated Service" },
      { code: "SVC001" }
    )

    expect(result).toEqual(updatedService)
    expect(prisma.service.update).toHaveBeenCalledWith({
      where: { code: "SVC001" },
      data: expect.objectContaining({
        name: "Updated Service",
        updatedAt: expect.any(Date),
      }),
      include: { locations: true, categories: true },
    })
  })

  it("updates service using prevService.code when code is not provided", async () => {
    const updatedService = {
      ...mockServiceWithRelations,
      description: "Updated Description",
    }
    vi.mocked(prisma.service.update).mockResolvedValueOnce(updatedService)

    const result = await updateService({ description: "Updated Description" }, { code: "SVC001" })

    expect(result).toEqual(updatedService)
    expect(prisma.service.update).toHaveBeenCalledWith({
      where: { code: "SVC001" },
      data: expect.objectContaining({
        description: "Updated Description",
        updatedAt: expect.any(Date),
      }),
      include: { locations: true, categories: true },
    })
  })

  it("handles changing the primary key (code)", async () => {
    const updatedService = {
      ...mockServiceWithRelations,
      code: "SVC002",
    }
    vi.mocked(prisma.service.update).mockResolvedValueOnce(updatedService)

    const result = await updateService({ code: "SVC002" }, { code: "SVC001" })

    expect(result).toEqual(updatedService)
    expect(prisma.service.update).toHaveBeenCalledWith({
      where: { code: "SVC001" },
      data: expect.objectContaining({
        code: "SVC002",
        updatedAt: expect.any(Date),
      }),
      include: { locations: true, categories: true },
    })
  })

  it("updates locations when provided", async () => {
    const newLocation = {
      ...mockLocationBase,
      code: "LOC002",
      name: "Location 2",
    }
    const updatedService = {
      ...mockServiceWithRelations,
      locations: [newLocation],
    }
    vi.mocked(prisma.service.update).mockResolvedValueOnce(updatedService)

    const result = await updateService(
      { code: "SVC001", locations: [newLocation] },
      { code: "SVC001" }
    )

    expect(result).toEqual(updatedService)
    expect(prisma.service.update).toHaveBeenCalledWith({
      where: { code: "SVC001" },
      data: expect.objectContaining({
        locations: {
          set: [{ code: "LOC002" }],
        },
        updatedAt: expect.any(Date),
      }),
      include: { locations: true, categories: true },
    })
  })

  it("updates categories when provided", async () => {
    const newCategory = {
      ...mockCategoryBase,
      id: "CAT002",
      name: "Category 2",
    }
    const updatedService = {
      ...mockServiceWithRelations,
      categories: [newCategory],
    }
    vi.mocked(prisma.service.update).mockResolvedValueOnce(updatedService)

    const result = await updateService(
      { code: "SVC001", categories: [newCategory] },
      { code: "SVC001" }
    )

    expect(result).toEqual(updatedService)
    expect(prisma.service.update).toHaveBeenCalledWith({
      where: { code: "SVC001" },
      data: expect.objectContaining({
        categories: {
          set: [{ id: "CAT002" }],
        },
        updatedAt: expect.any(Date),
      }),
      include: { locations: true, categories: true },
    })
  })

  it("updates multiple fields and relations together", async () => {
    const newLocation = {
      ...mockLocationBase,
      code: "LOC002",
      name: "Location 2",
    }
    const newCategory = {
      ...mockCategoryBase,
      id: "CAT002",
      name: "Category 2",
    }
    const updatedService = {
      ...mockServiceWithRelations,
      name: "Updated Service",
      description: "Updated Description",
      locations: [newLocation],
      categories: [newCategory],
    }
    vi.mocked(prisma.service.update).mockResolvedValueOnce(updatedService)

    const result = await updateService(
      {
        code: "SVC001",
        name: "Updated Service",
        description: "Updated Description",
        locations: [newLocation],
        categories: [newCategory],
      },
      { code: "SVC001" }
    )

    expect(result).toEqual(updatedService)
    expect(prisma.service.update).toHaveBeenCalledWith({
      where: { code: "SVC001" },
      data: expect.objectContaining({
        name: "Updated Service",
        description: "Updated Description",
        locations: {
          set: [{ code: "LOC002" }],
        },
        categories: {
          set: [{ id: "CAT002" }],
        },
        updatedAt: expect.any(Date),
      }),
      include: { locations: true, categories: true },
    })
  })

  it("propagates database errors", async () => {
    const dbError = new Error("Database connection failed")
    vi.mocked(prisma.service.update).mockRejectedValueOnce(dbError)

    await expect(
      updateService({ code: "SVC001", name: "Updated" }, { code: "SVC001" })
    ).rejects.toThrow("Database connection failed")
  })

  it("does not update relations if not provided", async () => {
    const updatedService = {
      ...mockServiceWithRelations,
      publicName: "Updated Public Name",
    }
    vi.mocked(prisma.service.update).mockResolvedValueOnce(updatedService)

    await updateService({ code: "SVC001", publicName: "Updated Public Name" }, { code: "SVC001" })

    expect(prisma.service.update).toHaveBeenCalledWith({
      where: { code: "SVC001" },
      data: expect.not.objectContaining({
        locations: expect.anything(),
        categories: expect.anything(),
      }),
      include: { locations: true, categories: true },
    })
  })
})
