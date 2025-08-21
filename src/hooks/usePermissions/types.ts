// Core types for queue management permission system

// Permission context for the queue system
export type PermissionContext = Record<string, unknown>

// Permission rule structure
export type PermissionRule = {
  role: string
  resource: string
  actions: readonly string[]
  condition?: (context: PermissionContext) => boolean
}

// Queue management specific types
export type QueueAction = "view" | "create" | "update" | "delete" | "approve" | "assign" | "cancel"
export type QueueRole = "admin" | "manager" | "staff" | "citizen" | "guest"
export type QueueResource = "appointment" | "queue" | "service" | "user" | "report" | "settings"

// Resource check structure for multiple resources
export type ResourceCheck = {
  resource: QueueResource
  data?: Record<string, unknown>
}

// Permission result for a single resource/action check
export type PermissionResult = {
  resource: QueueResource
  action: QueueAction
  hasPermission: boolean
  data?: Record<string, unknown>
}

// Hook props
export type UsePermissionsProps = {
  userRole: QueueRole
  context: PermissionContext
  checks: ResourceCheck[]
}

// Hook return type
export type UsePermissionsReturn = {
  results: PermissionResult[]
  hasPermission: (resource: QueueResource, action: QueueAction) => boolean
  getResourcePermissions: (resource: QueueResource) => PermissionResult[]
  hasAnyPermission: (resource: QueueResource, actions: QueueAction[]) => boolean
  hasAllPermissions: (resource: QueueResource, actions: QueueAction[]) => boolean
}

// Specific data interfaces for queue management
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
