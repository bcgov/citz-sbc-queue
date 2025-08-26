import type {
  PermissionContext,
} from "./types"

/**
 * Queue Management System Permission Rules
 */

/**
 * Context Helper Functions
 */

/**
 * Extracts the user ID from a permission context
 *
 * @param ctx - The permission context object
 * @returns The user ID as a string, or undefined if not present
 */
const getUserId = (ctx: PermissionContext): string | undefined => {
  return ctx.userId as string | undefined
}

/**
 * Queue-Specific Condition Functions
 *
 * These functions evaluate contextual conditions for permission rules.
 * Each function receives a PermissionContext and returns a boolean.
 */
const CONDITIONS = {
  /**
   * Checks if the user owns the resource being accessed
   */
  isOwnResource: (ctx: PermissionContext): boolean => {
    const userId = getUserId(ctx)
    const data = ctx.data as Record<string, unknown> | undefined
    const ownerId = data?.userId
    return Boolean(userId && ownerId && userId === ownerId)
  },

  /**
   * Checks if the appointment is assigned to the current user or unassigned
   */
  isAssignedOrUnassigned: (ctx: PermissionContext): boolean => {
    const userId = getUserId(ctx)
    const data = ctx.data as Record<string, unknown> | undefined
    const assignedTo = data?.assignedTo
    return Boolean(!assignedTo || (userId && assignedTo === userId))
  },

  /**
   * Checks if the target user is staff or citizen (manageable by managers)
   */
  canManageStaffAndCitizens: (ctx: PermissionContext): boolean => {
    const data = ctx.data as Record<string, unknown> | undefined
    const targetRole = data?.role
    return targetRole === "staff" || targetRole === "citizen"
  },

  /**
   * Checks if the target user has citizen role
   */
  isCitizen: (ctx: PermissionContext): boolean => {
    const data = ctx.data as Record<string, unknown> | undefined
    const targetRole = data?.role
    return targetRole === "citizen"
  },
}

/**
 * Queue Management System Permission Rules Configuration
 *
 * Defines the complete set of permission rules for the queue management system.
 * Rules specify which actions each role can perform on each resource, with optional
 * conditional logic for context-sensitive permissions.
 *
 * @example
 * // Example rule structure:
 * { role: "staff", resource: "appointment", actions: ["view", "create"] }
 * { role: "citizen", resource: "appointment", actions: ["update"], condition: CONDITIONS.isOwnResource }
 */
export const QUEUE_RULES = [
  // Admin permissions - full access to everything
  { role: "admin", resource: "appointment", actions: ["view", "create", "update", "delete", "approve", "assign", "cancel"] },
  { role: "admin", resource: "queue", actions: ["view", "create", "update", "delete"] },
  { role: "admin", resource: "service", actions: ["view", "create", "update", "delete"] },
  { role: "admin", resource: "user", actions: ["view", "create", "update", "delete"] },
  { role: "admin", resource: "report", actions: ["view", "create"] },
  { role: "admin", resource: "settings", actions: ["view", "update"] },

  // Manager permissions - manage staff and operations
  { role: "manager", resource: "appointment", actions: ["view", "create", "update", "approve", "assign", "cancel"] },
  { role: "manager", resource: "queue", actions: ["view", "create", "update"] },
  { role: "manager", resource: "service", actions: ["view", "create", "update"] },
  { role: "manager", resource: "user", actions: ["view", "update"], condition: CONDITIONS.canManageStaffAndCitizens },
  { role: "manager", resource: "report", actions: ["view", "create"] },
  { role: "manager", resource: "settings", actions: ["view"] },

  // Staff permissions - basic view access
  { role: "staff", resource: "appointment", actions: ["view", "create"] },
  // Staff can update/assign only assigned or unassigned appointments
  { role: "staff", resource: "appointment", actions: ["update", "assign"], condition: CONDITIONS.isAssignedOrUnassigned },
  { role: "staff", resource: "queue", actions: ["view"] },
  { role: "staff", resource: "service", actions: ["view"] },
  { role: "staff", resource: "user", actions: ["view"], condition: CONDITIONS.isCitizen },
  { role: "staff", resource: "report", actions: ["view"] },

  // Citizen permissions - basic view access
  { role: "citizen", resource: "appointment", actions: ["view", "create"] },
  // Citizens can update/cancel only their own appointments
  { role: "citizen", resource: "appointment", actions: ["update", "cancel"], condition: CONDITIONS.isOwnResource },
  { role: "citizen", resource: "queue", actions: ["view"] },
  { role: "citizen", resource: "service", actions: ["view"] },
  // Citizens can view all users but only update their own profile
  { role: "citizen", resource: "user", actions: ["view"] },
  { role: "citizen", resource: "user", actions: ["update"], condition: CONDITIONS.isOwnResource },
] as const
