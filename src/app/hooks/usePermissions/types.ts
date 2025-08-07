// Core types for ABAC (Attribute-Based Access Control) system

export type Action = 'view' | 'create' | 'update' | 'delete' | 'approve' | 'assign' | 'cancel';

export type Role =
  | 'admin'
  | 'manager'
  | 'staff'
  | 'citizen'
  | 'guest';

export type Resource =
  | 'appointment'
  | 'queue'
  | 'service'
  | 'user'
  | 'report'
  | 'settings';

export type PermissionContext = {
  userId: string;
  role: Role;
  resource: Resource;
  data?: Record<string, unknown>;
};

export type PermissionRule = {
  role: Role;
  resource: Resource;
  actions: Action[];
  condition?: (context: PermissionContext) => boolean;
};

// Hook Props
export type UsePermissionsProps = {
  userId: string;
  role: Role;
  resource: Resource;
  data?: Record<string, unknown>;
};

// Hook return type
export type UsePermissionsReturn = {
  permissions: Action[];
  hasPermission: (action: Action) => boolean;
  hasAnyPermission: (actions: Action[]) => boolean;
  hasAllPermissions: (actions: Action[]) => boolean;
};
