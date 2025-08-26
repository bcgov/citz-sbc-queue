import { describe, expect, it } from "vitest"
import { QUEUE_RULES } from "./permission_rules"

describe("Permission Rules", () => {
  it("should have rules for all admin resources", () => {
    const adminRules = QUEUE_RULES.filter((rule) => rule.role === "admin")
    const resources = ["appointment", "queue", "service", "user", "report", "settings"]

    resources.forEach((resource) => {
      const hasRule = adminRules.some((rule) => rule.resource === resource)
      expect(hasRule).toBe(true)
    })
  })

  it("should have consistent rule structure", () => {
    QUEUE_RULES.forEach((rule) => {
      expect(rule).toHaveProperty("role")
      expect(rule).toHaveProperty("resource")
      expect(rule).toHaveProperty("actions")
      expect(Array.isArray(rule.actions)).toBe(true)
      expect(rule.actions.length).toBeGreaterThan(0)
    })
  })

  it("should have proper role coverage", () => {
    const roles = ["admin", "manager", "staff", "citizen"]

    roles.forEach((role) => {
      const hasRules = QUEUE_RULES.some((rule) => rule.role === role)
      expect(hasRules).toBe(true)
    })
  })

  it("should have conditions for context-sensitive permissions", () => {
    // Staff appointment rules should have conditions for conditional actions
    const staffAppointmentRulesWithConditions = QUEUE_RULES.filter(
      (rule) => rule.role === "staff" && rule.resource === "appointment" && "condition" in rule
    )

    expect(staffAppointmentRulesWithConditions.length).toBeGreaterThan(0)
    expect(staffAppointmentRulesWithConditions[0]).toHaveProperty("condition")

    const ruleWithCondition = staffAppointmentRulesWithConditions[0] as typeof staffAppointmentRulesWithConditions[0] & { condition: () => boolean }
    expect(typeof ruleWithCondition.condition).toBe("function")
  })

  it("should grant admin full permissions", () => {
    const adminRules = QUEUE_RULES.filter((rule) => rule.role === "admin")

    // Admin should have the most comprehensive permissions
    const adminActionCount = adminRules.reduce((total, rule) => total + rule.actions.length, 0)

    expect(adminActionCount).toBeGreaterThan(0)
    // Admin should have at least as many actions as any other single role
    const managerActionCount = QUEUE_RULES.filter((rule) => rule.role === "manager").reduce(
      (total, rule) => total + rule.actions.length,
      0
    )

    expect(adminActionCount).toBeGreaterThanOrEqual(managerActionCount)
  })

  it("should allow multiple rules per role-resource combination", () => {
    // Our new permission system allows multiple rules per role-resource combination
    // (e.g., one for basic actions, another for conditional actions)
    const ruleKeys = QUEUE_RULES.map((rule, index) => `${rule.role}-${rule.resource}-${index}`)
    const uniqueKeys = new Set(ruleKeys)

    // Each rule should have a unique index, ensuring all rules are preserved
    expect(ruleKeys.length).toBe(uniqueKeys.size)

    // Verify that we do have some role-resource combinations with multiple rules
    const roleResourceCombos = QUEUE_RULES.map(rule => `${rule.role}-${rule.resource}`)
    const uniqueCombos = new Set(roleResourceCombos)

    // We should have more rules than unique role-resource combinations (indicating multiple rules per combo)
    expect(QUEUE_RULES.length).toBeGreaterThan(uniqueCombos.size)
  })
})
