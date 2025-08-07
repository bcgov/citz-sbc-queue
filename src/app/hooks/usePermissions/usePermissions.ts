import { useMemo } from "react"
import { evaluatePermissions } from "./evaluate_permissions"
import type { Action, UsePermissionsProps, UsePermissionsReturn } from "./types"

/**
 * usePermissions - A custom ABAC (Attribute-Based Access Control) hook
 *
 * Evaluates userId, role, resource, and data to determine what actions are allowed.
 * Returns an array of allowed actions and utility functions for permission checking.
 *
 * @param props - Permission context including userId, role, resource, and optional data
 * @returns Object with permissions array and utility functions
 *
 * @example
 * ```tsx
 * const { permissions, hasPermission } = usePermissions({
 *   userId: 'user-123',
 *   role: 'staff',
 *   resource: 'appointment',
 *   data: { assignedTo: 'user-123' }
 * });
 *
 * if (hasPermission('update')) {
 *   // Show edit button
 * }
 * ```
 */
export const usePermissions = (props: UsePermissionsProps): UsePermissionsReturn => {
  const { userId, role, resource, data } = props

  const permissions = useMemo(() => {
    return evaluatePermissions({ userId, role, resource, data })
  }, [userId, role, resource, data])

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
