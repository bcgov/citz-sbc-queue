# usePermissions Hook

A comprehensive Attribute-Based Access Control (ABAC) hook for the CITZ SBC Queue Management System.

## File Structure

```
usePermissions/
├── types.ts                    # All TypeScript types and interfaces
├── permission_rules.ts         # Permission rules configuration
├── permission_rules.test.ts    # Rules-specific tests
├── evaluate_permissions.ts     # Core permission evaluation logic
├── evaluate_permissions.test.ts # Evaluation logic tests
├── usePermissions.ts           # React hook implementation
├── usePermissions.test.ts      # Hook behavior tests
├── examples.tsx               # Usage examples and patterns
├── index.ts                   # Public API exports
└── README.md                  # This documentation
```

## Overview

The `usePermissions` hook provides fine-grained, context-aware permission management that goes beyond traditional Role-Based Access Control (RBAC). It evaluates user context, roles, resources, and additional data to determine what actions are permitted.

## Why ABAC over RBAC?

- **Context-aware**: Permissions can depend on data relationships (e.g., users can only modify their own resources)
- **Fine-grained**: Avoids role explosion by allowing conditions on permissions
- **Centralized**: All permission logic is managed in one place
- **Scalable**: Easy to maintain as system complexity grows

## Core Types

### Roles
```typescript
type Role = 'admin' | 'manager' | 'staff' | 'citizen' | 'guest';
```

### Resources
```typescript
type Resource = 'appointment' | 'queue' | 'service' | 'user' | 'report' | 'settings';
```

### Actions
```typescript
type Action = 'view' | 'create' | 'update' | 'delete' | 'approve' | 'assign' | 'cancel';
```

## API Reference

### Hook Signature

```typescript
usePermissions(props: UsePermissionsProps): UsePermissionsReturn
```

#### Props

```typescript
type UsePermissionsProps = {
  userId: string;        // Keycloak GUID or generated UUID
  role: Role;           // User's role from Keycloak client roles
  resource: Resource;   // The resource being accessed
  data?: Record<string, unknown>; // Additional context data
};
```

#### Return Value

```typescript
type UsePermissionsReturn = {
  permissions: Action[];                           // Array of allowed actions
  hasPermission: (action: Action) => boolean;      // Check single permission
  hasAnyPermission: (actions: Action[]) => boolean; // Check any of multiple permissions
  hasAllPermissions: (actions: Action[]) => boolean; // Check all permissions
};
```

## Usage Examples

### Basic Permission Check

```tsx
import { usePermissions } from '@/hooks/usePermissions';
import type { Role } from '@/hooks/usePermissions';

function AppointmentCard({ appointment, currentUser }) {
  const { hasPermission } = usePermissions({
    userId: currentUser.id,
    role: currentUser.role,
    resource: 'appointment',
    data: {
      assignedTo: appointment.assignedTo,
      userId: appointment.userId
    }
  });

  return (
    <div>
      <h3>{appointment.title}</h3>
      {hasPermission('update') && (
        <button>Edit Appointment</button>
      )}
      {hasPermission('cancel') && (
        <button>Cancel Appointment</button>
      )}
    </div>
  );
}
```

### Multiple Permission Checks

```tsx
function UserManagement({ targetUser, currentUser }) {
  const { hasAnyPermission, hasAllPermissions } = usePermissions({
    userId: currentUser.id,
    role: currentUser.role,
    resource: 'user',
    data: {
      role: targetUser.role,
      userId: targetUser.id
    }
  });

  // Show management section if user can perform any management action
  const canManage = hasAnyPermission(['update', 'delete']);

  // Show advanced controls only if user has full permissions
  const hasFullAccess = hasAllPermissions(['view', 'update', 'delete']);

  return (
    <div>
      {canManage && <UserManagementPanel />}
      {hasFullAccess && <AdvancedControls />}
    </div>
  );
}
```

### Conditional Rendering with Permissions Array

