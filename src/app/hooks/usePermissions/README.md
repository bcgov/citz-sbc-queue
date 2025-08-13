# usePermissions Hook

A comprehensive Attribute-Based Access Control (ABAC) hook with **type inference** and **multi-resource support** for modern React applications.

## File Structure

```
usePermissions/
├── types.ts                    # Type inference utilities and core types
├── permission_rules.ts         # Permission rules configuration
├── permission_rules.test.ts    # Rules-specific tests
├── evaluate_permissions.ts     # Core permission evaluation logic
├── evaluate_permissions.test.ts # Evaluation logic tests
├── usePermissions.ts           # Multi-resource React hook implementation
├── usePermissions.test.ts      # Hook behavior tests
├── examples.tsx               # Updated usage examples and patterns
├── index.ts                   # Public API exports
└── README.md                  # This documentation
```

## Overview

The `usePermissions` hook provides a **type-safe, multi-resource permission management system** with automatic type inference from your permission rules. It supports checking permissions across multiple resources simultaneously while maintaining full TypeScript type safety.

**Key Features:**
- **Type Inference**: Automatically infers roles, actions, and resources from your permission rules
- **Multi-Resource Support**: Check permissions for multiple resources in a single hook call
- **Configurable Rules**: Projects can provide their own permission rules with `as const` for precise typing
- **Flexible Context Support**: Supports various field naming conventions (userId/user_id/id/sub)
- **Framework Agnostic**: Core logic works on both client and server
- **Type Safe**: Full TypeScript support with zero `any` types

## Why This Approach?

- **Type Inference**: Types are derived from actual permission rules, ensuring consistency
- **Multi-Resource Efficient**: Check permissions for multiple resources in a single call
- **Zero Configuration**: Just define your rules with `as const` and get full type safety
- **Flexible Context**: Supports different field naming conventions across authentication systems
- **Framework Agnostic**: Core logic works everywhere (React, API routes, server actions)
- **Scalable**: Easy to maintain as system complexity grows

## Enhanced Type Inference System

The permission system automatically infers all types from your permission rules configuration:

```typescript
// Define your rules with 'as const' for precise type inference
const MY_PROJECT_RULES = [
  {
    role: 'admin',
    resource: 'document',
    actions: ['read', 'write', 'delete', 'share'],
  },
  {
    role: 'editor', 
    resource: 'document',
    actions: ['read', 'write'],
    condition: (ctx) => ctx.data?.owner === ctx.userId
  },
  {
    role: 'viewer',
    resource: 'document', 
    actions: ['read'],
  },
] as const

// TypeScript automatically infers:
// Roles: 'admin' | 'editor' | 'viewer'
// Actions: 'read' | 'write' | 'delete' | 'share'  
// Resources: 'document'
```

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
usePermissions<T extends readonly PermissionRule[]>(
  props: UsePermissionsProps<T>
): UsePermissionsReturn<T>
```

#### Props

```typescript
type UsePermissionsProps<T extends readonly PermissionRule[]> = {
  userRole: InferRoles<T>      // Inferred from your rules
  context: PermissionContext   // Flexible context object
  rules: T                     // Your permission rules (with 'as const')
  checks: ResourceCheck<T>[]   // Array of resource/action checks
}

type ResourceCheck<T> = {
  resource: InferResources<T>  // Inferred from your rules
  action: InferActions<T>      // Inferred from your rules  
  data?: Record<string, unknown>  // Optional additional context
}
```

#### Return Value

```typescript
type UsePermissionsReturn<T> = {
  results: PermissionResult<T>[]  // Array of permission results
  hasPermission: (resource: InferResources<T>, action: InferActions<T>) => boolean
  getResourcePermissions: (resource: InferResources<T>) => PermissionResult<T>[]
  hasAnyPermission: (resource: InferResources<T>, actions: InferActions<T>[]) => boolean
  hasAllPermissions: (resource: InferResources<T>, actions: InferActions<T>[]) => boolean
}

