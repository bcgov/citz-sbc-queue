import type {
  PermissionContext,
} from "./types"

/**
 * Queue Management System Permission Rules
 */

/**
 * Context Helper Functions
 */
const getUserId = (ctx: PermissionContext): string | undefined => {
  return ctx.userId as string | undefined
}

/**
 * Queue-Specific Condition Functions
 */
const CONDITIONS = {
  isOwnResource: (ctx: PermissionContext): boolean => {
    const userId = getUserId(ctx)
    const data = ctx.data as Record<string, unknown> | undefined
    const ownerId = data?.userId
    return Boolean(userId && ownerId && userId === ownerId)
  },

  isAssignedOrUnassigned: (ctx: PermissionContext): boolean => {
    const userId = getUserId(ctx)
    const data = ctx.data as Record<string, unknown> | undefined
    const assignedTo = data?.assignedTo
    return Boolean(!assignedTo || (userId && assignedTo === userId))
  },

  canManageStaffAndCitizens: (ctx: PermissionContext): boolean => {
    const data = ctx.data as Record<string, unknown> | undefined
    const targetRole = data?.role
    return targetRole === "staff" || targetRole === "citizen"
  },

  isCitizen: (ctx: PermissionContext): boolean => {
    const data = ctx.data as Record<string, unknown> | undefined
    const targetRole = data?.role
    return targetRole === "citizen"
  },
}

/**
 * Queue Management System Permission Rules Configuration
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

  // Guest permissions - very limited read access
  { role: "guest", resource: "service", actions: ["view"] },
  { role: "guest", resource: "queue", actions: ["view"] },
] as const
