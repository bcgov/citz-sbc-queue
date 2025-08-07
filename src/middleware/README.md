# Middleware System

This directory contains the middleware system for handling authentication and route protection in the Service BC Queue Management application.

## Overview

The middleware system uses Next.js middleware to protect API routes and provide authentication context to downstream handlers. It follows a modular approach with utility functions for composing middleware logic.

## Architecture

```
middleware/
├── auth.ts      # Authentication middleware logic
├── utils.ts     # Middleware utility functions (chain, conditional)
└── README.md    # This file

src/
├── middleware.ts             # Main middleware entry point
└── utils/auth/
    └── getAuthContext.ts     # Helper to extract auth from requests
```

## How It Works

### 1. Main Middleware (`src/middleware.ts`)

The main middleware applies authentication conditionally to protected routes:

```typescript
// Only runs auth middleware on routes containing "protected" in their path
const protectedAuthMiddleware = conditional(
  (req: NextRequest) => isProtectedRoute(req.nextUrl.pathname),
  authMiddleware
)
```

**Configuration**: Matches all API routes (`/api/:path*`)

### 2. Route Protection (`auth.ts`)

Routes are protected based on pathname patterns:

```typescript
// Protected routes contain "protected" in their path
// Examples:
// ✅ /api/protected/users
// ✅ /api/admin-protected/settings
// ❌ /api/public/health
```

### 3. Authentication Flow

1. **Token Validation**: Extracts Bearer token from Authorization header
2. **JWT Verification**: Validates token against BC Gov SSO service
3. **User Context**: Decodes user information and roles
4. **Header Injection**: Adds auth context to request headers for API routes

**Headers Added**:
- `x-user-token`: Original JWT token
- `x-user-info`: Serialized user object
- `x-user-roles`: User's client roles array

## Using Authentication Context

### In API Routes

Use `getAuthContext()` to extract authentication information:

```typescript
import { getAuthContext } from "@/utils/auth/getAuthContext"

export async function GET(request: NextRequest) {
  const { user, token, roles } = getAuthContext(request)

  // Use user information for business logic
  console.log(`User: ${user.display_name}, Roles: ${userRoles}`)
}
```

## Middleware Utilities

### `conditional(condition, middleware)`

Runs middleware only when condition is met:

```typescript
const conditionalAuth = conditional(
  (req) => req.url.includes('/admin'),
  authMiddleware
)
```

### `chain(...middlewares)`

Chains multiple middleware functions:

```typescript
const combinedMiddleware = chain(
  loggingMiddleware,
  authMiddleware,
  rateLimitMiddleware
)
```

## Error Handling

The auth middleware returns appropriate HTTP status codes:

- `401 Unauthorized`: Missing/invalid token or auth header
- `404 Not Found`: User not found after token validation
- `500 Internal Server Error`: SSO configuration or validation errors
