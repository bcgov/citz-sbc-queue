// Core types for ABAC (Attribute-Based Access Control) system

export type Action = "view" | "create" | "update" | "delete" | "approve" | "assign" | "cancel"

export type Role = "admin" | "manager" | "staff" | "citizen" | "guest"

export type Resource = "appointment" | "queue" | "service" | "user" | "report" | "settings"

// Flexible permission context - supports various field naming conventions
// Examples of supported structures:
// { userId: "123", role: "staff", data: {...} }
// { user_id: "123", userRole: "staff", context: {...} }
// { id: "123", role: "staff", metadata: {...} }
export type PermissionContext = Record<string, unknown>

// Specific data interfaces for common use cases
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

export type PermissionRule = {
  role: Role
  resource: Resource
  actions: Action[]
  condition?: (context: PermissionContext) => boolean
}

// Hook Props - maintains structured interface for ease of use
export type UsePermissionsProps = {
  userId: string
  role: Role
  resource: Resource
  data?: Record<string, unknown>
}

// Hook return type
export type UsePermissionsReturn = {
  permissions: Action[]
  hasPermission: (action: Action) => boolean
  hasAnyPermission: (actions: Action[]) => boolean
  hasAllPermissions: (actions: Action[]) => boolean
}
