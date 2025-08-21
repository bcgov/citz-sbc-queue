import { renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { usePermissions } from "./usePermissions"

describe("usePermissions hook - Simplified API", () => {
  it("should return results and utility functions", () => {
    const { result } = renderHook(() =>
      usePermissions({
        userRole: "admin",
        context: { user_id: "test-user" },
        checks: [
          { resource: "appointment" },
        ]
      })
    )

    expect(result.current.results).toBeDefined()
    expect(Array.isArray(result.current.results)).toBe(true)
    expect(typeof result.current.hasPermission).toBe("function")
    expect(typeof result.current.hasAnyPermission).toBe("function")
    expect(typeof result.current.hasAllPermissions).toBe("function")
    expect(typeof result.current.getResourcePermissions).toBe("function")
  })

  it("should return all actions evaluated for admin", () => {
    const { result } = renderHook(() =>
      usePermissions({
        userRole: "admin",
        context: { user_id: "admin-user" },
        checks: [
          { resource: "appointment" },
        ]
      })
    )

    const appointmentResults = result.current.getResourcePermissions("appointment")
    expect(appointmentResults.length).toBeGreaterThan(0)

    // Admin should have all permissions
    const viewPermission = appointmentResults.find(r => r.action === "view")
    const deletePermission = appointmentResults.find(r => r.action === "delete")

    expect(viewPermission?.hasPermission).toBe(true)
    expect(deletePermission?.hasPermission).toBe(true)
    expect(result.current.hasPermission("appointment", "view")).toBe(true)
    expect(result.current.hasPermission("appointment", "delete")).toBe(true)
  })

  it("should check single permission correctly for staff", () => {
    const { result } = renderHook(() =>
      usePermissions({
        userRole: "staff",
        context: { user_id: "staff-user" },
        checks: [
          { resource: "appointment", data: { assignedTo: "staff-user" } },
        ]
      })
    )

    expect(result.current.hasPermission("appointment", "view")).toBe(true)
    expect(result.current.hasPermission("appointment", "delete")).toBe(false)
  })

  it("should check any permission correctly", () => {
    const { result } = renderHook(() =>
      usePermissions({
        userRole: "citizen",
        context: { user_id: "citizen-user" },
        checks: [
          { resource: "appointment", data: { userId: "citizen-user" } },
        ]
      })
    )

    expect(result.current.hasAnyPermission("appointment", ["view", "delete"])).toBe(true)
    expect(result.current.hasAnyPermission("appointment", ["delete", "approve"])).toBe(false)
  })

  it("should check all permissions correctly", () => {
    const { result } = renderHook(() =>
      usePermissions({
        userRole: "admin",
        context: { user_id: "admin-user" },
        checks: [
          { resource: "appointment" },
        ]
      })
    )

    expect(result.current.hasAllPermissions("appointment", ["view", "create"])).toBe(true)
    expect(result.current.hasAllPermissions("appointment", ["view", "delete", "create", "approve"])).toBe(true)
  })

  it("should update permissions when props change", () => {
    const { result, rerender } = renderHook((props) => usePermissions(props), {
      initialProps: {
        userRole: "staff" as const,
        context: { userId: "staff-user" },
        checks: [
          { resource: "appointment" as const, data: { assignedTo: "staff-user" } },
        ]
      },
    })

    // Staff can view all appointments, but can update ones assigned to them
    expect(result.current.hasPermission("appointment", "view")).toBe(true)
    expect(result.current.hasPermission("appointment", "update")).toBe(true)

    // Change assignment to another user
    rerender({
      userRole: "staff",
      context: { userId: "staff-user" },
      checks: [
        { resource: "appointment", data: { assignedTo: "other-staff" } },
      ]
    })

    // Staff can still view (no condition on view), but can't update (condition fails)
    expect(result.current.hasPermission("appointment", "view")).toBe(true)
    expect(result.current.hasPermission("appointment", "update")).toBe(false)
  })

  it("should memoize results correctly", () => {
    const { result, rerender } = renderHook((props) => usePermissions(props), {
      initialProps: {
        userRole: "admin" as const,
        context: { user_id: "admin-user" },
        checks: [
          { resource: "appointment" as const },
        ]
      },
    })

    const firstResults = result.current.results

    // Rerender with same props
    rerender({
      userRole: "admin",
      context: { user_id: "admin-user" },
      checks: [
        { resource: "appointment" },
      ]
    })

    // Results should have same content (deep equality)
    expect(result.current.results).toStrictEqual(firstResults)
    // Functions should work correctly after rerender
    expect(result.current.hasPermission("appointment", "view")).toBe(true)
    expect(result.current.hasPermission("appointment", "delete")).toBe(true)
  })
})
