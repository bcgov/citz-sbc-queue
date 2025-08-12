import { describe, expect, it } from "vitest"
import {
  evaluatePermissions,
  safeEvaluatePermissions,
  ValidationError,
} from "./evaluate_permissions"
import type { PermissionContext } from "./types"

describe("evaluatePermissions", () => {
  describe("Admin permissions", () => {
    it("should grant full access to all resources", () => {
      const context: PermissionContext = {
        userId: "admin-user",
        role: "admin",
      }

      // Test all actions for appointment resource
      expect(evaluatePermissions(context, "view", "appointment")).toBe(true)
      expect(evaluatePermissions(context, "create", "appointment")).toBe(true)
      expect(evaluatePermissions(context, "update", "appointment")).toBe(true)
      expect(evaluatePermissions(context, "delete", "appointment")).toBe(true)
      expect(evaluatePermissions(context, "approve", "appointment")).toBe(true)
      expect(evaluatePermissions(context, "assign", "appointment")).toBe(true)
      expect(evaluatePermissions(context, "cancel", "appointment")).toBe(true)
    })

    it("should have permissions for all resource types", () => {
      const context: PermissionContext = {
        userId: "admin-user",
        role: "admin",
      }

      // Test at least view permission for all resources
      expect(evaluatePermissions(context, "view", "appointment")).toBe(true)
      expect(evaluatePermissions(context, "view", "queue")).toBe(true)
      expect(evaluatePermissions(context, "view", "service")).toBe(true)
      expect(evaluatePermissions(context, "view", "user")).toBe(true)
      expect(evaluatePermissions(context, "view", "report")).toBe(true)
      expect(evaluatePermissions(context, "view", "settings")).toBe(true)
    })
  })

  describe("Manager permissions", () => {
    it("should grant management permissions for appointments", () => {
      const context: PermissionContext = {
        userId: "manager-user",
        role: "manager",
      }

      expect(evaluatePermissions(context, "view", "appointment")).toBe(true)
      expect(evaluatePermissions(context, "create", "appointment")).toBe(true)
      expect(evaluatePermissions(context, "update", "appointment")).toBe(true)
      expect(evaluatePermissions(context, "approve", "appointment")).toBe(true)
      expect(evaluatePermissions(context, "assign", "appointment")).toBe(true)
      expect(evaluatePermissions(context, "cancel", "appointment")).toBe(true)
      // Manager shouldn't have delete permission for appointments
      expect(evaluatePermissions(context, "delete", "appointment")).toBe(false)
    })

    it("should allow managing staff users but not other managers", () => {
      // Manager managing staff user
      const staffContext: PermissionContext = {
        userId: "manager-user",
        role: "manager",
        data: { role: "staff" },
      }

      expect(evaluatePermissions(staffContext, "view", "user")).toBe(true)
      expect(evaluatePermissions(staffContext, "update", "user")).toBe(true)

      // Manager managing citizen
      const citizenContext: PermissionContext = {
        userId: "manager-user",
        role: "manager",
        data: { role: "citizen" },
      }

      expect(evaluatePermissions(citizenContext, "view", "user")).toBe(true)
      expect(evaluatePermissions(citizenContext, "update", "user")).toBe(true)

      // Manager shouldn't manage other managers
      const managerContext: PermissionContext = {
        userId: "manager-user",
        role: "manager",
        data: { role: "manager" },
      }

      expect(evaluatePermissions(managerContext, "view", "user")).toBe(false)
      expect(evaluatePermissions(managerContext, "update", "user")).toBe(false)
    })

    it("should have read-only access to settings", () => {
      const context: PermissionContext = {
        userId: "manager-user",
        role: "manager",
      }

      expect(evaluatePermissions(context, "view", "settings")).toBe(true)
      expect(evaluatePermissions(context, "update", "settings")).toBe(false)
      expect(evaluatePermissions(context, "create", "settings")).toBe(false)
      expect(evaluatePermissions(context, "delete", "settings")).toBe(false)
    })
  })

  describe("Staff permissions", () => {
    it("should allow modifying own assigned appointments", () => {
      const context: PermissionContext = {
        userId: "staff-user",
        role: "staff",
        data: { assignedTo: "staff-user" },
      }

      expect(evaluatePermissions(context, "view", "appointment")).toBe(true)
      expect(evaluatePermissions(context, "create", "appointment")).toBe(true)
      expect(evaluatePermissions(context, "update", "appointment")).toBe(true)
      expect(evaluatePermissions(context, "assign", "appointment")).toBe(true)
      // Staff shouldn't have approve or cancel permissions
      expect(evaluatePermissions(context, "approve", "appointment")).toBe(false)
      expect(evaluatePermissions(context, "cancel", "appointment")).toBe(false)
    })

    it("should allow modifying unassigned appointments", () => {
      const context: PermissionContext = {
        userId: "staff-user",
        role: "staff",
        data: {}, // No assignedTo means unassigned
      }

      expect(evaluatePermissions(context, "view", "appointment")).toBe(true)
      expect(evaluatePermissions(context, "update", "appointment")).toBe(true)
      expect(evaluatePermissions(context, "assign", "appointment")).toBe(true)
    })

    it("should not allow modifying appointments assigned to others", () => {
      const context: PermissionContext = {
        userId: "staff-user",
        role: "staff",
        data: { assignedTo: "other-staff" },
      }

      expect(evaluatePermissions(context, "view", "appointment")).toBe(false)
      expect(evaluatePermissions(context, "update", "appointment")).toBe(false)
      expect(evaluatePermissions(context, "assign", "appointment")).toBe(false)
    })

    it("should only view citizen profiles", () => {
      // Staff viewing citizen
      const citizenContext: PermissionContext = {
        userId: "staff-user",
        role: "staff",
        data: { role: "citizen" },
      }

      expect(evaluatePermissions(citizenContext, "view", "user")).toBe(true)
      expect(evaluatePermissions(citizenContext, "update", "user")).toBe(false)

      // Staff shouldn't view other staff or managers
      const staffContext: PermissionContext = {
        userId: "staff-user",
        role: "staff",
        data: { role: "staff" },
      }

      expect(evaluatePermissions(staffContext, "view", "user")).toBe(false)
    })
  })

  describe("Citizen permissions", () => {
    it("should allow managing own appointments", () => {
      const context: PermissionContext = {
        userId: "citizen-user",
        role: "citizen",
        data: { userId: "citizen-user" },
      }

      expect(evaluatePermissions(context, "view", "appointment")).toBe(true)
      expect(evaluatePermissions(context, "create", "appointment")).toBe(true)
      expect(evaluatePermissions(context, "update", "appointment")).toBe(true)
      expect(evaluatePermissions(context, "cancel", "appointment")).toBe(true)
      // Citizens shouldn't have admin permissions
      expect(evaluatePermissions(context, "approve", "appointment")).toBe(false)
      expect(evaluatePermissions(context, "assign", "appointment")).toBe(false)
    })

    it("should not allow accessing other users appointments", () => {
      const context: PermissionContext = {
        userId: "citizen-user",
        role: "citizen",
        data: { userId: "other-user" },
      }

      expect(evaluatePermissions(context, "view", "appointment")).toBe(false)
      expect(evaluatePermissions(context, "update", "appointment")).toBe(false)
      expect(evaluatePermissions(context, "cancel", "appointment")).toBe(false)
    })

    it("should allow managing own profile only", () => {
      // Own profile
      const ownContext: PermissionContext = {
        userId: "citizen-user",
        role: "citizen",
        data: { userId: "citizen-user" },
      }

      expect(evaluatePermissions(ownContext, "view", "user")).toBe(true)
      expect(evaluatePermissions(ownContext, "update", "user")).toBe(true)

      // Other user's profile
      const otherContext: PermissionContext = {
        userId: "citizen-user",
        role: "citizen",
        data: { userId: "other-user" },
      }

      expect(evaluatePermissions(otherContext, "view", "user")).toBe(false)
      expect(evaluatePermissions(otherContext, "update", "user")).toBe(false)
    })

    it("should have read access to services and queues", () => {
      const context: PermissionContext = {
        userId: "citizen-user",
        role: "citizen",
      }

      expect(evaluatePermissions(context, "view", "service")).toBe(true)
      expect(evaluatePermissions(context, "view", "queue")).toBe(true)
      // But not write access
      expect(evaluatePermissions(context, "create", "service")).toBe(false)
      expect(evaluatePermissions(context, "update", "queue")).toBe(false)
    })
  })

  describe("Guest permissions", () => {
    it("should have limited read access to services and queues", () => {
      const context: PermissionContext = {
        userId: "guest-user",
        role: "guest",
      }

      expect(evaluatePermissions(context, "view", "service")).toBe(true)
      expect(evaluatePermissions(context, "view", "queue")).toBe(true)
      // No write access
      expect(evaluatePermissions(context, "create", "service")).toBe(false)
      expect(evaluatePermissions(context, "update", "queue")).toBe(false)
    })

    it("should have no access to restricted resources", () => {
      const context: PermissionContext = {
        userId: "guest-user",
        role: "guest",
      }

      const restrictedResources = ["appointment", "user", "report", "settings"] as const

      restrictedResources.forEach((resource) => {
        expect(evaluatePermissions(context, "view", resource)).toBe(false)
        expect(evaluatePermissions(context, "create", resource)).toBe(false)
      })
    })
  })

  describe("Error handling and validation", () => {
    it("should accept any valid string for role", () => {
      const context = {
        userId: "test-user",
        role: "custom-role", // Now valid since roles are generic strings
      }

      // Should not throw for any valid string role
      expect(() =>
        evaluatePermissions(context as PermissionContext, "view", "appointment")
      ).not.toThrow()
    })

    it("should accept any valid string for action", () => {
      const context: PermissionContext = {
        userId: "test-user",
        role: "admin",
      }

      // Should not throw for any valid string action
      expect(() => evaluatePermissions(context, "custom-action", "appointment")).not.toThrow()
    })

    it("should accept any valid string for resource", () => {
      const context: PermissionContext = {
        userId: "test-user",
        role: "admin",
      }

      // Should not throw for any valid string resource
      expect(() => evaluatePermissions(context, "view", "custom-resource")).not.toThrow()
    })

    it("should throw ValidationError for invalid context", () => {
      expect(() => evaluatePermissions(null as never, "view", "appointment")).toThrow(
        ValidationError
      )
      expect(() => evaluatePermissions({} as PermissionContext, "view", "appointment")).toThrow(
        ValidationError
      )
      expect(() =>
        evaluatePermissions({ userId: "" } as PermissionContext, "view", "appointment")
      ).toThrow(ValidationError)
    })

    it("should handle condition evaluation errors gracefully", () => {
      const context: PermissionContext = {
        userId: "test-user",
        role: "citizen",
        data: { userId: "test-user" },
      }

      // This should work normally - no error in condition
      expect(evaluatePermissions(context, "view", "appointment")).toBe(true)

      // If we had a malformed context that causes condition error, it should continue to next rule
      const malformedContext: PermissionContext = {
        userId: "test-user",
        role: "citizen",
        data: undefined,
      }

      // Should not throw but return false
      expect(() => evaluatePermissions(malformedContext, "view", "appointment")).not.toThrow()
    })
  })

  describe("safeEvaluatePermissions", () => {
    it("should never throw errors", () => {
      const invalidContext = null

      expect(() =>
        safeEvaluatePermissions(invalidContext as never, "view", "appointment")
      ).not.toThrow()
      expect(safeEvaluatePermissions(invalidContext as never, "view", "appointment")).toBe(false)
    })

    it("should return same result as evaluatePermissions for valid input", () => {
      const context: PermissionContext = {
        userId: "admin-user",
        role: "admin",
      }

      expect(safeEvaluatePermissions(context, "view", "appointment")).toBe(
        evaluatePermissions(context, "view", "appointment")
      )
    })

    it("should return false for invalid input instead of throwing", () => {
      expect(safeEvaluatePermissions(null as never, "view", "appointment")).toBe(false)
      expect(
        safeEvaluatePermissions({} as PermissionContext, "invalid-action" as never, "appointment")
      ).toBe(false)
    })
  })
})
