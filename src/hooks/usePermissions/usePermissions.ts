import { useMemo } from "react"
import { evaluatePermissions } from "./evaluate_permissions"
import {
  createAllPermissionChecker,
  createAnyPermissionChecker,
  createPermissionChecker,
  createResourcePermissionGetter,
  extractAllActions,
} from "./helpers"
import { QUEUE_RULES } from "./permission_rules"
import type {
  PermissionContext,
  PermissionResult,
  UsePermissionsProps,
  UsePermissionsReturn,
} from "./types"

/**
 * Queue Management Permission Hook
 *
 * This hook provides type-safe permission checking for queue management resources.
 * It evaluates ALL possible actions for each resource and returns the results.
 *
 * @param props - Hook configuration
 * @param props.userRole - User's role ("admin" | "manager" | "staff" | "citizen")
 * @param props.context - Permission context (typically includes userId)
 * @param props.checks - Array of resources to check permissions for
 *
 * @returns Object with permission results and helper functions
 *
 * @example
 * ```tsx
 * // Basic appointment permission checking
 * const { hasPermission } = usePermissions({
 *   userRole: "staff",
 *   context: { userId: "staff-123" },
 *   checks: [
 *     { resource: "appointment", data: { assignedTo: "staff-123" } }
 *   ]
 * });
 *
 * const canUpdate = hasPermission("appointment", "update"); // boolean
 * const canDelete = hasPermission("appointment", "delete"); // boolean
 * ```
 *
 * @example
 * ```tsx
 * // Multi-resource navigation permissions
 * const { hasPermission, hasAnyPermission } = usePermissions({
 *   userRole: "manager",
 *   context: { userId: "mgr-456" },
 *   checks: [
 *     { resource: "appointment" },
 *     { resource: "user" },
 *     { resource: "report" },
 *     { resource: "settings" }
 *   ]
 * });
 *
 * // Show navigation items based on permissions
 * const showAppointments = hasPermission("appointment", "view");
 * const showUsers = hasPermission("user", "view");
 * const canManageAnything = hasAnyPermission("settings", ["view", "update"]);
 * ```
 *
 * @example
 * ```tsx
 * // Get all permissions for a resource
 * const { getResourcePermissions } = usePermissions({
 *   userRole: "citizen",
 *   context: { userId: "citizen-789" },
 *   checks: [{ resource: "appointment", data: { userId: "citizen-789" } }]
 * });
 *
 * const appointmentPerms = getResourcePermissions("appointment");
 * const allowedActions = appointmentPerms
 *   .filter(p => p.hasPermission)
 *   .map(p => p.action); // ["view", "create", "update"]
 * ```
 */
export function usePermissions(props: UsePermissionsProps): UsePermissionsReturn {
  const { userRole, context, checks } = props

  // Get all possible actions from rules
  const allActions = useMemo(() => extractAllActions(QUEUE_RULES), [])

  // Memoize permission evaluation results
  const results = useMemo<PermissionResult[]>(() => {
    const allResults: PermissionResult[] = []

    // For each check, evaluate ALL possible actions for that resource
    checks.forEach((check) => {
      const { resource, data } = check

      // Build context for this specific check
      const checkContext: PermissionContext = {
        ...context,
        ...(data && { data }),
      }

      // Evaluate each possible action for this resource
      allActions.forEach((action) => {
        const hasPermission = evaluatePermissions({
          userRole,
          resource,
          action,
          context: checkContext,
          rules: QUEUE_RULES,
        })

        allResults.push({
          resource,
          action,
          hasPermission,
          ...(data && { data }),
        } as PermissionResult)
      })
    })

    return allResults
  }, [userRole, context, checks, allActions])

  // Helper functions created from results
  const hasPermission = useMemo(() => createPermissionChecker(results), [results])

  const getResourcePermissions = useMemo(() => createResourcePermissionGetter(results), [results])

  const hasAnyPermission = useMemo(() => createAnyPermissionChecker(hasPermission), [hasPermission])

  const hasAllPermissions = useMemo(
    () => createAllPermissionChecker(hasPermission),
    [hasPermission]
  )

  return {
    results,
    hasPermission,
    getResourcePermissions,
    hasAnyPermission,
    hasAllPermissions,
  }
}
