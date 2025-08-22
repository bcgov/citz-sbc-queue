import { EvaluationError, ValidationError } from "./errors"
import { QUEUE_RULES } from "./permission_rules"
import type { PermissionContext, PermissionRule } from "./types"
import { validateAction, validateContext, validateResource, validateRole } from "./validators"

type EvaluatePermissionsProps = {
  userRole: string
  resource: string
  action: string
  context: PermissionContext
  rules?: readonly PermissionRule[]
}

/**
 * Core permission evaluation logic with comprehensive error handling.
 * This is a pure function that can be used on both client and server.
 *
 * @param props - The evaluation parameters
 * @param props.userRole - The role of the current user
 * @param props.resource - The resource being accessed
 * @param props.action - The action being performed
 * @param props.context - The permission context
 * @param props.rules - Optional permission rules (defaults to QUEUE_RULES)
 * @returns boolean indicating if the permission is granted
 * @throws {ValidationError} When input parameters are invalid
 * @throws {EvaluationError} When condition evaluation fails
 * @example
 * const hasPermission = evaluatePermissions({
 *   userRole: "staff",
 *   resource: "appointment",
 *   action: "update",
 *   context: { userId: "staff-123" }
 * });
 */
export function evaluatePermissions(props: EvaluatePermissionsProps): boolean {
  const { userRole, resource, action, context, rules = QUEUE_RULES } = props

  try {
    // Validate all inputs
    validateContext(context)
    validateAction(action)
    validateResource(resource)
    validateRole(userRole)

    // Find matching rules for the user's role and the requested resource
    const matchingRules = rules.filter(
      (rule: PermissionRule) => rule.role === userRole && rule.resource === resource
    )

    // If no rules found, permission is denied
    if (matchingRules.length === 0) {
      return false
    }

    // Check if any matching rule allows the action
    for (const rule of matchingRules) {
      // Check if the action is allowed by this rule (cast for readonly compatibility)
      if (!(rule.actions as string[]).includes(action)) {
        continue
      }

      // If there's no condition, permission is granted
      if (!("condition" in rule) || !rule.condition) {
        return true
      }

      // Evaluate the condition with proper error handling
      try {
        const conditionResult = rule.condition(context)
        if (conditionResult === true) {
          return true
        }
      } catch (conditionError) {
        // Log the condition evaluation error but continue to next rule
        console.warn(`Permission condition evaluation failed for rule:`, {
          role: rule.role,
          resource: rule.resource,
          action,
          error: conditionError instanceof Error ? conditionError.message : String(conditionError),
        })
      }
    }

    // No rule granted permission
    return false
  } catch (error) {
    // Re-throw validation errors as-is
    if (error instanceof ValidationError) {
      throw error
    }

    // Wrap unexpected errors in EvaluationError
    const message = error instanceof Error ? error.message : String(error)
    throw new EvaluationError(`Permission evaluation failed: ${message}`)
  }
}

/**
 * Safe wrapper for evaluatePermissions that never throws.
 * Returns false for any error during evaluation.
 * Useful for UI components that need graceful degradation.
 *
 * @param props - The evaluation parameters (same as evaluatePermissions)
 * @returns boolean indicating if the permission is granted, false on any error
 * @example
 * const canEdit = safeEvaluatePermissions({
 *   userRole: "citizen",
 *   resource: "appointment",
 *   action: "update",
 *   context: { userId: "citizen-123" }
 * });
 */
export function safeEvaluatePermissions(props: EvaluatePermissionsProps): boolean {
  try {
    return evaluatePermissions(props)
  } catch (error) {
    // Log error for debugging but don't throw
    console.warn("Permission evaluation failed:", {
      userRole: props.userRole,
      resource: props.resource,
      action: props.action,
      error: error instanceof Error ? error.message : String(error),
    })
    return false
  }
}
