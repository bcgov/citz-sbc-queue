import "@testing-library/jest-dom"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { ServiceWithRelations } from "@/lib/prisma/service/types"

vi.mock("next/navigation", () => ({
  useRouter: vi.fn().mockReturnValue({ refresh: vi.fn() }),
}))

import { ConfirmArchiveServiceModal } from "./ConfirmArchiveServiceModal"

describe("ConfirmArchiveServiceModal", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("archives a service when the correct name is entered and confirmed", async () => {
    const service = {
      id: "1",
      name: "Service 1",
      deletedAt: null,
    } as unknown as ServiceWithRelations
    const updateService = vi.fn().mockResolvedValue(service)
    const revalidateTable = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()

    render(
      <ConfirmArchiveServiceModal
        open={true}
        onClose={onClose}
        service={service}
        updateService={updateService}
        revalidateTable={revalidateTable}
      />
    )

    // input starts out empty and the Archive button should be disabled
    const input = await screen.findByRole("textbox")
    const archiveButton = screen.getByRole("button", { name: /Archive/i })
    expect(archiveButton).toBeDisabled()

    // type the exact service name to enable the button
    await userEvent.type(input, service.name)
    expect(archiveButton).toBeEnabled()

    await userEvent.click(archiveButton)

    await waitFor(() => expect(updateService).toHaveBeenCalled())
    // first arg should include deletedAt set (a Date)
    const [dataArg, prevArg] = updateService.mock.calls[0]
    expect(dataArg).toHaveProperty("deletedAt")
    expect(prevArg).toEqual(service)
    expect(revalidateTable).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it("unarchives a service when already archived and confirmation matches", async () => {
    const service = {
      id: "2",
      name: "Archived Service",
      deletedAt: new Date("2020-01-01"),
    } as unknown as ServiceWithRelations
    const updateService = vi.fn().mockResolvedValue(service)
    const revalidateTable = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()

    render(
      <ConfirmArchiveServiceModal
        open={true}
        onClose={onClose}
        service={service}
        updateService={updateService}
        revalidateTable={revalidateTable}
      />
    )

    const input = await screen.findByRole("textbox")
    const unarchiveButton = screen.getByRole("button", { name: /Unarchive/i })
    expect(unarchiveButton).toBeDisabled()

    await userEvent.type(input, service.name)
    expect(unarchiveButton).toBeEnabled()

    await userEvent.click(unarchiveButton)

    await waitFor(() => expect(updateService).toHaveBeenCalled())
    const [dataArg] = updateService.mock.calls[0]
    expect(dataArg.deletedAt).toBeNull()
    expect(revalidateTable).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it("saves when Enter is pressed and confirmation matches", async () => {
    const service = {
      id: "1",
      name: "Service 1",
      deletedAt: null,
    } as unknown as ServiceWithRelations
    const updateService = vi.fn().mockResolvedValue(service)
    const revalidateTable = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()

    render(
      <ConfirmArchiveServiceModal
        open={true}
        onClose={onClose}
        service={service}
        updateService={updateService}
        revalidateTable={revalidateTable}
      />
    )

    const input = await screen.findByRole("textbox")
    await userEvent.type(input, service.name)
    await userEvent.keyboard("{Enter}")

    await waitFor(() => expect(updateService).toHaveBeenCalled())
    expect(onClose).toHaveBeenCalled()
  })

  it("does not save when Enter is pressed with incomplete confirmation", async () => {
    const service = {
      id: "1",
      name: "Service 1",
      deletedAt: null,
    } as unknown as ServiceWithRelations
    const updateService = vi.fn().mockResolvedValue(service)
    const revalidateTable = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()

    render(
      <ConfirmArchiveServiceModal
        open={true}
        onClose={onClose}
        service={service}
        updateService={updateService}
        revalidateTable={revalidateTable}
      />
    )

    const input = await screen.findByRole("textbox")
    await userEvent.type(input, "wrong")
    await userEvent.keyboard("{Enter}")

    expect(updateService).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })
})