type PermissionResult<T> = {
  resource: InferResources<T>
  action: InferActions<T>
  hasPermission: boolean
  data?: Record<string, unknown>
}
```

### Core Function

```typescript
evaluatePermissions(props: EvaluatePermissionsProps): boolean

type EvaluatePermissionsProps = {
  userRole: string
  resource: string  
  action: string
  context: PermissionContext
  rules: readonly PermissionRule[]
}
```

### Permission Rule Structure

```typescript
type PermissionRule = {
  role: string                                     // Role that this rule applies to
  resource: string                                // Resource that this rule governs  
  actions: readonly string[]                      // Actions allowed (readonly for type inference)
  condition?: (context: PermissionContext) => boolean // Optional condition function
}
```

### Helper Functions

```typescript
// Type inference utilities (automatically available)
type InferRoles<T extends readonly PermissionRule[]> = T[number]['role']
type InferActions<T extends readonly PermissionRule[]> = T[number]['actions'][number] 
type InferResources<T extends readonly PermissionRule[]> = T[number]['resource']
```

## Usage Examples

### Basic Multi-Resource Usage

```tsx
import { usePermissions } from '@/app/hooks/usePermissions'

// Define your rules with 'as const' for type inference
const BLOG_RULES = [
  {
    role: 'admin',
    resource: 'post',
    actions: ['read', 'write', 'delete', 'publish'],
  },
  {
    role: 'author', 
    resource: 'post',
    actions: ['read', 'write', 'publish'],
    condition: (ctx) => ctx.data?.authorId === ctx.userId
  },
  {
    role: 'reader',
    resource: 'post',
    actions: ['read'],
    condition: (ctx) => ctx.data?.status === 'published'
  },
] as const

function BlogDashboard({ currentUser, posts }) {
  const { results, hasPermission, getResourcePermissions } = usePermissions({
    userRole: currentUser.role, // TypeScript knows valid roles
    context: { userId: currentUser.id },
    rules: BLOG_RULES,
    checks: [
      { resource: 'post', action: 'read' },
      { resource: 'post', action: 'write' },
      { resource: 'post', action: 'delete' },
      { resource: 'post', action: 'publish' },
    ]
  })

  // Type-safe permission checking
  const canWritePosts = hasPermission('post', 'write')
  const canPublishPosts = hasPermission('post', 'publish')
  
  return (
    <div>
      <h1>Blog Dashboard</h1>
      {canWritePosts && <CreatePostButton />}
      {canPublishPosts && <PublishQueuePanel />}
      
      {posts.map(post => (
        <PostCard 
          key={post.id}
          post={post}
          canEdit={hasPermission('post', 'write')}
          canDelete={hasPermission('post', 'delete')}
        />
      ))}
    </div>
  )
}
```

### Per-Resource Context and Conditional Permissions

```tsx
function DocumentList({ documents, currentUser }) {
  const { hasPermission } = usePermissions({
    userRole: currentUser.role,
    context: { userId: currentUser.id },
    rules: DOCUMENT_RULES,
    checks: documents.flatMap(doc => [
      { 
        resource: 'document', 
        action: 'read',
        data: { documentId: doc.id, ownerId: doc.ownerId }
      },
      { 
        resource: 'document', 
        action: 'edit',
        data: { documentId: doc.id, ownerId: doc.ownerId }
      },
      { 
        resource: 'document', 
        action: 'delete',
        data: { documentId: doc.id, ownerId: doc.ownerId }
      },
    ])
  })

  return (
    <div>
      {documents.map(doc => (
        <div key={doc.id}>
          <h3>{doc.title}</h3>
          {hasPermission('document', 'read') && (
            <ViewButton documentId={doc.id} />
          )}
          {hasPermission('document', 'edit') && (
            <EditButton documentId={doc.id} />
          )}
          {hasPermission('document', 'delete') && (
            <DeleteButton documentId={doc.id} />
          )}
        </div>
      ))}
    </div>
  )
}
```

### Resource-Specific Permission Checking

```tsx
function ProjectManagementDashboard({ currentUser, projects }) {
  const { getResourcePermissions, hasAnyPermission } = usePermissions({
    userRole: currentUser.role,
    context: { userId: currentUser.id, department: currentUser.department },
    rules: PROJECT_RULES,
    checks: [
      { resource: 'project', action: 'view' },
      { resource: 'project', action: 'create' },
      { resource: 'project', action: 'edit' },
      { resource: 'project', action: 'delete' },
      { resource: 'task', action: 'view' },
      { resource: 'task', action: 'create' },
      { resource: 'task', action: 'assign' },
    ]
  })

  // Get all permissions for specific resource
  const projectPermissions = getResourcePermissions('project')
  const taskPermissions = getResourcePermissions('task')
  
  // Check if user can perform any management actions
  const canManageProjects = hasAnyPermission('project', ['create', 'edit', 'delete'])
  const canManageTasks = hasAnyPermission('task', ['create', 'assign'])

  return (
    <div>
      <h1>Project Dashboard</h1>
      
      {canManageProjects && (
        <div>
          <h2>Project Management</h2>
          <button>Create Project</button>
          {/* Show project management tools */}
        </div>
      )}
      
      {canManageTasks && (
        <div>
          <h2>Task Management</h2>
          <button>Create Task</button>
          {/* Show task management tools */}
        </div>
      )}
    </div>
  )
}
```

### Server-Side Usage

```typescript
import { evaluatePermissions } from '@/app/hooks/usePermissions'

