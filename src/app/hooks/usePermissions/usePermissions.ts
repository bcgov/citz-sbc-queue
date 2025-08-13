import { useMemo } from "react"
import { evaluatePermissions } from "./evaluate_permissions"
import type {
  PermissionContext,
  PermissionResult,
  PermissionRule,
  UsePermissionsProps,
  UsePermissionsReturn,
} from "./types"

/**
 * Multi-Resource Permission Hook
 *
 * This hook provides type-safe permission checking for multiple resources.
 * Types are automatically inferred from the permission rules configuration.
 */
export function usePermissions<T extends readonly PermissionRule[]>(
  props: UsePermissionsProps<T>
): UsePermissionsReturn<T> {
  const { userRole, context, rules, checks } = props

  // Memoize permission evaluation results
  const results = useMemo<PermissionResult<T>[]>(() => {
    return checks.map((check) => {
      const { resource, action, data } = check

      // Build context for this specific check
      const checkContext: PermissionContext = {
        ...context,
        ...(data && { data }),
      }

      // Evaluate permission for this resource/action
      const hasPermission = evaluatePermissions({
        userRole,
        resource,
        action,
        context: checkContext,
        rules,
      })

      return {
        resource,
        action,
        hasPermission,
        ...(data && { data }),
      } as PermissionResult<T>
    })
  }, [userRole, context, rules, checks])

  // Helper function to check a specific permission from results
  const hasPermission = useMemo(() => {
    return (resource: string, action: string): boolean => {
      const result = results.find((r) => r.resource === resource && r.action === action)
      return result?.hasPermission ?? false
    }
  }, [results])

  // Helper function to get all permissions for a specific resource
  const getResourcePermissions = useMemo(() => {
    return (resource: string) => {
      return results.filter((r) => r.resource === resource)
    }
  }, [results])

  // Helper function to check if user has any of the specified actions for a resource
  const hasAnyPermission = useMemo(() => {
    return (resource: string, actions: string[]): boolean => {
      return actions.some((action) => hasPermission(resource, action))
    }
  }, [hasPermission])

  // Helper function to check if user has all of the specified actions for a resource
  const hasAllPermissions = useMemo(() => {
    return (resource: string, actions: string[]): boolean => {
      return actions.every((action) => hasPermission(resource, action))
    }
  }, [hasPermission])

  return {
    results,
    hasPermission,
    getResourcePermissions,
    hasAnyPermission,
    hasAllPermissions,
  }
}
