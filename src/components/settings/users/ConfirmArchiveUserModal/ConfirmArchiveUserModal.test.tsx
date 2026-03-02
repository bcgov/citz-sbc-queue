import "@testing-library/jest-dom"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { StaffUser } from "@/generated/prisma/client"
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
})
