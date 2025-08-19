import { useMemo } from "react"
import { evaluatePermissions } from "./evaluate_permissions"
import {
  createAllPermissionChecker,
  createAnyPermissionChecker,
  createPermissionChecker,
  createResourcePermissionGetter,
  extractAllActions,
} from "./helpers"
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
  const allActions = useMemo(() => extractAllActions(rules), [rules])

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
