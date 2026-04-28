import "@testing-library/jest-dom"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { ServiceCategoryWithRelations } from "@/lib/prisma/service_category/types"

vi.mock("next/navigation", () => ({
  useRouter: vi.fn().mockReturnValue({ refresh: vi.fn() }),
}))

import { ConfirmArchiveServiceCategoryModal } from "./ConfirmArchiveServiceCategoryModal"

describe("ConfirmArchiveServiceCategoryModal", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("archives a service category when the correct name is entered and confirmed", async () => {
    const serviceCategory = {
      id: "1",
      name: "Cat 1",
      deletedAt: null,
    } as unknown as ServiceCategoryWithRelations
    const updateServiceCategory = vi.fn().mockResolvedValue(serviceCategory)
    const revalidateTable = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()

    render(
      <ConfirmArchiveServiceCategoryModal
        open={true}
        onClose={onClose}
        serviceCategory={serviceCategory}
        updateServiceCategory={updateServiceCategory}
        revalidateTable={revalidateTable}
      />
    )

    const input = await screen.findByRole("textbox")
    const archiveButton = screen.getByRole("button", { name: /Archive/i })
    expect(archiveButton).toBeDisabled()

    await userEvent.type(input, serviceCategory.name)
    expect(archiveButton).toBeEnabled()

    await userEvent.click(archiveButton)

    await waitFor(() => expect(updateServiceCategory).toHaveBeenCalled())
    const [dataArg] = updateServiceCategory.mock.calls[0]
    expect(dataArg).toHaveProperty("deletedAt")
    expect(revalidateTable).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it("unarchives a service category when already archived and confirmation matches", async () => {
    const serviceCategory = {
      id: "2",
      name: "Archived Cat",
      deletedAt: new Date("2020-01-01"),
    } as unknown as ServiceCategoryWithRelations
    const updateServiceCategory = vi.fn().mockResolvedValue(serviceCategory)
    const revalidateTable = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()

    render(
      <ConfirmArchiveServiceCategoryModal
        open={true}
        onClose={onClose}
        serviceCategory={serviceCategory}
        updateServiceCategory={updateServiceCategory}
        revalidateTable={revalidateTable}
      />
    )

    const input = await screen.findByRole("textbox")
    const unarchiveButton = screen.getByRole("button", { name: /Unarchive/i })
    expect(unarchiveButton).toBeDisabled()

    await userEvent.type(input, serviceCategory.name)
    expect(unarchiveButton).toBeEnabled()

    await userEvent.click(unarchiveButton)

    await waitFor(() => expect(updateServiceCategory).toHaveBeenCalled())
    const [dataArg] = updateServiceCategory.mock.calls[0]
    expect(dataArg.deletedAt).toBeNull()
    expect(revalidateTable).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it("handles services when archiving a category with services", async () => {
    const serviceCategory = {
      id: "1",
      name: "Cat with Services",
      deletedAt: null,
      services: [{ code: "SVC1" }, { code: "SVC2" }],
    } as unknown as ServiceCategoryWithRelations
    const serviceCategories = [
      serviceCategory,
      { id: "2", name: "Other Cat", deletedAt: null, services: [] },
    ] as unknown as ServiceCategoryWithRelations[]
    const updateServiceCategory = vi.fn().mockResolvedValue(serviceCategory)
    const revalidateTable = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()

    render(
      <ConfirmArchiveServiceCategoryModal
        open={true}
        onClose={onClose}
        serviceCategory={serviceCategory}
        serviceCategories={serviceCategories}
        updateServiceCategory={updateServiceCategory}
        revalidateTable={revalidateTable}
      />
    )

    const archiveButton = screen.getByRole("button", { name: /Archive/i })
    expect(archiveButton).toBeDisabled()

    // Select the service action: remove
    const selectAction = screen.getByLabelText(/Action for services/i)
    await userEvent.selectOptions(selectAction, "remove")

    const nameInput = await screen.findByRole("textbox")
    await userEvent.type(nameInput, serviceCategory.name)
    expect(archiveButton).toBeEnabled()

    await userEvent.click(archiveButton)

    await waitFor(() => expect(updateServiceCategory).toHaveBeenCalledTimes(1))
    const [dataArg] = updateServiceCategory.mock.calls[0]
    expect(dataArg.services).toEqual([]) // Should detach services
    expect(dataArg.deletedAt).not.toBeNull()
  })

  it("requires new category selection when reassigning services", async () => {
    const serviceCategory = {
      id: "1",
      name: "Cat to Reassign",
      deletedAt: null,
      services: [{ code: "SVC1" }],
    } as unknown as ServiceCategoryWithRelations
    const targetCategory = {
      id: "2",
      name: "Target Cat",
      deletedAt: null,
      services: [],
    } as unknown as ServiceCategoryWithRelations
    const serviceCategories = [serviceCategory, targetCategory]
    const updateServiceCategory = vi.fn().mockResolvedValue(serviceCategory)
    const revalidateTable = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()

    render(
      <ConfirmArchiveServiceCategoryModal
        open={true}
        onClose={onClose}
        serviceCategory={serviceCategory}
        serviceCategories={serviceCategories}
        updateServiceCategory={updateServiceCategory}
        revalidateTable={revalidateTable}
      />
    )

    const archiveButton = screen.getByRole("button", { name: /Archive/i })
    expect(archiveButton).toBeDisabled()

    const selectAction = screen.getByLabelText(/Action for services/i)
    await userEvent.selectOptions(selectAction, "reassign")

    // The confirm button should still be disabled until new category is chosen and string is typed
    const nameInput = await screen.findByRole("textbox")
    await userEvent.type(nameInput, serviceCategory.name)
    expect(archiveButton).toBeDisabled()

    const newCategorySelect = screen.getByLabelText(/Select new category/i)
    await userEvent.selectOptions(newCategorySelect, "2")
    expect(archiveButton).toBeEnabled()

    await userEvent.click(archiveButton)

    // First call attaches to the new category, second call detaches and archives the old one
    await waitFor(() => expect(updateServiceCategory).toHaveBeenCalledTimes(2))
    expect(updateServiceCategory).toHaveBeenNthCalledWith(1, {
      id: "2",
      services: [{ code: "SVC1" }],
    })
    expect(updateServiceCategory).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ id: "1", services: [] }) // Archived and detached
    )
  })

  it("saves when Enter is pressed and confirmation matches", async () => {
    const serviceCategory = {
      id: "1",
      name: "Cat 1",
      deletedAt: null,
      services: [],
    } as unknown as ServiceCategoryWithRelations
    const updateServiceCategory = vi.fn().mockResolvedValue(serviceCategory)
    const revalidateTable = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()

    render(
      <ConfirmArchiveServiceCategoryModal
        open={true}
        onClose={onClose}
        serviceCategory={serviceCategory}
        updateServiceCategory={updateServiceCategory}
        revalidateTable={revalidateTable}
      />
    )

    const input = await screen.findByRole("textbox")
    await userEvent.type(input, serviceCategory.name)
    await userEvent.keyboard("{Enter}")

    await waitFor(() => expect(updateServiceCategory).toHaveBeenCalled())
    expect(onClose).toHaveBeenCalled()
  })

  it("does not save when Enter is pressed with incomplete confirmation", async () => {
    const serviceCategory = {
      id: "1",
      name: "Cat 1",
      deletedAt: null,
      services: [],
    } as unknown as ServiceCategoryWithRelations
    const updateServiceCategory = vi.fn().mockResolvedValue(serviceCategory)
    const revalidateTable = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()

    render(
      <ConfirmArchiveServiceCategoryModal
        open={true}
        onClose={onClose}
        serviceCategory={serviceCategory}
        updateServiceCategory={updateServiceCategory}
        revalidateTable={revalidateTable}
      />
    )

    const input = await screen.findByRole("textbox")
    await userEvent.type(input, "wrong")
    await userEvent.keyboard("{Enter}")

    expect(updateServiceCategory).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })
})