const BLOG_RULES = [
  {
    role: 'author',
    resource: 'post', 
    actions: ['create', 'read', 'update', 'delete'],
    condition: (ctx) => ctx.data?.authorId === ctx.userId
  },
  {
    role: 'moderator',
    resource: 'post',
    actions: ['read', 'update', 'delete'],
  },
  {
    role: 'reader', 
    resource: 'post',
    actions: ['read'],
    condition: (ctx) => ctx.data?.status === 'published'
  },
] as const

export async function updatePost(postId: string, userId: string, userRole: string) {
  const post = await getPost(postId)

  const canUpdate = evaluatePermissions({
    userRole,
    resource: 'post',
    action: 'update', 
    context: { 
      userId,
      data: { authorId: post.authorId, status: post.status }
    },
    rules: BLOG_RULES
  })

  if (!canUpdate) {
    throw new Error('Insufficient permissions to update post')
  }

  // Proceed with update...
}

// Works with different context structures
export async function updatePostFromJWT(postId: string, jwtPayload: any) {
  const post = await getPost(postId)

  const canUpdate = evaluatePermissions({
    userRole: jwtPayload.realm_access?.roles[0],
    resource: 'post', 
    action: 'update',
    context: {
      sub: jwtPayload.sub,  // JWT user ID field
      data: { authorId: post.authorId }
    },
    rules: BLOG_RULES
  })

  if (!canUpdate) {
    throw new Error('Insufficient permissions to update post')
  }
  // Proceed with update...
}
```
```

### Batch Permission Results Analysis

