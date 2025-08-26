import { describe, expect, it, vi } from "vitest"
import { ValidationError } from "./errors"
import { evaluatePermissions, safeEvaluatePermissions } from "./evaluate_permissions"
import type { PermissionContext, PermissionRule } from "./types"

describe("evaluate_permissions", () => {
  const mockContext: PermissionContext = {
    userId: "test-user-123",
    data: { userId: "resource-owner-123", assignedTo: "staff-456" },
  }

  const mockRules: readonly PermissionRule[] = [
    { role: "admin", resource: "*", actions: ["*"] },
    { role: "staff", resource: "appointment", actions: ["view", "create", "update"] },
    {
      role: "user",
      resource: "appointment",
      actions: ["view"],
      condition: (context) => context.userId === (context.data as Record<string, unknown>)?.userId,
    },
  ]

  describe("evaluatePermissions", () => {
    describe("basic permission checks", () => {
      it("should grant permission for admin with wildcard resource", () => {
        const wildcardRules: readonly PermissionRule[] = [
          { role: "admin", resource: "*", actions: ["*"] },
        ]

        const result = evaluatePermissions({
          userRole: "admin",
          resource: "*", // Must match exactly
          action: "*", // Action must also match exactly
          context: mockContext,
          rules: wildcardRules,
        })

        expect(result).toBe(true)
      })

      it("should grant permission for staff with specific resource and action", () => {
        const result = evaluatePermissions({
          userRole: "staff",
          resource: "appointment",
          action: "view",
          context: mockContext,
          rules: mockRules,
        })

        expect(result).toBe(true)
      })

      it("should deny permission for user without matching action", () => {
        const result = evaluatePermissions({
          userRole: "user",
          resource: "appointment",
          action: "create",
          context: mockContext,
          rules: mockRules,
        })

        expect(result).toBe(false)
      })

      it("should deny permission for unknown role", () => {
        const result = evaluatePermissions({
          userRole: "unknown",
          resource: "appointment",
          action: "view",
          context: mockContext,
          rules: mockRules,
        })

        expect(result).toBe(false)
      })
    })

    describe("conditional permissions", () => {
      it("should grant permission when condition is met", () => {
        const contextWithMatchingUser: PermissionContext = {
          userId: "test-user-123",
          data: { userId: "test-user-123" },
        }

        const result = evaluatePermissions({
          userRole: "user",
          resource: "appointment",
          action: "view",
          context: contextWithMatchingUser,
          rules: mockRules,
        })

        expect(result).toBe(true)
      })

      it("should deny permission when condition is not met", () => {
        const contextWithDifferentUser: PermissionContext = {
          userId: "test-user-123",
          data: { userId: "different-user-456" },
        }

        const result = evaluatePermissions({
          userRole: "user",
          resource: "appointment",
          action: "view",
          context: contextWithDifferentUser,
          rules: mockRules,
        })

        expect(result).toBe(false)
      })

      it("should handle missing context data gracefully", () => {
        const contextWithoutData: PermissionContext = {
          userId: "test-user-123",
          data: {},
        }

        const result = evaluatePermissions({
          userRole: "user",
          resource: "appointment",
          action: "view",
          context: contextWithoutData,
          rules: mockRules,
        })

        expect(result).toBe(false)
      })
    })

    describe("error handling", () => {
      it("should throw ValidationError for invalid role", () => {
        expect(() =>
          evaluatePermissions({
            userRole: "", // Empty string should trigger validation error
            resource: "appointment",
            action: "view",
            context: mockContext,
            rules: mockRules,
          })
        ).toThrow(ValidationError)
      })

      it("should throw ValidationError for invalid resource", () => {
        expect(() =>
          evaluatePermissions({
            userRole: "staff",
            resource: "",
            action: "view",
            context: mockContext,
            rules: mockRules,
          })
        ).toThrow(ValidationError)
      })

      it("should throw ValidationError for invalid action", () => {
        expect(() =>
          evaluatePermissions({
            userRole: "staff",
            resource: "appointment",
            action: "",
            context: mockContext,
            rules: mockRules,
          })
        ).toThrow(ValidationError)
      })

      it("should continue to next rule when condition throws error", () => {
        const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {
          // Mock implementation to suppress console output during tests
        })

        const rulesWithFailingCondition: readonly PermissionRule[] = [
          // First rule has failing condition
          {
            role: "staff",
            resource: "appointment",
            actions: ["update"],
            condition: () => {
              throw new Error("Condition evaluation failed")
            },
          },
          // Second rule allows unconditionally
          { role: "staff", resource: "appointment", actions: ["update"] },
        ]

        const result = evaluatePermissions({
          userRole: "staff",
          resource: "appointment",
          action: "update",
          context: mockContext,
          rules: rulesWithFailingCondition,
        })

        expect(result).toBe(true)
        expect(consoleSpy).toHaveBeenCalledWith(
          "Permission condition evaluation failed for rule:",
          expect.objectContaining({
            role: "staff",
            resource: "appointment",
            action: "update",
            error: "Condition evaluation failed",
          })
        )

        consoleSpy.mockRestore()
      })
    })

    describe("edge cases", () => {
      it("should handle empty rules array", () => {
        const result = evaluatePermissions({
          userRole: "admin",
          resource: "appointment",
          action: "view",
          context: mockContext,
          rules: [],
        })

        expect(result).toBe(false)
      })
    })
  })

  describe("safeEvaluatePermissions", () => {
    it("should return the result from evaluatePermissions when successful", () => {
      const result = safeEvaluatePermissions({
        userRole: "staff",
        resource: "appointment",
        action: "view",
        context: mockContext,
        rules: mockRules,
      })

      expect(result).toBe(true)
    })

    it("should return false and log warning for ValidationError", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {
        // Mock implementation to suppress console output during tests
      })

      const result = safeEvaluatePermissions({
        userRole: "", // Empty string should trigger validation error
        resource: "appointment",
        action: "view",
        context: mockContext,
        rules: mockRules,
      })

      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith(
        "Permission evaluation failed:",
        expect.objectContaining({
          userRole: "",
          resource: "appointment",
          action: "view",
          error: expect.stringContaining("Invalid role"),
        })
      )

      consoleSpy.mockRestore()
    })

    it("should return false and log warning for any error", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {
        // Mock implementation to suppress console output during tests
      })

      const problematicRules: readonly PermissionRule[] = [
        {
          role: "staff",
          resource: "appointment",
          actions: ["view"],
          condition: () => {
            throw new Error("Critical evaluation error")
          },
        },
      ]

      const result = safeEvaluatePermissions({
        userRole: "staff",
        resource: "appointment",
        action: "view",
        context: mockContext,
        rules: problematicRules,
      })

      expect(result).toBe(false)
      // The error should be logged as a condition evaluation error, not a permission evaluation error
      expect(consoleSpy).toHaveBeenCalledWith(
        "Permission condition evaluation failed for rule:",
        expect.objectContaining({
          role: "staff",
          resource: "appointment",
          action: "view",
          error: "Critical evaluation error",
        })
      )

      consoleSpy.mockRestore()
    })
  })

  describe("input validation", () => {
    it("should validate user role format", () => {
      expect(() =>
        evaluatePermissions({
          userRole: "",
          resource: "appointment",
          action: "view",
          context: mockContext,
          rules: mockRules,
        })
      ).toThrow(ValidationError)
    })

    it("should validate resource format", () => {
      expect(() =>
        evaluatePermissions({
          userRole: "staff",
          resource: "",
          action: "view",
          context: mockContext,
          rules: mockRules,
        })
      ).toThrow(ValidationError)
    })

    it("should validate action format", () => {
      expect(() =>
        evaluatePermissions({
          userRole: "staff",
          resource: "appointment",
          action: "",
          context: mockContext,
          rules: mockRules,
        })
      ).toThrow(ValidationError)
    })

    it("should handle valid alphanumeric values", () => {
      const validRules: readonly PermissionRule[] = [
        { role: "role123", resource: "resource456", actions: ["action789"] },
      ]

      const result = evaluatePermissions({
        userRole: "role123",
        resource: "resource456",
        action: "action789",
        context: mockContext,
        rules: validRules,
      })

      expect(result).toBe(true)
    })
  })

  describe("performance considerations", () => {
    it("should handle large rule sets efficiently", () => {
      const largeRuleSet: PermissionRule[] = []
      for (let i = 0; i < 1000; i++) {
        largeRuleSet.push({
          role: `role${i}`,
          resource: "appointment",
          actions: ["view"],
        })
      }

      // Add the target rule at the end
      largeRuleSet.push({
        role: "target_role",
        resource: "appointment",
        actions: ["view"],
      })

      const start = performance.now()
      const result = evaluatePermissions({
        userRole: "target_role",
        resource: "appointment",
        action: "view",
        context: mockContext,
        rules: largeRuleSet,
      })
      const end = performance.now()

      expect(result).toBe(true)
      expect(end - start).toBeLessThan(100) // Should complete within 100ms
    })

    it("should short-circuit on first matching rule", () => {
      let conditionCallCount = 0

      const rulesWithCounters: readonly PermissionRule[] = [
        {
          role: "staff",
          resource: "appointment",
          actions: ["view"],
          condition: () => {
            conditionCallCount++
            return true
          },
        },
        {
          role: "staff",
          resource: "appointment",
          actions: ["view"],
          condition: () => {
            conditionCallCount++
            return true
          },
        },
      ]

      const result = evaluatePermissions({
        userRole: "staff",
        resource: "appointment",
        action: "view",
        context: mockContext,
        rules: rulesWithCounters,
      })

      expect(result).toBe(true)
      expect(conditionCallCount).toBe(1) // Only first condition should be called
    })
  })
})
