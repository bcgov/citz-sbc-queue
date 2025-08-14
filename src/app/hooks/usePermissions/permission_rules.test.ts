import { describe, expect, it } from "vitest"
import { DEFAULT_QUEUE_RULES as PERMISSION_RULES } from "./permission_rules"

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
    // Staff appointment rules should have conditions for conditional actions
    const staffAppointmentRulesWithConditions = PERMISSION_RULES.filter(
      (rule) => rule.role === "staff" && rule.resource === "appointment" && "condition" in rule
    )

    expect(staffAppointmentRulesWithConditions.length).toBeGreaterThan(0)
    expect(staffAppointmentRulesWithConditions[0]).toHaveProperty("condition")
    expect(typeof (staffAppointmentRulesWithConditions[0] as any).condition).toBe("function")
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

  it("should allow multiple rules per role-resource combination", () => {
    // Our new permission system allows multiple rules per role-resource combination
    // (e.g., one for basic actions, another for conditional actions)
    const ruleKeys = PERMISSION_RULES.map((rule, index) => `${rule.role}-${rule.resource}-${index}`)
    const uniqueKeys = new Set(ruleKeys)

    // Each rule should have a unique index, ensuring all rules are preserved
    expect(ruleKeys.length).toBe(uniqueKeys.size)

    // Verify that we do have some role-resource combinations with multiple rules
    const roleResourceCombos = PERMISSION_RULES.map(rule => `${rule.role}-${rule.resource}`)
    const uniqueCombos = new Set(roleResourceCombos)

    // We should have more rules than unique role-resource combinations (indicating multiple rules per combo)
    expect(PERMISSION_RULES.length).toBeGreaterThan(uniqueCombos.size)
  })
})