```tsx
function PermissionsDashboard({ currentUser }) {
  const { results } = usePermissions({
    userRole: currentUser.role,
    context: { userId: currentUser.id },
    rules: SYSTEM_RULES,
    checks: [
      { resource: 'user', action: 'view' },
      { resource: 'user', action: 'create' }, 
      { resource: 'user', action: 'edit' },
      { resource: 'report', action: 'view' },
      { resource: 'report', action: 'generate' },
      { resource: 'settings', action: 'view' },
      { resource: 'settings', action: 'edit' },
    ]
  })

  // Group results by resource for organized display
  const permissionsByResource = results.reduce((acc, result) => {
    if (!acc[result.resource]) {
      acc[result.resource] = []
    }
    acc[result.resource].push(result)
    return acc
  }, {} as Record<string, typeof results>)

  return (
    <div>
      <h1>Your Permissions</h1>
      {Object.entries(permissionsByResource).map(([resource, perms]) => (
        <div key={resource}>
          <h2>{resource}</h2>
          <ul>
            {perms.map(perm => (
              <li key={perm.action} className={perm.hasPermission ? 'allowed' : 'denied'}>
                {perm.action}: {perm.hasPermission ? '✓' : '✗'}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
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

### 1. Define Your Permission Rules with Type Inference

```typescript
// Define your rules with 'as const' for automatic type inference
const MY_PROJECT_RULES = [
  {
    role: 'admin',
    resource: 'document',
    actions: ['read', 'write', 'delete', 'share'],
  },
  {
    role: 'owner',
    resource: 'document',
    actions: ['read', 'write', 'delete', 'share'],
    condition: (ctx: PermissionContext) => 
      (ctx.data as Record<string, unknown>)?.ownerId === ctx.userId
  },
  {
    role: 'collaborator',
    resource: 'document',
    actions: ['read', 'write'],
    condition: (ctx: PermissionContext) => {
      const data = ctx.data as Record<string, unknown>
      const collaborators = data?.collaboratorIds as string[]
      return Array.isArray(collaborators) && collaborators.includes(ctx.userId as string)
    }
  },
  {
    role: 'viewer',
    resource: 'document',
    actions: ['read'],
  },
] as const

// TypeScript automatically infers:
// Roles: 'admin' | 'owner' | 'collaborator' | 'viewer'
// Actions: 'read' | 'write' | 'delete' | 'share'
// Resources: 'document'
```

### 2. Use Multi-Resource Permission Checking

```typescript
function DocumentWorkspace({ documents, currentUser }) {
  const { results, hasPermission, hasAnyPermission } = usePermissions({
    userRole: currentUser.role, // Type-safe: only accepts valid roles
    context: { userId: currentUser.id },
    rules: MY_PROJECT_RULES,
    checks: documents.flatMap(doc => [
      { 
        resource: 'document', 
        action: 'read',
        data: { ownerId: doc.ownerId, collaboratorIds: doc.collaboratorIds }
      },
      { 
        resource: 'document', 
        action: 'write',
        data: { ownerId: doc.ownerId, collaboratorIds: doc.collaboratorIds }
      },
      { 
        resource: 'document', 
        action: 'delete',
        data: { ownerId: doc.ownerId, collaboratorIds: doc.collaboratorIds }
      },
    ])
  })

  // Efficient batch permission checking for all documents
  return (
    <div>
      {documents.map(doc => {
        const canRead = hasPermission('document', 'read')
        const canEdit = hasPermission('document', 'write')
        const canDelete = hasPermission('document', 'delete')
        
        return (
          <DocumentCard 
            key={doc.id}
            document={doc}
            canRead={canRead}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        )
      })}
    </div>
  )
}
```

## Enhanced Features

### Type Inference Benefits

1. **Compile-Time Safety**: Invalid roles, actions, or resources cause TypeScript errors
2. **IDE Autocompletion**: Full IntelliSense support for all permission-related values
3. **Refactoring Safety**: Renaming roles/actions/resources is automatically tracked
4. **Documentation**: Types serve as living documentation of your permission model

### Multi-Resource Efficiency

1. **Batch Processing**: Check permissions for multiple resources in one hook call
2. **Reduced Hook Calls**: One `usePermissions` call instead of multiple per resource
3. **Better Performance**: Memoized results prevent unnecessary recalculations
4. **Organized Results**: Group and analyze permissions by resource or action

### Flexible Context Support

The permission system supports various authentication system field naming:

```typescript
// Works with all these context structures:
const contexts = [
  { userId: 'user-123', data: { ownerId: 'user-456' } },
  { user_id: 'user-123', data: { owner_id: 'user-456' } },
  { sub: 'user-123', metadata: { ownerId: 'user-456' } },
  { id: 'user-123', context: { ownerId: 'user-456' } },
]
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

