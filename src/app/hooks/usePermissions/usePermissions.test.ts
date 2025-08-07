import { renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import type { Action, Resource, Role } from "./types"
import { usePermissions } from "./usePermissions"

describe("usePermissions hook", () => {
  it("should return permissions and utility functions", () => {
    const { result } = renderHook(() =>
      usePermissions({
        userId: "test-user",
        role: "admin",
        resource: "appointment",
      })
    )

    expect(result.current.permissions).toBeDefined()
    expect(typeof result.current.hasPermission).toBe("function")
    expect(typeof result.current.hasAnyPermission).toBe("function")
    expect(typeof result.current.hasAllPermissions).toBe("function")
  })

  it("should return correct permissions for admin", () => {
    const { result } = renderHook(() =>
      usePermissions({
        userId: "admin-user",
        role: "admin",
        resource: "appointment",
      })
    )

    expect(result.current.permissions).toContain("view")
    expect(result.current.permissions).toContain("delete")
    expect(result.current.hasPermission("view")).toBe(true)
    expect(result.current.hasPermission("delete")).toBe(true)
  })

  it("should check single permission correctly", () => {
    const { result } = renderHook(() =>
      usePermissions({
        userId: "staff-user",
        role: "staff",
        resource: "appointment",
        data: { assignedTo: "staff-user" },
      })
    )

    expect(result.current.hasPermission("view")).toBe(true)
    expect(result.current.hasPermission("delete")).toBe(false)
  })

  it("should check any permission correctly", () => {
    const { result } = renderHook(() =>
      usePermissions({
        userId: "citizen-user",
        role: "citizen",
        resource: "appointment",
        data: { userId: "citizen-user" },
      })
    )

    expect(result.current.hasAnyPermission(["view", "delete"])).toBe(true)
    expect(result.current.hasAnyPermission(["delete", "approve"])).toBe(false)
  })

  it("should check all permissions correctly", () => {
    const { result } = renderHook(() =>
      usePermissions({
        userId: "admin-user",
        role: "admin",
        resource: "appointment",
      })
    )

    expect(result.current.hasAllPermissions(["view", "create"])).toBe(true)
    expect(result.current.hasAllPermissions(["view", "nonexistent" as Action])).toBe(false)
  })

  it("should update permissions when props change", () => {
    const { result, rerender } = renderHook((props) => usePermissions(props), {
      initialProps: {
        userId: "staff-user",
        role: "staff" as Role,
        resource: "appointment" as Resource,
        data: { assignedTo: "staff-user" },
      },
    })

    expect(result.current.hasPermission("view")).toBe(true)

    // Change assignment to another user
    rerender({
      userId: "staff-user",
      role: "staff",
      resource: "appointment",
      data: { assignedTo: "other-staff" },
    })

    expect(result.current.hasPermission("view")).toBe(false)
  })

  it("should memoize results correctly", () => {
    const { result, rerender } = renderHook((props) => usePermissions(props), {
      initialProps: {
        userId: "admin-user",
        role: "admin" as Role,
        resource: "appointment" as Resource,
      },
    })

    const firstPermissions = result.current.permissions
    const firstHasPermission = result.current.hasPermission

    // Rerender with same props
    rerender({
      userId: "admin-user",
      role: "admin",
      resource: "appointment",
    })

    expect(result.current.permissions).toBe(firstPermissions)
    expect(result.current.hasPermission).toBe(firstHasPermission)
  })
})
