import { DEFAULT_QUEUE_RULES } from "./permission_rules"
import type { PermissionContext, PermissionRule } from "./types"

/**
 * Core permission evaluation logic with configurable rules
 *
 * This function can be shared between client-side hooks and server-side API routes.
 * It evaluates user context against permission rules to determine if a specific action is allowed.
 *
 * @param props - Evaluation parameters with userRole, resource, action, context, and rules
 * @returns boolean indicating if the permission is granted
 *
 * @example
 * ```typescript
 * // Using default queue management rules
 * const canUpdate = evaluatePermissions({
 *   userRole: 'staff',
 *   resource: 'appointment',
 *   action: 'update',
 *   context: { userId: 'user-123', data: { assignedTo: 'user-123' } }
 * });
 *
 * // Using custom project-specific rules
 * const customRules = [
 *   { role: 'editor', resource: 'document', actions: ['view', 'edit'], condition: (ctx) => ctx.data?.owner === ctx.userId }
 * ];
 * const canEdit = evaluatePermissions({
 *   userRole: 'editor',
 *   resource: 'document',
 *   action: 'edit',
 *   context: { userId: 'user-123' },
 *   rules: customRules
 * });
 * ```
 */

type EvaluatePermissionsProps = {
  userRole: string
  resource: string
  action: string
  context: PermissionContext
  rules?: readonly PermissionRule[]
}

/**
 * Custom Error Classes for Permission System
 */
export class PermissionError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message)
    this.name = "PermissionError"
  }
}

export class ValidationError extends PermissionError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR")
  }
}

export class EvaluationError extends PermissionError {
  constructor(message: string) {
    super(message, "EVALUATION_ERROR")
  }
}

/**
 * Validation Functions
 */
const validateRole = (role: unknown): void => {
  if (typeof role !== "string" || role.trim() === "") {
    throw new ValidationError(`Invalid role: ${role}. Must be a non-empty string`)
  }
}

const validateAction = (action: unknown): void => {
  if (typeof action !== "string" || action.trim() === "") {
    throw new ValidationError(`Invalid action: ${action}. Must be a non-empty string`)
  }
}

const validateResource = (resource: unknown): void => {
  if (typeof resource !== "string" || resource.trim() === "") {
    throw new ValidationError(`Invalid resource: ${resource}. Must be a non-empty string`)
  }
}

/**
 * Context Helper Functions - Extract values from flexible context structures
 */
const validateContext = (context: unknown): void => {
  if (!context || typeof context !== "object") {
    throw new ValidationError("Permission context must be a non-null object")
  }
}

/**
 * Core permission evaluation logic with comprehensive error handling.
 * This is a pure function that can be used on both client and server.
 *
 * @param props - The evaluation parameters
 * @returns boolean indicating if the permission is granted
 * @throws {ValidationError} When input parameters are invalid
 * @throws {EvaluationError} When condition evaluation fails
 */
export function evaluatePermissions(props: EvaluatePermissionsProps): boolean {
  const { userRole, resource, action, context, rules = DEFAULT_QUEUE_RULES } = props

  try {
    // Validate all inputs
    validateContext(context)
    validateAction(action)
    validateResource(resource)
    validateRole(userRole)

    // Find matching rules for the user's role and the requested resource
    const matchingRules = rules.filter(
      (rule) => rule.role === userRole && rule.resource === resource
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
      if (!('condition' in rule) || !rule.condition) {
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