- **`evaluate_permissions.test.ts`**: Tests core permission evaluation logic and flexible context support
- **`usePermissions.test.ts`**: Tests React hook behavior, memoization, and multi-resource features
- **`permission_rules.test.ts`**: Tests rule configuration, type inference, and structure validation

This covers:
- Multi-resource permission checking
- Type inference from permission rules
- Flexible context field naming support
- Hook behavior and memoization
- Permission utility functions (hasPermission, hasAnyPermission, etc.)
- Rule completeness and consistency
- Edge cases and error handling
- Performance optimizations

Run tests with:
```bash
npm test usePermissions
```

## Performance Considerations

- **Memoized results**: The hook uses `useMemo` to prevent unnecessary recalculations
- **Batch evaluation**: Multiple permission checks are processed efficiently in a single call
- **Type inference**: Compile-time type checking with zero runtime overhead
- **Minimal re-renders**: Only recalculates when context, rules, or checks change

## Security Notes

1. **Client-side UI only**: This hook is for UI logic only. Always validate permissions on the server
2. **Server-side validation**: Use `evaluatePermissions` in API routes and server actions for security
3. **Context validation**: Ensure context data is properly validated before passing to the hook
4. **Rule isolation**: Keep permission rules in dedicated files for easy auditing
5. **Type safety**: TypeScript prevents many permission-related bugs at compile time

## Migration from Single-Resource API

If you're upgrading from an older single-resource version:

### Old API
```typescript
const { permissions, hasPermission } = usePermissions({
  userId: user.id,
  role: user.role,
  resource: 'appointment',
  data: { assignedTo: appointment.assignedTo }
})
```

### New Enhanced API
```typescript
const { results, hasPermission } = usePermissions({
  userRole: user.role,
  context: { userId: user.id },
  rules: YOUR_RULES,
  checks: [
    { 
      resource: 'appointment', 
      action: 'view',
      data: { assignedTo: appointment.assignedTo }
    },
    // Add more checks as needed
  ]
})
```

### Benefits of Migration
- **Type Safety**: Full TypeScript inference from your actual rules
- **Performance**: Batch multiple permission checks efficiently  
- **Flexibility**: Support for various context field naming conventions
- **Scalability**: Easily add new resources, roles, and actions
- **Maintainability**: Centralized rule configuration with type checking

## Contributing

When adding new permissions:

1. **Update rules**: Add new roles, resources, or actions to your permission rules
2. **Type inference**: Use `as const` to ensure proper type inference
3. **Add tests**: Write tests for new permission scenarios
4. **Update documentation**: Add examples for new permission patterns
5. **Server validation**: Ensure corresponding server-side permission checks

## Advanced Usage Patterns

### Conditional UI Rendering

```typescript
const { hasAnyPermission, hasAllPermissions } = usePermissions({
  userRole: currentUser.role,
  context: { userId: currentUser.id },
  rules: PROJECT_RULES,
  checks: [
    { resource: 'project', action: 'view' },
    { resource: 'project', action: 'edit' },
    { resource: 'project', action: 'delete' },
    { resource: 'project', action: 'admin' },
  ]
})

// Show management interface if user has any management permission
const showManagement = hasAnyPermission('project', ['edit', 'delete', 'admin'])

// Show admin panel only if user has full administrative access
const showAdminPanel = hasAllPermissions('project', ['view', 'edit', 'delete', 'admin'])
```

### Permission-Based Route Protection

```typescript
// In a layout or page component
const { hasPermission } = usePermissions({
  userRole: session.user.role,
  context: { userId: session.user.id },
  rules: APP_RULES,
  checks: [
    { resource: 'admin_panel', action: 'access' },
  ]
})

if (!hasPermission('admin_panel', 'access')) {
  redirect('/unauthorized')
}
```
