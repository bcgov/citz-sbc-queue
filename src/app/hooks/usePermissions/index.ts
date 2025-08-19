// Main exports

// Utility exports
export * from "./errors"
export * from "./evaluate_permissions"
export * from "./helpers"
export * from "./permission_rules"
// Convenience exports for queue management system
export { DEFAULT_QUEUE_RULES as QueueRules } from "./permission_rules"
export type { QueueAction, QueueResource, QueueRole } from "./types"
export * from "./types"
export * from "./usePermissions"
export * from "./validators"

// Helper function for creating custom permission rules
export const createPermissionRule = (
  role: string,
  resource: string,
  actions: string[],
  condition?: (context: Record<string, unknown>) => boolean
) => ({
  role,
  resource,
  actions,
  ...(condition && { condition }),
})
