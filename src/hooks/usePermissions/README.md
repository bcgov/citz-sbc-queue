# usePermissions Hook

A comprehensive permission management system for the Service BC Queue Management application.

## Overview

The `usePermissions` hook provides type-safe, role-based access control (RBAC) with attribute-based conditions for queue management resources. It evaluates permissions for multiple resources simultaneously and returns both individual permission checks and batch results.

## Quick Start

```tsx
import { usePermissions } from '@/hooks/usePermissions';

function AppointmentCard({ appointment, currentUser }) {
  const { hasPermission } = usePermissions({
    userRole: currentUser.role,
    context: { userId: currentUser.id },
    checks: [
      {
        resource: "appointment",
        data: {
          assignedTo: appointment.assignedTo,
          userId: appointment.userId
        }
      }
    ]
  });

  return (
    <div>
      <h3>{appointment.title}</h3>
      {hasPermission("appointment", "update") && (
        <button>Edit Appointment</button>
      )}
      {hasPermission("appointment", "delete") && (
        <button>Delete Appointment</button>
      )}
    </div>
  );
}
```

## API Reference

### Hook Parameters

```tsx
type UsePermissionsProps = {
  userRole: QueueRole;        // "admin" | "manager" | "staff" | "citizen" | "guest"
  context: PermissionContext; // { userId: string, [key: string]: unknown }
  checks: ResourceCheck[];    // Resources to evaluate permissions for
}

type ResourceCheck = {
  resource: QueueResource;    // "appointment" | "queue" | "service" | "user" | "report" | "settings"
  data?: Record<string, unknown>; // Optional context data for conditions
}
```

### Return Value

```tsx
type UsePermissionsReturn = {
  // Individual permission checks
  hasPermission: (resource: QueueResource, action: QueueAction) => boolean;

  // Resource-specific permission lists
  getResourcePermissions: (resource: QueueResource) => PermissionResult[];

  // Batch permission checks
  hasAnyPermission: (resource: QueueResource, actions: QueueAction[]) => boolean;
  hasAllPermissions: (resource: QueueResource, actions: QueueAction[]) => boolean;

  // Raw results for all evaluations
  results: PermissionResult[];
}
```

## Role Permissions

### Admin
- **Full access** to all resources and actions
- Can manage all appointments, users, services, queues, reports, and settings

### Manager
- **Management permissions** for operational resources
- Can view/create/update appointments, queues, services
- Can manage staff and citizen users
- Can view/create reports
- Can view settings

### Staff
- **Basic operational** permissions
- Can view/create appointments
- Can update/assign appointments they're assigned to or unassigned ones
- Can view queues, services, and citizen profiles
- Can view reports

### Citizen
- **Self-service** permissions
- Can view/create appointments
- Can update/cancel their own appointments
- Can view queues and services
- Can view all users but only update their own profile

### Guest
- **Read-only** access to public information
- Can view services and queues
- No access to appointments, users, reports, or settings

## Permission Conditions

Some permissions include conditional logic based on the provided data:

### Own Resource Access
```tsx
// Citizens can only update their own appointments
const { hasPermission } = usePermissions({
  userRole: "citizen",
  context: { userId: "citizen-123" },
  checks: [
    {
      resource: "appointment",
      data: { userId: "citizen-123" } // Must match context.userId
    }
  ]
});

const canUpdate = hasPermission("appointment", "update"); // true
```

### Assignment-Based Access
```tsx
// Staff can update appointments assigned to them or unassigned
const { hasPermission } = usePermissions({
  userRole: "staff",
  context: { userId: "staff-456" },
  checks: [
    {
      resource: "appointment",
      data: { assignedTo: "staff-456" } // Assigned to current user
    }
  ]
});

const canUpdate = hasPermission("appointment", "update"); // true
```

## Common Use Cases

### 1. Navigation Menu

```tsx
function Navigation({ currentUser }) {
  const { hasPermission } = usePermissions({
    userRole: currentUser.role,
    context: { userId: currentUser.id },
    checks: [
      { resource: "appointment" },
      { resource: "user" },
      { resource: "report" },
      { resource: "settings" }
    ]
  });

  return (
    <nav>
      {hasPermission("appointment", "view") && (
        <NavLink to="/appointments">Appointments</NavLink>
      )}
      {hasPermission("user", "view") && (
        <NavLink to="/users">Users</NavLink>
      )}
      {hasPermission("report", "view") && (
        <NavLink to="/reports">Reports</NavLink>
      )}
      {hasPermission("settings", "view") && (
        <NavLink to="/settings">Settings</NavLink>
      )}
    </nav>
  );
}
```

### 2. Conditional Action Buttons

