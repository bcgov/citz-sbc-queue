import { describe, expect, it } from "vitest"
import { PERMISSION_RULES } from "./permission_rules"
import type { Resource, Role } from "./types"

describe("Permission Rules", () => {
  it("should have rules for all admin resources", () => {
    const adminRules = PERMISSION_RULES.filter((rule) => rule.role === "admin")
    const resources: Resource[] = ["appointment", "queue", "service", "user", "report", "settings"]

    resources.forEach((resource) => {
      const hasRule = adminRules.some((rule) => rule.resource === resource)
      expect(hasRule).toBe(true)
    })
  })

  it("should have consistent rule structure", () => {
    PERMISSION_RULES.forEach((rule) => {
      expect(rule).toHaveProperty("role")
      expect(rule).toHaveProperty("resource")
      expect(rule).toHaveProperty("actions")
      expect(Array.isArray(rule.actions)).toBe(true)
      expect(rule.actions.length).toBeGreaterThan(0)
    })
  })

  it("should have proper role coverage", () => {
    const roles: Role[] = ["admin", "manager", "staff", "citizen", "guest"]

    roles.forEach((role) => {
      const hasRules = PERMISSION_RULES.some((rule) => rule.role === role)
      expect(hasRules).toBe(true)
    })
  })

  it("should have conditions for context-sensitive permissions", () => {
    // Staff appointment rules should have conditions
    const staffAppointmentRules = PERMISSION_RULES.filter(
      (rule) => rule.role === "staff" && rule.resource === "appointment"
    )

    expect(staffAppointmentRules.length).toBeGreaterThan(0)
    expect(staffAppointmentRules[0]).toHaveProperty("condition")
    expect(typeof staffAppointmentRules[0].condition).toBe("function")
  })

  it("should grant admin full permissions", () => {
    const adminRules = PERMISSION_RULES.filter((rule) => rule.role === "admin")

    // Admin should have the most comprehensive permissions
    const adminActionCount = adminRules.reduce((total, rule) => total + rule.actions.length, 0)

    expect(adminActionCount).toBeGreaterThan(0)
    // Admin should have at least as many actions as any other single role
    const managerActionCount = PERMISSION_RULES.filter((rule) => rule.role === "manager").reduce(
      (total, rule) => total + rule.actions.length,
      0
    )

    expect(adminActionCount).toBeGreaterThanOrEqual(managerActionCount)
  })

  it("should restrict guest permissions appropriately", () => {
    const guestRules = PERMISSION_RULES.filter((rule) => rule.role === "guest")

    // Guests should only have view permissions
    guestRules.forEach((rule) => {
      expect(rule.actions).toContain("view")
      expect(rule.actions).not.toContain("create")
      expect(rule.actions).not.toContain("update")
      expect(rule.actions).not.toContain("delete")
    })

    // Guests should have limited resource access
    const guestResources = guestRules.map((rule) => rule.resource)
    expect(guestResources).not.toContain("user")
    expect(guestResources).not.toContain("report")
    expect(guestResources).not.toContain("settings")
    expect(guestResources).not.toContain("appointment")
  })

  it("should have no duplicate rules", () => {
    const ruleKeys = PERMISSION_RULES.map((rule) => `${rule.role}-${rule.resource}`)
    const uniqueKeys = new Set(ruleKeys)

    expect(ruleKeys.length).toBe(uniqueKeys.size)
  })
})
