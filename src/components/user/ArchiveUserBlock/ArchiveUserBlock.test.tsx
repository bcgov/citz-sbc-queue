import { render, screen, waitFor } from "@testing-library/react"
import type { Mock } from "vitest"
import { describe, expect, it, vi } from "vitest"

// Mock the hooks module so we can control authentication state
vi.mock("@/hooks", () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from "@/hooks"
import { ArchiveUserBlock } from "./ArchiveUserBlock"

describe("ArchiveUserBlock", () => {
  const mockUseAuth = useAuth as unknown as Mock

  it("renders the archived modal when the current user is archived", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, sub: "sub-1" })

    const getStaffUserBySub = vi.fn().mockResolvedValue({ deletedAt: new Date().toISOString() })

    render(<ArchiveUserBlock getStaffUserBySub={getStaffUserBySub} />)

    await waitFor(() => expect(getStaffUserBySub).toHaveBeenCalledWith("sub-1"))

    expect(await screen.findByText("Account Archived")).toBeTruthy()
    expect(screen.getByText(/Your account is archived/)).toBeTruthy()
  })

  it("renders nothing when the user is not archived", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, sub: "sub-2" })

    const getStaffUserBySub = vi.fn().mockResolvedValue({ deletedAt: null })

    const { container } = render(<ArchiveUserBlock getStaffUserBySub={getStaffUserBySub} />)

    await waitFor(() => expect(getStaffUserBySub).toHaveBeenCalledWith("sub-2"))

    // Component returns null when not archived, so container should be empty
    expect(container.innerHTML).toBe("")
  })
})
