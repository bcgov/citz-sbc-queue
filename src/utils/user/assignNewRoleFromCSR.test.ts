import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { assignRole } from "@/utils/sso/assignRole"
import { assignNewRoleFromCSR } from "./assignNewRoleFromCSR"

vi.mock("@/utils/sso/assignRole")

describe("assignNewRoleFromCSR", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns CSR and does not call assignRole when sub is null", async () => {
    const result = await assignNewRoleFromCSR(null, null)

    expect(result).toBe("CSR")
    expect(assignRole).not.toHaveBeenCalled()
  })

  it("maps csrRoleId 1 to SDM and calls assignRole when sub provided", async () => {
    vi.mocked(assignRole).mockResolvedValueOnce([])

    const result = await assignNewRoleFromCSR("test-sub", 1)

    expect(result).toBe("SDM")
    expect(assignRole).toHaveBeenCalledWith("test-sub", "SDM")
  })

  it("maps csrRoleId 30 to Administrator and calls assignRole when sub provided", async () => {
    vi.mocked(assignRole).mockResolvedValueOnce([])

    const result = await assignNewRoleFromCSR("test-sub", 30)

    expect(result).toBe("Administrator")
    expect(assignRole).toHaveBeenCalledWith("test-sub", "Administrator")
  })

  it("defaults to CSR and calls assignRole when sub provided but csrRoleId is null", async () => {
    vi.mocked(assignRole).mockResolvedValueOnce([])

    const result = await assignNewRoleFromCSR("test-sub", null)

    expect(result).toBe("CSR")
    expect(assignRole).toHaveBeenCalledWith("test-sub", "CSR")
  })
})
