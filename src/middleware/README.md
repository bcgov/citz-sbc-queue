# Middleware System

This directory contains the middleware system for handling authentication and route protection in the Service BC Queue Management application.

## Overview

The middleware system uses Next.js middleware to protect both API routes and frontend pages, providing authentication context and enforcing access control. It follows a unified approach that handles different authentication methods based on route type.

## Architecture

```
src/
├── middleware/
|   ├── auth.ts      # Authentication middleware logic
|   ├── utils.ts     # Middleware utility functions (chain, conditional)
|   └── README.md    # This file
|
├── middleware.ts             # Main middleware entry point
└── utils/auth/
    └── getAuthContext.ts     # Helper to extract auth from requests
```

## How It Works

### 1. Main Middleware (`src/middleware.ts`)

The main middleware applies authentication to all protected routes (both API and frontend):

```typescript
// Only runs auth middleware on routes containing "protected" in their path
if (isProtectedRoute(pathname)) {
  return authMiddleware(request)
}
```

**Configuration**: Matches all routes except auth routes and static files

### 2. Unified Route Protection (`auth.ts`)

Routes are protected based on pathname patterns and automatically handle different authentication methods:

```typescript
// Protected routes contain "/protected" in their path
// Examples:
// ✅ /api/protected/users      (API route - uses Bearer token)
// ✅ /protected/dashboard      (Frontend route - uses HTTP-only cookies)
// ✅ /admin/protected/settings (Any route with "protected")
// ❌ /api/public/health        (Public route)
// ❌ /login                    (Public frontend route)
```

### 3. Dual Authentication Flow

The middleware automatically detects route type and applies appropriate authentication:

#### For API Routes (`/api/*`)
1. **Bearer Token**: Extracts token from Authorization header
2. **JWT Verification**: Validates token against BC Gov SSO service
3. **User Context**: Adds auth context to request headers
4. **Error Response**: Returns JSON error responses (401, 500)

**Headers Added**:
- `x-user-token`: Original JWT token
- `x-user-info`: Serialized user object
- `x-user-roles`: User's client roles array

#### For Frontend Routes (non-API)
1. **Cookie Authentication**: Reads access token from HTTP-only cookie
2. **Token Validation**: Validates against BC Gov SSO service
3. **Redirect on Failure**: Redirects to home page if authentication fails
4. **Continue on Success**: Allows request to proceed to page

## Using Authentication Context

### In API Routes

Use `getAuthContext()` to extract authentication information:

```typescript
import { getAuthContext } from "@/utils/auth/getAuthContext"

export async function GET(request: NextRequest) {
  const { user, token, roles } = getAuthContext(request)

  // Use user information for business logic
  console.log(`User: ${user.display_name}, Roles: ${roles}`)
}
```

### In Frontend Pages

Authentication is handled automatically by the middleware:
- **Protected pages**: Users are redirected to home page if not authenticated
- **Public pages**: No authentication required
- **Access tokens**: Automatically managed via HTTP-only cookies

## Cookie Configuration

The authentication system uses environment-aware cookie settings:

- **Development**: `secure: false`, `sameSite: "lax"` (works with HTTP and port forwarding)
- **Production**: `secure: true`, `sameSite: "none"` (for HTTPS cross-site scenarios)

## Middleware Utilities

### `chain(...middlewares)`

Chains multiple middleware functions together:

```typescript
const combinedMiddleware = chain(
  loggingMiddleware,
  authMiddleware,
  rateLimitMiddleware
)
```

### `conditional(condition, middleware)`

Runs middleware only when condition is met. **Currently used in the main middleware** to apply auth only to protected routes:

```typescript
// src/middleware.ts
const conditionalAuthMiddleware = conditional(
  (req) => isProtectedRoute(req.nextUrl.pathname),
  authMiddleware
)
```

## Error Handling

### API Routes
The auth middleware returns appropriate HTTP status codes:

- `400 Bad Request`: Improper use of endpoint
- `401 Unauthorized`: Missing/invalid token or auth header
- `500 Internal Server Error`: SSO configuration or validation errors

### Frontend Routes
Authentication failures result in:

- **Redirect to Home**: Users are redirected to `/` for any authentication failure
- **Silent Handling**: No error pages or JSON responses for better UX
