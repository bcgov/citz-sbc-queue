import "@testing-library/jest-dom"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { StaffUser } from "@/generated/prisma/client"

vi.mock("next/navigation", () => ({
  useRouter: vi.fn().mockReturnValue({ refresh: vi.fn() }),
}))

import { ConfirmArchiveUserModal } from "./ConfirmArchiveUserModal"

describe("ConfirmArchiveUserModal", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("archives a user when the correct username is entered and confirmed", async () => {
    const user = { id: "1", username: "user1", deletedAt: null } as unknown as StaffUser
    const updateStaffUser = vi.fn().mockResolvedValue(user)
    const revalidateTable = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()

    render(
      <ConfirmArchiveUserModal
        open={true}
        onClose={onClose}
        user={user}
        updateStaffUser={updateStaffUser}
        revalidateTable={revalidateTable}
      />
    )

    const input = await screen.findByRole("textbox")
    const archiveButton = screen.getByRole("button", { name: /Archive/i })
    expect(archiveButton).toBeDisabled()

    await userEvent.type(input, user.username)
    expect(archiveButton).toBeEnabled()

    await userEvent.click(archiveButton)

    await waitFor(() => expect(updateStaffUser).toHaveBeenCalled())
    expect(revalidateTable).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it("unarchives a user when already archived and confirmation matches", async () => {
    const user = {
      id: "2",
      username: "archived-user",
      deletedAt: new Date("2020-01-01"),
    } as unknown as StaffUser
    const updateStaffUser = vi.fn().mockResolvedValue(user)
    const revalidateTable = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()

    render(
      <ConfirmArchiveUserModal
        open={true}
        onClose={onClose}
        user={user}
        updateStaffUser={updateStaffUser}
        revalidateTable={revalidateTable}
      />
    )

    const input = await screen.findByRole("textbox")
    const unarchiveButton = screen.getByRole("button", { name: /Unarchive/i })
    expect(unarchiveButton).toBeDisabled()

    await userEvent.type(input, user.username)
    expect(unarchiveButton).toBeEnabled()

    await userEvent.click(unarchiveButton)

    await waitFor(() => expect(updateStaffUser).toHaveBeenCalled())
    const [dataArg] = updateStaffUser.mock.calls[0]
    expect(dataArg.deletedAt).toBeNull()
    expect(revalidateTable).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it("saves when Enter is pressed and confirmation matches", async () => {
    const user = { id: "1", username: "user1", deletedAt: null } as unknown as StaffUser
    const updateStaffUser = vi.fn().mockResolvedValue(user)
    const revalidateTable = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()

    render(
      <ConfirmArchiveUserModal
        open={true}
        onClose={onClose}
        user={user}
        updateStaffUser={updateStaffUser}
        revalidateTable={revalidateTable}
      />
    )

    const input = await screen.findByRole("textbox")
    await userEvent.type(input, user.username)
    await userEvent.keyboard("{Enter}")

    await waitFor(() => expect(updateStaffUser).toHaveBeenCalled())
    expect(onClose).toHaveBeenCalled()
  })

  it("does not save when Enter is pressed with incomplete confirmation", async () => {
    const user = { id: "1", username: "user1", deletedAt: null } as unknown as StaffUser
    const updateStaffUser = vi.fn().mockResolvedValue(user)
    const revalidateTable = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()

    render(
      <ConfirmArchiveUserModal
        open={true}
        onClose={onClose}
        user={user}
        updateStaffUser={updateStaffUser}
        revalidateTable={revalidateTable}
      />
    )

    const input = await screen.findByRole("textbox")
    await userEvent.type(input, "wrong")
    await userEvent.keyboard("{Enter}")

    expect(updateStaffUser).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })
})
