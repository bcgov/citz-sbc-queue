# Enhanced usePermissions Hook - Type Inference & Multi-Resource API

## Overview

We have successfully implemented the enhanced reviewer suggestions for the usePermissions hook. This implementation addresses all the peer review feedback:

1. ✅ **API Simplification**: Removed complex helper functions, focus on core permission checking
2. ✅ **Flexible Context**: Support various field naming conventions (userId vs user_id vs id vs sub)
3. ✅ **Configurable Rules**: Projects can provide their own rules for complete customization
4. ✅ **Type Inference**: Automatically derive types from permission rule configurations
5. ✅ **Multi-Resource Support**: Check permissions across multiple resources simultaneously

## Key Features

### 1. Type Inference from Permission Rules

Types are automatically inferred from the actual permission configuration:

```typescript
// Define your permission rules
const myProjectRules = [
  { role: "editor", resource: "document", actions: ["view", "edit", "publish"] },
  { role: "viewer", resource: "document", actions: ["view"] },
  { role: "admin", resource: "user", actions: ["view", "create", "delete"] },
] as const

// Types are automatically inferred:
// - Roles: "editor" | "viewer" | "admin"
// - Actions: "view" | "edit" | "publish" | "create" | "delete"
// - Resources: "document" | "user"
```

### 2. Multi-Resource Permission Checking

Check permissions across multiple resources in a single hook call:

```typescript
const { results, hasPermission, hasAnyPermission } = usePermissions({
  userRole: "editor", // Type-safe - must match inferred roles
  context: { userId: "user-123" },
  rules: myProjectRules,
  checks: [
    { resource: "document", action: "view" },
    { resource: "document", action: "edit" },
    { resource: "document", action: "publish", data: { ownerId: "user-123" } },
    { resource: "user", action: "view" },
  ]
})

// results is an array of PermissionResult objects
// Helper functions provide convenient access patterns
```

### 3. Flexible Context Support

Supports various field naming conventions automatically:

```typescript
// All of these work with the same code:
const auth0Context = { sub: "user-123", data: { document: "doc-456" } }
const firebaseContext = { uid: "user-123", metadata: { document: "doc-456" } }
const customContext = { userId: "user-123", attributes: { document: "doc-456" } }
const legacyContext = { user_id: "user-123", context: { document: "doc-456" } }
```

### 4. Complete Example

```typescript
import { usePermissions } from './hooks/usePermissions'
import { DEFAULT_QUEUE_RULES } from './hooks/usePermissions/permission_rules'

// Example: Document Management System
const documentRules = [
  {
    role: "owner",
    resource: "document",
    actions: ["view", "edit", "delete", "share"],
    condition: (ctx) => ctx.data?.ownerId === ctx.userId
  },
  {
    role: "collaborator",
    resource: "document",
    actions: ["view", "edit"],
    condition: (ctx) => ctx.data?.collaborators?.includes(ctx.userId)
  },
  { role: "viewer", resource: "document", actions: ["view"] },
] as const

function DocumentEditor() {
  const { results, hasPermission, hasAnyPermission } = usePermissions({
    userRole: "owner", // Type-safe: "owner" | "collaborator" | "viewer"
    context: { userId: "user-123" },
    rules: documentRules,
    checks: [
      {
        resource: "document",
        action: "edit",
        data: { ownerId: "user-123", collaborators: ["user-456"] }
      },
      {
        resource: "document",
        action: "delete",
        data: { ownerId: "user-123" }
      }
    ]
  })

  // Type-safe helper functions
  const canEdit = hasPermission("document", "edit")
  const canManage = hasAnyPermission("document", ["delete", "share"])

  return (
    <div>
      {canEdit && <EditButton />}
      {canManage && <ManageButton />}

      {/* Or use results directly */}
      {results.map(result => (
        <div key={`${result.resource}-${result.action}`}>
          {result.resource} {result.action}: {result.hasPermission ? "✅" : "❌"}
        </div>
      ))}
    </div>
  )
}
```

## Benefits

### For Developers
- **Type Safety**: Compile-time checking of roles, actions, and resources
- **Intellisense**: Full autocomplete support in IDEs
- **Flexibility**: Support any field naming convention
- **Performance**: Batch permission checking reduces evaluation overhead

### For Projects
- **Reusability**: Same hook works across different permission systems
- **Maintainability**: Types automatically stay in sync with rules
- **Scalability**: Multi-resource checking prevents n+1 permission queries

### For Teams
- **Consistency**: Standardized permission patterns across the codebase
- **Documentation**: Types serve as living documentation
- **Refactoring**: Safe renaming and restructuring with TypeScript

## Migration Path

For existing code using the old API:

```typescript
// Old API (still works via legacy support)
const { permissions, hasPermission } = usePermissions({
  userId: "user-123",
  role: "staff",
  resource: "appointment",
  data: { assignedTo: "user-123" }
})

// New API (recommended)
const { results, hasPermission } = usePermissions({
  userRole: "staff",
  context: { userId: "user-123" },
  rules: DEFAULT_QUEUE_RULES,
  checks: [
    { resource: "appointment", action: "view", data: { assignedTo: "user-123" } },
    { resource: "appointment", action: "update", data: { assignedTo: "user-123" } }
  ]
})
```

## Next Steps

1. **Update Tests**: Modify existing tests to use the new API structure
2. **Add Examples**: Create comprehensive examples for different use cases
3. **Documentation**: Update README with new API patterns
4. **Migration Guide**: Provide step-by-step migration for existing codebases

This implementation successfully addresses all peer review feedback while maintaining backward compatibility and adding powerful new capabilities for type-safe, multi-resource permission management.
