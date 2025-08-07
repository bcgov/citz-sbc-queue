import { PERMISSION_RULES } from "./permission_rules"
import type { Action, PermissionContext, Resource, Role } from "./types"

/**
 * Core permission evaluation logic
 *
 * This function can be shared between client-side hooks and server-side API routes.
 * It evaluates user context against permission rules to determine allowed actions.
 *
 * @param context - Permission context including userId, role, resource, and optional data
 * @returns Array of allowed actions for the given context
 *
 * @example
 * ```typescript
 * // Client-side usage
 * const permissions = evaluatePermissions({
 *   userId: 'user-123',
 *   role: 'staff',
 *   resource: 'appointment',
 *   data: { assignedTo: 'user-123' }
 * });
 *
 * // Server-side usage in API route
 * export async function updateAppointment(appointmentId: string, userId: string, role: Role) {
 *   const appointment = await getAppointment(appointmentId);
 *   const permissions = evaluatePermissions({
 *     userId,
 *     role,
 *     resource: 'appointment',
 *     data: { assignedTo: appointment.assignedTo }
 *   });
 *
 *   if (!permissions.includes('update')) {
 *     throw new Error('Insufficient permissions');
 *   }
 *   // Proceed with update...
 * }
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
  if (
    typeof role !== "string" ||
    !["admin", "manager", "staff", "citizen", "guest"].includes(role)
  ) {
    throw new ValidationError(
      `Invalid role: ${role}. Must be one of: admin, manager, staff, citizen, guest`
    )
  }
}

const validateAction: (action: unknown) => asserts action is Action = (
  action: unknown
): asserts action is Action => {
  if (
    typeof action !== "string" ||
    !["view", "create", "update", "delete", "approve", "assign", "cancel"].includes(action)
  ) {
    throw new ValidationError(
      `Invalid action: ${action}. Must be one of: view, create, update, delete, approve, assign, cancel`
    )
  }
}

const validateResource: (resource: unknown) => asserts resource is Resource = (
  resource: unknown
): asserts resource is Resource => {
  if (
    typeof resource !== "string" ||
    !["appointment", "queue", "service", "user", "report", "settings"].includes(resource)
  ) {
    throw new ValidationError(
      `Invalid resource: ${resource}. Must be one of: appointment, queue, service, user, report, settings`
    )
  }
}

const validateContext: (context: unknown) => asserts context is PermissionContext = (
  context: unknown
): asserts context is PermissionContext => {
  if (!context || typeof context !== "object") {
    throw new ValidationError("Permission context must be a non-null object")
  }

  const ctx = context as Record<string, unknown>

  if (typeof ctx.userId !== "string" || ctx.userId.trim() === "") {
    throw new ValidationError("Permission context must have a valid userId string")
  }

  validateRole(ctx.role)
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
  resource: Resource
): boolean {
  try {
    // Validate all inputs
    validateContext(context)
    validateAction(action)
    validateResource(resource)

    const { role } = context

    // Find matching rules for the user's role and the requested resource
    const matchingRules = PERMISSION_RULES.filter(
      (rule) => rule.role === role && rule.resource === resource
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
