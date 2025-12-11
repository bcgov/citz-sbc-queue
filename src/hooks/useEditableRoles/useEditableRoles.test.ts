import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { UseAuthReturn } from "@/hooks/useAuth"
import { useEditableRoles } from "./useEditableRoles"

const mockUseAuth = vi.hoisted(() => ({
  useAuth: vi.fn(
    (): UseAuthReturn => ({
      isAuthenticated: false,
      hasRole: (): boolean => false,
    })
  ),
}))

vi.mock("@/hooks/useAuth", () => mockUseAuth)

describe("useEditableRoles", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return empty array when user has no roles", () => {
    mockUseAuth.useAuth.mockReturnValue({
      isAuthenticated: false,
      hasRole: (): boolean => false,
    } as UseAuthReturn)

    const { result } = renderHook(() => useEditableRoles())

    expect(result.current).toEqual([])
  })

  it("should return CSR role when user has CSR role", () => {
    mockUseAuth.useAuth.mockReturnValue({
      isAuthenticated: true,
      hasRole: (role: string): boolean => role === "CSR",
    } as UseAuthReturn)

    const { result } = renderHook(() => useEditableRoles())

    expect(result.current).toEqual(["CSR"])
  })

  it("should return CSR and SCSR roles when user has SCSR role", () => {
    mockUseAuth.useAuth.mockReturnValue({
      isAuthenticated: true,
      hasRole: (role: string): boolean => role === "SCSR",
    } as UseAuthReturn)

    const { result } = renderHook(() => useEditableRoles())

    expect(result.current).toEqual(["CSR", "SCSR"])
  })

  it("should return CSR, SCSR, and SDM roles when user has SDM role", () => {
    mockUseAuth.useAuth.mockReturnValue({
      isAuthenticated: true,
      hasRole: (role: string): boolean => role === "SDM",
    } as UseAuthReturn)

    const { result } = renderHook(() => useEditableRoles())

    expect(result.current).toEqual(["CSR", "SCSR", "SDM"])
  })

  it("should return all roles when user has Administrator role", () => {
    mockUseAuth.useAuth.mockReturnValue({
      isAuthenticated: true,
      hasRole: (role: string): boolean => role === "Administrator",
    } as UseAuthReturn)

    const { result } = renderHook(() => useEditableRoles())

    expect(result.current).toEqual(["CSR", "SCSR", "SDM", "Administrator"])
  })

  it("should return highest role and all lower roles when user has multiple roles", () => {
    mockUseAuth.useAuth.mockReturnValue({
      isAuthenticated: true,
      hasRole: (role: string): boolean => ["CSR", "Administrator"].includes(role),
    } as UseAuthReturn)

    const { result } = renderHook(() => useEditableRoles())

    // Should return up to Administrator (highest role)
    expect(result.current).toEqual(["CSR", "SCSR", "SDM", "Administrator"])
  })
})
