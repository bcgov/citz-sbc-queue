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
