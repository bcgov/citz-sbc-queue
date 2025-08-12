import { DEFAULT_QUEUE_RULES } from "./permission_rules"
import type { Action, PermissionContext, PermissionRule, Resource, Role } from "./types"

/**
 * Core permission evaluation logic with configurable rules
 *
 * This function can be shared between client-side hooks and server-side API routes.
 * It evaluates user context against permission rules to determine if a specific action is allowed.
 *
 * @param context - Permission context including userId, role, and optional data
 * @param action - The specific action to check permission for
 * @param resource - The resource to check permission against
 * @param rules - Optional custom permission rules (defaults to queue management rules)
 * @returns boolean indicating if the permission is granted
 *
 * @example
 * ```typescript
 * // Using default queue management rules
 * const canUpdate = evaluatePermissions(
 *   { userId: 'user-123', role: 'staff', data: { assignedTo: 'user-123' } },
 *   'update',
 *   'appointment'
 * );
 *
 * // Using custom project-specific rules
 * const customRules = [
 *   { role: 'editor', resource: 'document', actions: ['view', 'edit'], condition: (ctx) => ctx.data?.owner === ctx.userId }
 * ];
 * const canEdit = evaluatePermissions(context, 'edit', 'document', customRules);
 * ```
 */

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
const validateRole: (role: unknown) => asserts role is Role = (
  role: unknown
): asserts role is Role => {
  if (typeof role !== "string" || role.trim() === "") {
    throw new ValidationError(`Invalid role: ${role}. Must be a non-empty string`)
  }
}

const validateAction: (action: unknown) => asserts action is Action = (
  action: unknown
): asserts action is Action => {
  if (typeof action !== "string" || action.trim() === "") {
    throw new ValidationError(`Invalid action: ${action}. Must be a non-empty string`)
  }
}

const validateResource: (resource: unknown) => asserts resource is Resource = (
  resource: unknown
): asserts resource is Resource => {
  if (typeof resource !== "string" || resource.trim() === "") {
    throw new ValidationError(`Invalid resource: ${resource}. Must be a non-empty string`)
  }
}

/**
 * Context Helper Functions - Extract values from flexible context structures
 */
const getUserId = (ctx: PermissionContext): string | undefined => {
  // Support various field naming conventions
  return (ctx.userId || ctx.user_id || ctx.id || ctx.sub) as string | undefined
}

const getRole = (ctx: PermissionContext): Role | undefined => {
  // Support various role field conventions
  return (ctx.role || ctx.userRole || ctx.user_role) as Role | undefined
}

const validateContext: (context: unknown) => asserts context is PermissionContext = (
  context: unknown
): asserts context is PermissionContext => {
  if (!context || typeof context !== "object") {
    throw new ValidationError("Permission context must be a non-null object")
  }

  const ctx = context as PermissionContext

  // Extract userId using flexible field access
  const userId = getUserId(ctx)
  if (typeof userId !== "string" || userId.trim() === "") {
    throw new ValidationError(
      "Permission context must have a valid userId (supports: userId, user_id, id, sub)"
    )
  }

  // Extract role using flexible field access
  const role = getRole(ctx)
  if (!role) {
    throw new ValidationError(
      "Permission context must have a valid role (supports: role, userRole, user_role)"
    )
  }

  validateRole(role)
}

/**
 * Core permission evaluation logic with comprehensive error handling.
 * This is a pure function that can be used on both client and server.
 *
 * @param context - The permission context containing user info and optional data
 * @param action - The action to check permission for
 * @param resource - The resource to check permission for
 * @returns boolean indicating if the permission is granted
 * @throws {ValidationError} When input parameters are invalid
 * @throws {EvaluationError} When condition evaluation fails
 */
export function evaluatePermissions(
  context: PermissionContext,
  action: Action,
  resource: Resource,
  rules: PermissionRule[] = DEFAULT_QUEUE_RULES
): boolean {
  try {
    // Validate all inputs
    validateContext(context)
    validateAction(action)
    validateResource(resource)

    // Extract role using flexible context access (guaranteed to exist after validation)
    const role = getRole(context) as Role

    // Find matching rules for the user's role and the requested resource
    const matchingRules = rules.filter(
      (rule: PermissionRule) => rule.role === role && rule.resource === resource
    )

    // If no rules found, permission is denied
    if (matchingRules.length === 0) {
      return false
    }

    // Check if any matching rule allows the action
    for (const rule of matchingRules) {
      // Check if the action is allowed by this rule
      if (!rule.actions.includes(action)) {
        continue
      }

      // If there's no condition, permission is granted
      if (!rule.condition) {
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
export function safeEvaluatePermissions(
  context: PermissionContext,
  action: Action,
  resource: Resource
): boolean {
  try {
    return evaluatePermissions(context, action, resource)
  } catch (error) {
    // Log error for debugging but don't throw
    console.warn("Permission evaluation failed:", {
      context: {
        userId: context?.userId,
        role: context?.role,
      },
      action,
      resource,
      error: error instanceof Error ? error.message : String(error),
    })
    return false
  }
}
