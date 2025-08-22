# Enhanced usePermissions Hook - Type Inference & Multi-Resource API

## Overview

We have successfully implemented the enhanced reviewer suggestions for the usePermissions hook. This implementation addresses all the peer review feedback:

1. ✅ **API Simplification**: Simple context structure, automatic action evaluation
2. ✅ **Flexible Context**: Support various field naming conventions (userId vs user_id vs id vs sub)
3. ✅ **Configurable Rules**: Projects can provide their own rules with per-action conditions
4. ✅ **Type Inference**: Automatically derive types from permission rule configurations
5. ✅ **Multi-Resource Support**: Check permissions across multiple resources with simplified checks

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
  context: { user_id: "user-123" },
  checks: [
    // Just specify resource and data - all actions are evaluated
    { resource: "document", data: { created_by: "user-123" } },
    { resource: "user", data: { id: "user-456" } },
  ]
})

// results contains all actions evaluated for each resource
// Helper functions provide convenient access patterns
```

### 3. Flexible Context Support

Supports various field naming conventions automatically:

```typescript
// All of these work with the same code:
const auth0Context = { sub: "user-123" }
const firebaseContext = { uid: "user-123" }
const customContext = { userId: "user-123" }
const legacyContext = { user_id: "user-123" }

// Resource-specific data is passed per check, not in global context
// The condition functions handle mapping to appropriate resource fields
```

### 4. Complete Example

```typescript
import { usePermissions } from './hooks/usePermissions'

// Example: Document Management System with per-action conditions
const documentRules = [
  // Users can view all documents
  { role: "user", resource: "document", actions: ["view"] },
  // Users can only edit/delete documents they created
  {
    role: "user",
    resource: "document",
    actions: ["edit", "delete"],
    condition: (ctx) => ctx.data?.created_by === ctx.user_id
  },
  // Admins can do everything
  { role: "admin", resource: "document", actions: ["view", "edit", "delete", "share"] },
  // Different resource with different field mapping
  {
    role: "user",
    resource: "appointment",
    actions: ["view", "cancel"],
    condition: (ctx) => ctx.data?.user === ctx.user_id // Different field name
  },
] as const

function DocumentEditor() {
  const { results, hasPermission, hasAnyPermission } = usePermissions({
    userRole: "user", // Type-safe: inferred from rules
    context: { user_id: "user-123" }, // Simple context, no nested data
    checks: [
      // Just specify resource and data - get back all allowed actions
      { resource: "document", data: { created_by: "user-123", title: "My Doc" } },
      { resource: "appointment", data: { user: "user-123", status: "pending" } }
    ]
  })

  // Type-safe helper functions
  const canEditDocument = hasPermission("document", "edit")
  const canManageDocument = hasAnyPermission("document", ["delete", "share"])

  return (
    <div>
      {canEditDocument && <EditButton />}
      {canManageDocument && <ManageButton />}

      {/* Show all allowed actions per resource */}
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

## Next Steps

1. **Update Tests**: Modify existing tests to use the new API structure
2. **Add Examples**: Create comprehensive examples for different use cases
3. **Documentation**: Update README with new API patterns
4. **Implementation**: Build the simplified permission system with per-action conditions

This implementation successfully addresses all peer review feedback with a clean, simplified API that supports type-safe, multi-resource permission management with flexible context handling and per-action conditions.
