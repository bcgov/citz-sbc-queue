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

The `usePermissions` hook provides a **configurable, fine-grained, context-aware permission management system** that goes beyond traditional Role-Based Access Control (RBAC). It evaluates user context, roles, resources, and additional data to determine what actions are permitted.

**Key Features:**
- **Configurable Rules**: Projects can provide their own permission rules
- **Flexible Context Support**: Supports various field naming conventions
- **Framework Agnostic**: Core logic works on both client and server
- **Type Safe**: Full TypeScript support with generic types

## Why This Approach?

- **Reusable**: Can be configured for any project's permission needs
- **Context-aware**: Permissions can depend on data relationships
- **Fine-grained**: Avoids role explosion by allowing conditions on permissions
- **Centralized**: All permission logic is managed in one place
- **Scalable**: Easy to maintain as system complexity grows
- **Flexible**: Supports different context structures and field naming conventions

## Flexible Context Support

The permission system supports various context field naming conventions to accommodate different authentication systems:

### Supported Field Names

| Purpose | Supported Fields |
|---------|-----------------|
| **User ID** | `userId`, `user_id`, `id`, `sub` |
| **Role** | `role`, `userRole`, `user_role` |
| **Data** | `data`, `context`, `metadata`, `attributes` |

### Context Examples

```typescript
// Standard structure
{ userId: 'user-123', role: 'staff', data: { assignedTo: 'user-123' } }

// Snake case (database style)
{ user_id: 'user-123', role: 'staff', data: { assigned_to: 'user-123' } }

// Keycloak JWT style
{ sub: 'user-123', role: 'staff', metadata: { assignedTo: 'user-123' } }

// Custom naming
{ id: 'user-123', userRole: 'staff', context: { assignedTo: 'user-123' } }
```

All these structures work seamlessly with the same permission evaluation logic!

## Core Types
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
  userId: string;              // User identifier (flexible naming supported)
  role: string;               // User's role (any string)
  resource: string;           // The resource being accessed (any string)
  data?: Record<string, unknown>; // Additional context data
  rules?: PermissionRule[];   // Optional custom permission rules
};
```

#### Return Value

```typescript
type UsePermissionsReturn = {
  permissions: string[];                    // Array of allowed actions
  hasPermission: (action: string) => boolean;      // Check single permission
  hasAnyPermission: (actions: string[]) => boolean; // Check any of multiple permissions
  hasAllPermissions: (actions: string[]) => boolean; // Check all permissions
};
```

### Core Function

```typescript
evaluatePermissions(
  context: PermissionContext,
  action: string,
  resource: string,
  rules?: PermissionRule[]
): boolean
```

### Permission Rule Structure

```typescript
type PermissionRule = {
  role: string;                                    // Role that this rule applies to
  resource: string;                               // Resource that this rule governs
  actions: string[];                              // Actions allowed by this rule
  condition?: (context: PermissionContext) => boolean; // Optional condition function
};
```

### Helper Functions

```typescript
createPermissionRule(
  role: string,
  resource: string,
  actions: string[],
  condition?: (context: Record<string, unknown>) => boolean
): PermissionRule
```

## Usage Examples

### Using Default Queue Management Rules

```tsx
import { usePermissions } from '@/app/hooks/usePermissions';

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

### Using Custom Project Rules

```tsx
import { usePermissions, createPermissionRule } from '@/app/hooks/usePermissions';

// Define custom rules for your project
const documentRules = [
  createPermissionRule('editor', 'document', ['read', 'write'],
    (ctx) => ctx.data?.owner === ctx.userId || ctx.data?.editors?.includes(ctx.userId)
  ),
  createPermissionRule('viewer', 'document', ['read']),
  createPermissionRule('admin', 'document', ['read', 'write', 'delete', 'share']),
];

function DocumentEditor({ document, currentUser }) {
  const { permissions } = usePermissions({
    userId: currentUser.id,
    role: currentUser.role,
    resource: 'document',
    data: {
      owner: document.owner,
      editors: document.editors
    },
    rules: documentRules // Use custom rules
  });

  return (
    <div>
      <h3>{document.title}</h3>
      {permissions.includes('write') && <button>Edit</button>}
      {permissions.includes('share') && <button>Share</button>}
      {permissions.includes('delete') && <button>Delete</button>}
    </div>
  );
}
```

### Server-Side Usage with Custom Rules

