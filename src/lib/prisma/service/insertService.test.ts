import { beforeEach, describe, expect, it, vi } from "vitest"
import type { Service } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"
import { insertService } from "./insertService"
import type { ServiceWithRelations } from "./types"

vi.mock("@/utils/db/prisma", () => ({
  prisma: {
    service: {
      create: vi.fn(),
    },
  },
}))

describe("insertService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("inserts and returns the created service when required fields provided", async () => {
    const input = {
      code: "SVC1",
      ticketPrefix: "T",
      name: "Service One",
      publicName: "Service Public",
    }

    const mockService = {
      id: "svc-1",
      ...input,
      locations: [],
    } as unknown as ServiceWithRelations

    vi.mocked(prisma.service.create).mockResolvedValueOnce(mockService)

    const result = await insertService(input as Service)

    expect(result).toEqual(mockService)
    expect(prisma.service.create).toHaveBeenCalledWith({
      data: { ...input },
      include: { locations: true },
    })
  })

  it("throws when required fields are missing and does not call prisma.create", async () => {
    const incomplete = {
      code: "",
      ticketPrefix: "",
      name: "",
      publicName: "",
    }

    await expect(insertService(incomplete as Service)).rejects.toThrow(
      /Code, Ticket Prefix, Name, and Public Name are required/
    )

    expect(prisma.service.create).not.toHaveBeenCalled()
  })
})
