import type { Action, PermissionContext, PermissionRule, Role } from "./types"

/**
 * Permission Sets - Common action combinations to reduce duplication
 */
const PERMISSION_SETS = {
  READ_ONLY: ["view"] as Action[],
  BASIC_CRUD: ["view", "create", "update", "delete"] as Action[],
  MANAGEMENT: ["view", "create", "update", "approve", "assign", "cancel"] as Action[],
  FULL_ADMIN: ["view", "create", "update", "delete", "approve", "assign", "cancel"] as Action[],
  CREATE_READ: ["view", "create"] as Action[],
  READ_UPDATE: ["view", "update"] as Action[],
  USER_ACTIONS: ["view", "create", "update", "cancel"] as Action[],
  STAFF_ACTIONS: ["view", "create", "update", "assign"] as Action[],
  MANAGER_CRUD: ["view", "create", "update"] as Action[],
} as const

/**
 * Context Helper Functions - Extract values from flexible context structures
 */
const getUserId = (ctx: PermissionContext): string | undefined => {
  // Support various field naming conventions
  return (ctx.userId || ctx.user_id || ctx.id || ctx.sub) as string | undefined
}

const getData = (ctx: PermissionContext): Record<string, unknown> | undefined => {
  // Support various data field conventions
  return (ctx.data || ctx.context || ctx.metadata || ctx.attributes) as
    | Record<string, unknown>
    | undefined
}

/**
 * Condition Functions - Reusable permission conditions with flexible context access
 */
const CONDITIONS = {
  isOwnResource: (ctx: PermissionContext): boolean => {
    const userId = getUserId(ctx)
    const data = getData(ctx)
    const ownerId = data?.userId || data?.user_id || data?.id
    return Boolean(userId && ownerId && userId === ownerId)
  },

  isAssignedOrUnassigned: (ctx: PermissionContext): boolean => {
    const userId = getUserId(ctx)
    const data = getData(ctx)
    const assignedTo = data?.assignedTo || data?.assigned_to || data?.assignee
    return Boolean(!assignedTo || (userId && assignedTo === userId))
  },

  canManageStaffAndCitizens: (ctx: PermissionContext): boolean => {
    const data = getData(ctx)
    const targetRole = data?.role || data?.userRole || data?.user_role
    return targetRole === "staff" || targetRole === "citizen"
  },

  isCitizen: (ctx: PermissionContext): boolean => {
    const data = getData(ctx)
    const targetRole = data?.role || data?.userRole || data?.user_role
    return targetRole === "citizen"
  },
}

/**
 * Permission Rule Builders - Factory functions to create common rule patterns
 */
const createRule = (
  role: Role,
  resource: PermissionRule["resource"],
  actions: Action[],
  condition?: PermissionRule["condition"]
): PermissionRule => ({
  role,
  resource,
  actions,
  ...(condition && { condition }),
})

const createAdminRule = (
  resource: PermissionRule["resource"],
  actions: Action[] = PERMISSION_SETS.BASIC_CRUD
) => createRule("admin", resource, actions)

const createManagerRule = (
  resource: PermissionRule["resource"],
  actions: Action[],
  condition?: PermissionRule["condition"]
) => createRule("manager", resource, actions, condition)

const createStaffRule = (
  resource: PermissionRule["resource"],
  actions: Action[],
  condition?: PermissionRule["condition"]
) => createRule("staff", resource, actions, condition)

const createCitizenRule = (
  resource: PermissionRule["resource"],
  actions: Action[],
  condition?: PermissionRule["condition"]
) => createRule("citizen", resource, actions, condition)

const createGuestRule = (resource: PermissionRule["resource"]) =>
  createRule("guest", resource, PERMISSION_SETS.READ_ONLY)

/**
 * Permission Rules Configuration
 *
 * This file contains all ABAC permission rules organized by role.
 * Each rule defines what actions a role can perform on a resource,
 * with optional conditions for context-aware permissions.
 */
export const PERMISSION_RULES: PermissionRule[] = [
  // Admin permissions - full access to everything
  createAdminRule("appointment", PERMISSION_SETS.FULL_ADMIN),
  createAdminRule("queue"),
  createAdminRule("service"),
  createAdminRule("user"),
  createAdminRule("report", PERMISSION_SETS.CREATE_READ),
  createAdminRule("settings", PERMISSION_SETS.READ_UPDATE),

  // Manager permissions - manage staff and operations
  createManagerRule("appointment", PERMISSION_SETS.MANAGEMENT),
  createManagerRule("queue", PERMISSION_SETS.MANAGER_CRUD),
  createManagerRule("service", PERMISSION_SETS.MANAGER_CRUD),
  createManagerRule("user", PERMISSION_SETS.READ_UPDATE, CONDITIONS.canManageStaffAndCitizens),
  createManagerRule("report", PERMISSION_SETS.CREATE_READ),
  createManagerRule("settings", PERMISSION_SETS.READ_ONLY),

  // Staff permissions - handle appointments and basic operations
  createStaffRule("appointment", PERMISSION_SETS.STAFF_ACTIONS, CONDITIONS.isAssignedOrUnassigned),
  createStaffRule("queue", PERMISSION_SETS.READ_ONLY),
  createStaffRule("service", PERMISSION_SETS.READ_ONLY),
  createStaffRule("user", PERMISSION_SETS.READ_ONLY, CONDITIONS.isCitizen),
  createStaffRule("report", PERMISSION_SETS.READ_ONLY),

  // Citizen permissions - manage own appointments
  createCitizenRule("appointment", PERMISSION_SETS.USER_ACTIONS, CONDITIONS.isOwnResource),
  createCitizenRule("queue", PERMISSION_SETS.READ_ONLY),
  createCitizenRule("service", PERMISSION_SETS.READ_ONLY),
  createCitizenRule("user", PERMISSION_SETS.READ_UPDATE, CONDITIONS.isOwnResource),

  // Guest permissions - very limited read access
  createGuestRule("service"),
  createGuestRule("queue"),
]