```tsx
function ActionButtons({ currentUser, appointment }) {
  const { permissions } = usePermissions({
    userId: currentUser.id,
    role: currentUser.role,
    resource: 'appointment',
    data: { assignedTo: appointment.assignedTo }
  });

  const buttonConfig = [
    { action: 'view', label: 'View Details', variant: 'secondary' },
    { action: 'update', label: 'Edit', variant: 'primary' },
    { action: 'approve', label: 'Approve', variant: 'success' },
    { action: 'cancel', label: 'Cancel', variant: 'danger' },
  ];

  return (
    <div>
      {buttonConfig
        .filter(({ action }) => permissions.includes(action))
        .map(({ action, label, variant }) => (
          <Button key={action} variant={variant}>
            {label}
          </Button>
        ))}
    </div>
  );
}
```

## Permission Rules

### Admin
- **Full access** to all resources and actions
- No restrictions or conditions

### Manager
- **Management access** to appointments, queues, and services
- Can **manage staff and citizens** but not other managers/admins
- **Read-only access** to settings
- Can create reports

### Staff
- Can **modify appointments** assigned to them or unassigned
- **Read-only access** to queues, services, and reports
- Can **view citizen profiles** only

### Citizen
- Can **manage their own appointments** (create, view, update, cancel)
- Can **manage their own profile**
- **Read-only access** to services and queues

### Guest
- **Very limited read access** to services and queues only
- No access to appointments, users, reports, or settings

## Shared Logic for API

The core permission evaluation logic is separated into its own module, making it reusable on the server side:

```typescript
import { evaluatePermissions } from '@/hooks/usePermissions';
import type { Role } from '@/hooks/usePermissions';

// In your API route or server action
export async function updateAppointment(appointmentId: string, userId: string, role: Role) {
  const appointment = await getAppointment(appointmentId);

  const context = {
    userId,
    role,
    data: { assignedTo: appointment.assignedTo, userId: appointment.userId }
  };

  const canUpdate = evaluatePermissions(context, 'update', 'appointment');
  if (!canUpdate) {
    throw new Error('Insufficient permissions to update appointment');
  }

  // Proceed with update...
}
```

The `evaluatePermissions` function is completely independent and can be used in:
- **Client-side hooks** (via `usePermissions`)
- **Server actions** and API routes
- **Middleware** for route protection
- **Background jobs** for permission validation
```

## Testing

The permissions system includes comprehensive tests organized by functionality:

- **`evaluate_permissions.test.ts`**: Tests core permission evaluation logic
- **`usePermissions.test.ts`**: Tests React hook behavior and memoization
- **`permission_rules.test.ts`**: Tests rule configuration and structure

This covers:
- All role-based permissions
- Conditional access rules
- Hook behavior and memoization
- Permission utility functions
- Rule completeness and consistency
- Edge cases and error handling

Run tests with:
```bash
npm test usePermissions
```

## Performance Considerations

- **Memoized results**: The hook uses `useMemo` to prevent unnecessary recalculations
- **Lightweight evaluation**: Permission rules are evaluated efficiently
- **Minimal re-renders**: Only recalculates when props change

## Security Notes

1. **Client-side only**: This hook is for UI logic only. Always validate permissions on the server
2. **Keycloak integration**: Designed to work with Keycloak roles and user IDs
3. **Data validation**: Ensure `data` context is properly validated before passing to the hook
4. **Role mapping**: Roles should be consistently mapped between Keycloak and your application

## Contributing

When adding new permissions:

1. Update the appropriate role rules in `permission_rules.ts`
2. Add corresponding tests
3. Update this documentation
4. Consider the impact on API-side permission checking

## Customizing Permission Rules

The permission rules are centralized in `permission_rules.ts` for easy maintenance. To modify permissions:

1. **Add new actions**: Update the `Action` type in `types.ts` and add to relevant rules
2. **Add new roles**: Update the `Role` type in `types.ts` and create new rule sets
3. **Add new resources**: Update the `Resource` type in `types.ts` and define permissions
4. **Modify conditions**: Update the condition functions in existing rules

Example of adding a new role:

```typescript
// In types.ts
export type Role =
  | 'admin'
  | 'manager'
  | 'staff'
  | 'citizen'
  | 'guest'
  | 'supervisor'; // New role

// In permission_rules.ts
{
  role: 'supervisor',
  resource: 'appointment',
  actions: ['view', 'update', 'approve'],
  condition: (ctx) => {
    // Custom logic for supervisor permissions
    return ctx.data?.department === ctx.data?.userDepartment;
  },
},
```
