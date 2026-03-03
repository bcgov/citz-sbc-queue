import "@testing-library/jest-dom"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

// Mock the ServiceForm to avoid rendering complex child components
vi.mock("../ServiceForm", () => ({
  ServiceForm: () => <div>ServiceFormStub</div>,
}))

import type { Location, ServiceCategory } from "@/generated/prisma/client"
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
    categories: [],
  } as unknown as ServiceWithRelations

  const offices = [{ id: "o1", name: "Office 1" }] as unknown as Location[]
  const categories = [] as unknown as ServiceCategory[]

  it("renders modal title when open with a service", async () => {
    const onClose = vi.fn()
    const updateService = vi.fn().mockResolvedValue(service)
    const revalidateTable = vi.fn().mockResolvedValue(undefined)
    const doesServiceCodeExist = vi.fn().mockResolvedValue(false)
    const openConfirmArchiveServiceModal = vi.fn()

    render(
      <EditServiceModal
        open={true}
        onClose={onClose}
        service={service}
        offices={offices}
        categories={categories}
        updateService={updateService}
        doesServiceCodeExist={doesServiceCodeExist}
        revalidateTable={revalidateTable}
        openConfirmArchiveServiceModal={openConfirmArchiveServiceModal}
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
    const openConfirmArchiveServiceModal = vi.fn()

    const { rerender } = render(
      <EditServiceModal
        open={true}
        onClose={onClose}
        service={service}
        offices={offices}
        categories={categories}
        updateService={updateService}
        doesServiceCodeExist={doesServiceCodeExist}
        revalidateTable={revalidateTable}
        openConfirmArchiveServiceModal={openConfirmArchiveServiceModal}
      />
    )

    // wait for modal to mount its content
    await waitFor(() => expect(screen.getByText(`Edit Service: ${service.code}`)).toBeTruthy())

    fireEvent.click(screen.getByText("Cancel"))
    expect(onClose).toHaveBeenCalled()

    // Re-render to test the save path with async validation resolution
    onClose.mockReset()
    updateService.mockReset()
    revalidateTable.mockReset()

    rerender(
      <EditServiceModal
        open={true}
        onClose={onClose}
        service={service}
        offices={offices}
        categories={categories}
        updateService={updateService}
        doesServiceCodeExist={doesServiceCodeExist}
        revalidateTable={revalidateTable}
        openConfirmArchiveServiceModal={openConfirmArchiveServiceModal}
      />
    )

    // wait for async validation to complete, which should enable Save
    await waitFor(() => expect(screen.getByText("Save Changes")).toBeEnabled(), { timeout: 2000 })
    fireEvent.click(screen.getByText("Save Changes"))

    await waitFor(() => expect(updateService).toHaveBeenCalled())
    await waitFor(() => expect(revalidateTable).toHaveBeenCalled())
  })
})
