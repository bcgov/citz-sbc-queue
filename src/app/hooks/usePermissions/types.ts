// Core types for ABAC (Attribute-Based Access Control) system
// These can be extended or overridden for different projects

export type Action = string // Generic action type - projects can define their own
export type Role = string   // Generic role type - projects can define their own
export type Resource = string // Generic resource type - projects can define their own

// Flexible permission context - supports various field naming conventions
// Examples of supported structures:
// { userId: "123", role: "staff", data: {...} }
// { user_id: "123", userRole: "staff", context: {...} }
// { id: "123", role: "staff", metadata: {...} }
export type PermissionContext = Record<string, unknown>

export type PermissionRule = {
  role: Role
  resource: Resource
  actions: Action[]
  condition?: (context: PermissionContext) => boolean
}

// Hook Props - configurable with custom rules
export type UsePermissionsProps = {
  userId: string
  role: Role
  resource: Resource
  data?: Record<string, unknown>
  rules?: PermissionRule[] // Optional custom rules
}

// Hook return type
export type UsePermissionsReturn = {
  permissions: Action[]
  hasPermission: (action: Action) => boolean
  hasAnyPermission: (actions: Action[]) => boolean
  hasAllPermissions: (actions: Action[]) => boolean
}

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
  role?: Role
  department?: string
}
