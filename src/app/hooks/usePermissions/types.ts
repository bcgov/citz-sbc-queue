// Core types for ABAC (Attribute-Based Access Control) system

export type Action = "view" | "create" | "update" | "delete" | "approve" | "assign" | "cancel"

export type Role = "admin" | "manager" | "staff" | "citizen" | "guest"

export type Resource = "appointment" | "queue" | "service" | "user" | "report" | "settings"

// Specific data interfaces for type safety
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

// Generic permission context with typed data (resource removed as it's now a parameter)
export type PermissionContext<T = Record<string, unknown>> = {
  userId: string
  role: Role
  data?: T
}

// Specific contexts for type safety
export type AppointmentPermissionContext = PermissionContext<AppointmentData>
export type UserPermissionContext = PermissionContext<UserData>

export type PermissionRule<T = Record<string, unknown>> = {
  role: Role
  resource: Resource
  actions: Action[]
  condition?: (context: PermissionContext<T>) => boolean
}

// Hook Props with optional generic for data typing (keeping resource for hook interface)
export type UsePermissionsProps<T = Record<string, unknown>> = {
  userId: string
  role: Role
  resource: Resource
  data?: T
}

// Hook return type
export type UsePermissionsReturn = {
  permissions: Action[]
  hasPermission: (action: Action) => boolean
  hasAnyPermission: (actions: Action[]) => boolean
  hasAllPermissions: (actions: Action[]) => boolean
}
