import "@testing-library/jest-dom"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

// Mock the ServiceForm to avoid rendering complex child components
vi.mock("../ServiceForm", () => ({
  ServiceForm: () => <div>ServiceFormStub</div>,
}))

import type { Location } from "@/generated/prisma/client"
import type { ServiceWithRelations } from "@/lib/prisma/service/types"
import { EditServiceModal } from "./EditServiceModal"

describe("EditServiceModal", () => {
  const now = new Date()
  const service = {
    id: "s1",
    code: "SRV1",
    name: "Service 1",
    description: "Description",
    publicName: "Public Service",
    ticketPrefix: "T",
    legacyServiceId: null,
    backOffice: false,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
    locations: [
      {
        id: "o1",
        name: "Office 1",
        deletedAt: null,
        createdAt: now,
        updatedAt: now,
        timezone: "UTC",
        streetAddress: "123 Test St",
        mailAddress: null,
        phoneNumber: null,
        latitude: 0,
        longitude: 0,
        legacyOfficeNumber: null,
      },
    ],
  } as unknown as ServiceWithRelations

  const offices = [{ id: "o1", name: "Office 1" }] as unknown as Location[]

  it("renders modal title when open with a service", async () => {
    const onClose = vi.fn()
    const updateService = vi.fn().mockResolvedValue(service)
    const revalidateTable = vi.fn().mockResolvedValue(undefined)
    const doesServiceCodeExist = vi.fn().mockResolvedValue(false)

    render(
      <EditServiceModal
        open={true}
        onClose={onClose}
        service={service}
        offices={offices}
        updateService={updateService}
        doesServiceCodeExist={doesServiceCodeExist}
        revalidateTable={revalidateTable}
      />
    )

    await waitFor(() => expect(screen.getByText(`Edit Service: ${service.code}`)).toBeTruthy())
    expect(screen.getByText("ServiceFormStub")).toBeTruthy()
  })

  it("calls onClose when Cancel is clicked and saves via updateService when Save Changes is clicked", async () => {
    const onClose = vi.fn()
    const updateService = vi.fn().mockResolvedValue(service)
    const revalidateTable = vi.fn().mockResolvedValue(undefined)
    const doesServiceCodeExist = vi.fn().mockResolvedValue(false)

    render(
      <EditServiceModal
        open={true}
        onClose={onClose}
        service={service}
        offices={offices}
        updateService={updateService}
        doesServiceCodeExist={doesServiceCodeExist}
        revalidateTable={revalidateTable}
      />
    )

    // wait for modal to mount its content
    await waitFor(() => expect(screen.getByText(`Edit Service: ${service.code}`)).toBeTruthy())

    fireEvent.click(screen.getByText("Cancel"))
    expect(onClose).toHaveBeenCalled()

    // Test Save path without re-rendering (avoid duplicate DOM nodes)
    onClose.mockReset()
    updateService.mockReset()
    revalidateTable.mockReset()
    doesServiceCodeExist.mockReset()

    // wait for async validation to complete so Save is enabled
    await waitFor(() => expect(screen.getByText("Save Changes")).toBeEnabled())
    fireEvent.click(screen.getByText("Save Changes"))

    await waitFor(() => expect(updateService).toHaveBeenCalled())
    await waitFor(() => expect(revalidateTable).toHaveBeenCalled())
  })
})
