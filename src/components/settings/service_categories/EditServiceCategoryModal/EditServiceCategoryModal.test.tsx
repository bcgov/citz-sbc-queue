import "@testing-library/jest-dom"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

// Mock the ServiceCategoryForm to avoid rendering complex child components
vi.mock("../ServiceCategoryForm", () => ({
  ServiceCategoryForm: () => <div>ServiceCategoryFormStub</div>,
}))

import type { Service } from "@/generated/prisma/client"
import type { ServiceCategoryWithRelations } from "@/lib/prisma/service_category/types"
import { EditServiceCategoryModal } from "./EditServiceCategoryModal"

describe("EditServiceCategoryModal", () => {
  const now = new Date()
  const serviceCategory = {
    id: "sc1",
    name: "Category 1",
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
    services: [],
  } as unknown as ServiceCategoryWithRelations

  const services = [{ id: "s1", code: "S1", name: "Service 1" }] as unknown as Service[]

  it("renders modal title when open with a serviceCategory", async () => {
    const onClose = vi.fn()
    const updateServiceCategory = vi.fn().mockResolvedValue(serviceCategory)
    const revalidateTable = vi.fn().mockResolvedValue(undefined)
    const openConfirmArchiveServiceCategoryModal = vi.fn()

    render(
      <EditServiceCategoryModal
        open={true}
        onClose={onClose}
        serviceCategory={serviceCategory}
        services={services}
        updateServiceCategory={updateServiceCategory}
        revalidateTable={revalidateTable}
        openConfirmArchiveServiceCategoryModal={openConfirmArchiveServiceCategoryModal}
      />
    )

    await waitFor(() =>
      expect(screen.getByText(`Edit Category: ${serviceCategory.name}`)).toBeTruthy()
    )
    expect(screen.getByText("ServiceCategoryFormStub")).toBeTruthy()
  })

  it("calls onClose when Cancel button is clicked", async () => {
    const onClose = vi.fn()
    const updateServiceCategory = vi.fn().mockResolvedValue(serviceCategory)
    const revalidateTable = vi.fn().mockResolvedValue(undefined)
    const openConfirmArchiveServiceCategoryModal = vi.fn()

    render(
      <EditServiceCategoryModal
        open={true}
        onClose={onClose}
        serviceCategory={serviceCategory}
        services={services}
        updateServiceCategory={updateServiceCategory}
        revalidateTable={revalidateTable}
        openConfirmArchiveServiceCategoryModal={openConfirmArchiveServiceCategoryModal}
      />
    )

    // wait for modal to mount its content
    await waitFor(() =>
      expect(screen.getByText(`Edit Category: ${serviceCategory.name}`)).toBeTruthy()
    )

    fireEvent.click(screen.getByText("Cancel"))
    expect(onClose).toHaveBeenCalled()
  })
})
