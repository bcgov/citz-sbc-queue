import { useCallback, useMemo } from "react"
import { evaluatePermissions } from "./evaluate_permissions"
import { DEFAULT_QUEUE_RULES } from "./permission_rules"
import type {
  PermissionContext,
  PermissionResult,
  UsePermissionsProps,
  UsePermissionsReturn,
} from "./types"

/**
 * Multi-Resource Permission Hook with Simplified API
 *
 * This hook provides type-safe permission checking for multiple resources.
 * It evaluates ALL possible actions for each resource and returns the results.
 * Types are automatically inferred from the permission rules configuration.
 */
export function usePermissions(
  props: UsePermissionsProps<typeof DEFAULT_QUEUE_RULES>
): UsePermissionsReturn<typeof DEFAULT_QUEUE_RULES> {
  const { userRole, context, checks } = props
  const rules = DEFAULT_QUEUE_RULES // Rules imported internally

  // Get all possible actions from rules for type inference
  const allActions = useMemo(() => {
    const actionSet = new Set<string>()
    rules.forEach((rule) => {
      rule.actions.forEach((action) => actionSet.add(action))
    })
    return Array.from(actionSet)
  }, [rules])

  // Memoize permission evaluation results
  const results = useMemo<PermissionResult<typeof DEFAULT_QUEUE_RULES>[]>(() => {
    const allResults: PermissionResult<typeof DEFAULT_QUEUE_RULES>[] = []

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
          rules,
        })

        allResults.push({
          resource,
          action,
          hasPermission,
          ...(data && { data }),
        } as PermissionResult<typeof DEFAULT_QUEUE_RULES>)
      })
    })

    return allResults
  }, [userRole, context, checks, rules, allActions])

  // Helper function to check a specific permission from results
  const hasPermission = useCallback(
    (resource: string, action: string): boolean => {
      const result = results.find((r) => r.resource === resource && r.action === action)
      return result?.hasPermission ?? false
    },
    [results]
  )

  // Helper function to get all permissions for a specific resource
  const getResourcePermissions = useCallback(
    (resource: string) => {
      return results.filter((r) => r.resource === resource)
    },
    [results]
  )

  // Helper function to check if user has any of the specified actions for a resource
  const hasAnyPermission = useCallback(
    (resource: string, actions: string[]): boolean => {
      return actions.some((action) => hasPermission(resource, action))
    },
    [hasPermission]
  )

  // Helper function to check if user has all of the specified actions for a resource
  const hasAllPermissions = useCallback(
    (resource: string, actions: string[]): boolean => {
      return actions.every((action) => hasPermission(resource, action))
    },
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
