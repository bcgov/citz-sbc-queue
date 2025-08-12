import { useMemo } from "react"
import { evaluatePermissions } from "./evaluate_permissions"
import { DEFAULT_QUEUE_RULES } from "./permission_rules"
import type { Action, PermissionRule, UsePermissionsProps, UsePermissionsReturn } from "./types"

/**
 * Get all possible actions from a set of permission rules
 */
const getAllActionsFromRules = (rules: PermissionRule[]): Action[] => {
  const actionSet = new Set<Action>()
  rules.forEach((rule) => {
    rule.actions.forEach((action) => actionSet.add(action))
  })
  return Array.from(actionSet)
}

/**
 * usePermissions - A configurable ABAC (Attribute-Based Access Control) hook
 *
 * Evaluates userId, role, resource, and data to determine what actions are allowed.
 * Returns an array of allowed actions and utility functions for permission checking.
 *
 * @param props - Permission context including userId, role, resource, optional data, and optional custom rules
 * @returns Object with permissions array and utility functions
 *
 * @example
 * ```tsx
 * // Using default queue management rules
 * const { permissions, hasPermission } = usePermissions({
 *   userId: 'user-123',
 *   role: 'staff',
 *   resource: 'appointment',
 *   data: { assignedTo: 'user-123' }
 * });
 *
 * // Using custom project-specific rules
 * const customRules = [
 *   { role: 'editor', resource: 'document', actions: ['read', 'write'], condition: (ctx) => ctx.data?.owner === ctx.userId }
 * ];
 * const { permissions } = usePermissions({
 *   userId: 'user-456',
 *   role: 'editor',
 *   resource: 'document',
 *   rules: customRules
 * });
 * ```
 */
export const usePermissions = (props: UsePermissionsProps): UsePermissionsReturn => {
  const { userId, role, resource, data, rules = DEFAULT_QUEUE_RULES } = props

  const permissions = useMemo(() => {
    const context = { userId, role, data }
    const allActions = getAllActionsFromRules(rules)

    // Check each possible action against the resource to build permissions array
    return allActions.filter((action) => {
      try {
        return evaluatePermissions(context, action, resource, rules)
      } catch {
        // If there's an error (e.g., invalid action), don't include this permission
        return false
      }
    })
  }, [userId, role, resource, data, rules])

  const hasPermission = useMemo(() => {
    return (action: Action): boolean => permissions.includes(action)
  }, [permissions])

  const hasAnyPermission = useMemo(() => {
    return (actions: Action[]): boolean => actions.some((action) => permissions.includes(action))
  }, [permissions])

  const hasAllPermissions = useMemo(() => {
    return (actions: Action[]): boolean => actions.every((action) => permissions.includes(action))
  }, [permissions])

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  }
}