```typescript
import { evaluatePermissions, createPermissionRule } from '@/app/hooks/usePermissions';

const blogRules = [
  createPermissionRule('author', 'post', ['create', 'read', 'update', 'delete'],
    (ctx) => ctx.data?.authorId === ctx.userId
  ),
  createPermissionRule('moderator', 'post', ['read', 'update', 'delete']),
  createPermissionRule('reader', 'post', ['read']),
];

export async function updatePost(postId: string, userId: string, role: string) {
  const post = await getPost(postId);

  const canUpdate = evaluatePermissions(
    { userId, role, data: { authorId: post.authorId } },
    'update',
    'post',
    blogRules
  );

  if (!canUpdate) {
    throw new Error('Insufficient permissions to update post');
  }

  // Proceed with update...
}
```
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

## Queue Management System Example

The hook includes default rules for queue management as an example:

### Default Queue Roles & Actions

```typescript
// Default roles (can be extended)
type QueueRole = "admin" | "manager" | "staff" | "citizen" | "guest"

// Default actions (can be extended)
type QueueAction = "view" | "create" | "update" | "delete" | "approve" | "assign" | "cancel"

// Default resources (can be extended)
type QueueResource = "appointment" | "queue" | "service" | "user" | "report" | "settings"
```

### Permission Matrix

| Role | Resource | Actions | Conditions |
|------|----------|---------|------------|
| **admin** | all | all | none |
| **manager** | appointment | view, create, update, approve, assign, cancel | none |
| **manager** | user | view, update | only staff and citizens |
| **staff** | appointment | view, create, update, assign | only assigned or unassigned |
| **citizen** | appointment | view, create, update, cancel | only own appointments |
| **guest** | service, queue | view | none |

## Creating Custom Rules for Your Project

### 1. Define Your Domain Types

```typescript
// Example: Blog system
type BlogRole = 'admin' | 'moderator' | 'author' | 'reader';
type BlogAction = 'read' | 'write' | 'publish' | 'delete' | 'moderate';
type BlogResource = 'post' | 'comment' | 'user' | 'category';
```

### 2. Create Your Permission Rules

```typescript
import { createPermissionRule } from '@/app/hooks/usePermissions';

const blogRules = [
  // Authors can manage their own posts
  createPermissionRule('author', 'post', ['read', 'write', 'publish'],
    (ctx) => ctx.data?.authorId === ctx.userId
  ),

  // Moderators can moderate all content
  createPermissionRule('moderator', 'post', ['read', 'write', 'moderate', 'delete']),

  // Readers can only read published posts
  createPermissionRule('reader', 'post', ['read'],
    (ctx) => ctx.data?.status === 'published'
  ),

  // Admins have full access
  createPermissionRule('admin', 'post', ['read', 'write', 'publish', 'delete', 'moderate']),
];
```

### 3. Use in Your Components

```tsx
function BlogPost({ post, currentUser }) {
  const { permissions } = usePermissions({
    userId: currentUser.id,
    role: currentUser.role,
    resource: 'post',
    data: {
      authorId: post.authorId,
      status: post.status
    },
    rules: blogRules
  });

  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>

      {permissions.includes('write') && <EditButton />}
      {permissions.includes('delete') && <DeleteButton />}
      {permissions.includes('moderate') && <ModerateButton />}
    </article>
  );
}
```

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

The core permission evaluation logic is separated into its own module, making it reusable on the server side with flexible context support:

```typescript
import { evaluatePermissions } from '@/hooks/usePermissions';
import type { Role } from '@/hooks/usePermissions';

// Example 1: Standard context structure
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

// Example 2: Working with Keycloak JWT tokens
export async function updateAppointmentFromJWT(appointmentId: string, jwtPayload: any) {
  const appointment = await getAppointment(appointmentId);

  // Works with JWT field names
  const context = {
    sub: jwtPayload.sub,           // User ID from JWT
    role: jwtPayload.realm_access?.roles[0], // Role from Keycloak
    metadata: { assignedTo: appointment.assignedTo }
  };

  const canUpdate = evaluatePermissions(context, 'update', 'appointment');
  if (!canUpdate) {
    throw new Error('Insufficient permissions to update appointment');
  }
  // Proceed with update...
}

// Example 3: Database-style naming
export async function updateAppointmentFromDB(appointmentId: string, user: any) {
  const appointment = await getAppointment(appointmentId);

  const context = {
    user_id: user.id,
    user_role: user.role,
    context: { assigned_to: appointment.assigned_to }
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
