/**
 * Helper Functions for usePermissions Hook
 *
 * These utility functions provide reusable logic for the permission hook,
 * including action extraction and permission checking utilities.
 */

import type { PermissionResult, PermissionRule } from "./types"

/**
 * Extracts all unique actions from a set of permission rules
 *
 * @param rules - Array of permission rules
 * @returns Array of unique action strings
 */
export function extractAllActions(rules: readonly PermissionRule[]): string[] {
  const actionSet = new Set<string>()
  rules.forEach((rule) => {
    rule.actions.forEach((action) => actionSet.add(action))
  })
  return Array.from(actionSet)
}

/**
 * Creates a helper function to check specific permissions from results
 *
 * @param results - Array of permission results
 * @returns Function that checks if a specific resource/action combination is permitted
 */
export function createPermissionChecker<T extends readonly PermissionRule[]>(
  results: PermissionResult<T>[]
): (resource: string, action: string) => boolean {
  return (resource: string, action: string): boolean => {
    const result = results.find((r) => r.resource === resource && r.action === action)
    return result?.hasPermission ?? false
  }
}

/**
 * Creates a helper function to get all permissions for a specific resource
 *
 * @param results - Array of permission results
 * @returns Function that filters results by resource
 */
export function createResourcePermissionGetter<T extends readonly PermissionRule[]>(
  results: PermissionResult<T>[]
): (resource: string) => PermissionResult<T>[] {
  return (resource: string) => {
    return results.filter((r) => r.resource === resource)
  }
}

/**
 * Creates a helper function to check if user has any of the specified actions for a resource
 *
 * @param hasPermission - Permission checker function
 * @returns Function that checks if any of the actions are permitted
 */
export function createAnyPermissionChecker(
  hasPermission: (resource: string, action: string) => boolean
): (resource: string, actions: string[]) => boolean {
  return (resource: string, actions: string[]): boolean => {
    return actions.some((action) => hasPermission(resource, action))
  }
}

/**
 * Creates a helper function to check if user has all of the specified actions for a resource
 *
 * @param hasPermission - Permission checker function
 * @returns Function that checks if all actions are permitted
 */
export function createAllPermissionChecker(
  hasPermission: (resource: string, action: string) => boolean
): (resource: string, actions: string[]) => boolean {
  return (resource: string, actions: string[]): boolean => {
    return actions.every((action) => hasPermission(resource, action))
  }
}
