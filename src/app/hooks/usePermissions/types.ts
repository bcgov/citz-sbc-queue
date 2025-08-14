// Core types for ABAC (Attribute-Based Access Control) system with type inference

// Flexible permission context - supports various field naming conventions
export type PermissionContext = Record<string, unknown>

// Base permission rule structure - supports readonly actions for type inference
export type PermissionRule = {
  role: string
  resource: string
  actions: readonly string[]  // Changed to readonly for better type inference
  condition?: (context: PermissionContext) => boolean
}

// Type inference utilities - extract types from actual permission rules
export type InferRoles<T extends readonly PermissionRule[]> = T[number]['role']
export type InferActions<T extends readonly PermissionRule[]> = T[number]['actions'][number]
export type InferResources<T extends readonly PermissionRule[]> = T[number]['resource']

// Multi-resource check structure - simplified to only require resource and data
export type ResourceCheck<T extends readonly PermissionRule[] = readonly PermissionRule[]> = {
  resource: InferResources<T>
  data?: Record<string, unknown>
}

// Permission result for a single resource/action check
export type PermissionResult<T extends readonly PermissionRule[] = readonly PermissionRule[]> = {
  resource: InferResources<T>
  action: InferActions<T>
  hasPermission: boolean
  data?: Record<string, unknown>
}

// Hook Props - supports multiple resource checks with type inference (rules imported internally)
export type UsePermissionsProps<T extends readonly PermissionRule[]> = {
  userRole: InferRoles<T>
  context: PermissionContext
  checks: ResourceCheck<T>[]
}

// Hook return type - provides results and helper functions
export type UsePermissionsReturn<T extends readonly PermissionRule[]> = {
  results: PermissionResult<T>[]
  hasPermission: (resource: InferResources<T>, action: InferActions<T>) => boolean
  getResourcePermissions: (resource: InferResources<T>) => PermissionResult<T>[]
  hasAnyPermission: (resource: InferResources<T>, actions: InferActions<T>[]) => boolean
  hasAllPermissions: (resource: InferResources<T>, actions: InferActions<T>[]) => boolean
}

// Legacy single-resource support (REMOVED for simplicity)
// This has been removed to keep the API clean and consistent

// Queue Management System specific types (as examples)
export type QueueAction = "view" | "create" | "update" | "delete" | "approve" | "assign" | "cancel"
export type QueueRole = "admin" | "manager" | "staff" | "citizen" | "guest"
export type QueueResource = "appointment" | "queue" | "service" | "user" | "report" | "settings"

// Specific data interfaces for queue management use cases
export type AppointmentData = {
  userId?: string
  assignedTo?: string
  status?: string
}

export type UserData = {
  userId?: string
  role?: string
  department?: string
}