```tsx
function AppointmentActions({ appointment, currentUser }) {
  const { hasAnyPermission, hasAllPermissions } = usePermissions({
    userRole: currentUser.role,
    context: { userId: currentUser.id },
    checks: [
      {
        resource: "appointment",
        data: {
          assignedTo: appointment.assignedTo,
          userId: appointment.userId
        }
      }
    ]
  });

  const canModify = hasAnyPermission("appointment", ["update", "delete", "assign"]);
  const canFullyManage = hasAllPermissions("appointment", ["update", "delete", "assign"]);

  if (!canModify) return null;

  return (
    <div className="action-buttons">
      {canFullyManage ? (
        <AdminActions appointment={appointment} />
      ) : (
        <BasicActions appointment={appointment} />
      )}
    </div>
  );
}
```

### 3. Permission-based Data Display

```tsx
function UserProfile({ user, currentUser }) {
  const { getResourcePermissions } = usePermissions({
    userRole: currentUser.role,
    context: { userId: currentUser.id },
    checks: [
      { resource: "user", data: { userId: user.id, role: user.role } }
    ]
  });

  const userPermissions = getResourcePermissions("user");
  const allowedActions = userPermissions
    .filter(p => p.hasPermission)
    .map(p => p.action);

  return (
    <div>
      <h2>{user.name}</h2>

      {allowedActions.includes("view") && (
        <div>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
        </div>
      )}

      {allowedActions.includes("update") && (
        <EditUserForm user={user} />
      )}

      <div className="debug-info">
        Available actions: {allowedActions.join(", ")}
      </div>
    </div>
  );
}
```

### 4. Bulk Permission Analysis

```tsx
function PermissionsDashboard({ currentUser }) {
  const { results } = usePermissions({
    userRole: currentUser.role,
    context: { userId: currentUser.id },
    checks: [
      { resource: "appointment" },
      { resource: "queue" },
      { resource: "service" },
      { resource: "user" },
      { resource: "report" },
      { resource: "settings" }
    ]
  });

  // Group permissions by resource
  const permissionsByResource = results.reduce((acc, result) => {
    if (!acc[result.resource]) acc[result.resource] = [];
    acc[result.resource].push(result);
    return acc;
  }, {} as Record<string, typeof results>);

  return (
    <div>
      <h1>Your Permissions ({currentUser.role})</h1>
      {Object.entries(permissionsByResource).map(([resource, perms]) => (
        <div key={resource}>
          <h2>{resource}</h2>
          <div className="permissions-grid">
            {perms.map(perm => (
              <div
                key={perm.action}
                className={perm.hasPermission ? "allowed" : "denied"}
              >
                {perm.action}: {perm.hasPermission ? "✓" : "✗"}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Error Handling

The hook includes built-in error handling for invalid inputs:

```tsx
// Invalid role will throw ValidationError
usePermissions({
  userRole: "invalid-role", // ❌ Will throw ValidationError
  context: { userId: "123" },
  checks: [{ resource: "appointment" }]
});

// Invalid resource will throw ValidationError
usePermissions({
  userRole: "staff",
  context: { userId: "123" },
  checks: [{ resource: "invalid-resource" }] // ❌ Will throw ValidationError
});
```

For UI components that need graceful degradation, use the safe evaluation:

```tsx
import { safeEvaluatePermissions } from '@/hooks/usePermissions';

// This will return false instead of throwing on errors
const hasPermission = safeEvaluatePermissions({
  userRole: someRole,
  resource: "appointment",
  action: "view",
  context: { userId: "123" }
});
```

## Testing

The hook is fully tested with comprehensive test coverage. See the test files for usage examples:

- `usePermissions.test.ts` - Main hook functionality
- `permission_rules.test.ts` - Permission rule validation
- `helpers.test.ts` - Utility function tests
- `validators.test.ts` - Input validation tests
- `errors.test.ts` - Error handling tests

## Type Safety

The hook provides full TypeScript support with strict typing:

```tsx
// All parameters are type-checked
const { hasPermission } = usePermissions({
  userRole: "admin",     // ✓ Valid QueueRole
  context: { userId: "123" },
  checks: [
    { resource: "appointment" } // ✓ Valid QueueResource
  ]
});

// Function calls are type-checked
hasPermission("appointment", "view");   // ✓ Valid resource and action
hasPermission("invalid", "view");       // ❌ TypeScript error
hasPermission("appointment", "invalid"); // ❌ TypeScript error
```

## Performance

The hook is optimized for performance:

- **Memoized results** prevent unnecessary re-evaluations
- **Batch evaluation** processes multiple resources efficiently
- **Pure functions** enable predictable caching
- **No external dependencies** keep bundle size minimal

## Architecture

The permission system is built with a modular architecture:

- `usePermissions.ts` - Main React hook
- `evaluate_permissions.ts` - Core evaluation logic (framework-agnostic)
- `permission_rules.ts` - Queue management permission rules
- `types.ts` - TypeScript type definitions
- `validators.ts` - Input validation functions
- `helpers.ts` - Utility functions for permission checking
- `errors.ts` - Custom error classes

This modular design allows the core permission logic to be reused in server-side API routes or other contexts outside of React components.
