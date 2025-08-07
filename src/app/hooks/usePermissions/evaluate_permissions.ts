import { PERMISSION_RULES } from './permission_rules';
import type { Action, PermissionContext } from './types';

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
export const evaluatePermissions = (context: PermissionContext): Action[] => {
  const { role, resource } = context;

  // Find matching rules and evaluate conditions
  const allowedActions = new Set<Action>();

  PERMISSION_RULES
    .filter(rule => rule.role === role && rule.resource === resource)
    .forEach(rule => {
      // If no condition or condition passes, add actions
      if (!rule.condition || rule.condition(context)) {
        rule.actions.forEach(action => allowedActions.add(action));
      }
    });

  return Array.from(allowedActions);
};
