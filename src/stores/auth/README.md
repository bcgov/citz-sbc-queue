# Auth Store

The auth store manages authentication state using a dual-token system with a 10-hour session window. It handles token storage, automatic refresh, session warnings, and logout processes.

## Architecture Overview

### Token Storage Strategy
- **access_token** → Zustand store (memory)
- **refresh_token** → HttpOnly cookie (server-managed)
- **id_token** → localStorage (needed for logout)
- **sessionStartAt** → localStorage (tracks 10h window)

### Core State
```typescript
{
  session: Session | null,
  showExpiryWarning: boolean,
  isRefreshing: boolean
}
```

The `Session` object contains:
- `accessToken` - Used for API authorization
- `accessExpiresAt` - When access token expires (~5 minutes)
- `refreshExpiresAt` - When refresh token expires (~24 hours)
- `sessionEndsAt` - Hard session limit (10 hours from start)
- `idToken` - Optional token for logout flow

## Key Actions

### `bootstrap()`
Attempts to restore an existing session:
- Validates 10-hour session window hasn't expired
- Calls `/api/auth/token` for silent refresh using HttpOnly cookie
- If successful, restores session state without resetting session window

### `loginFromTokens(tokens, options)`
Establishes or updates authenticated session:
- **`resetSessionWindow: true`**: Starts new 10-hour session window
- **`resetSessionWindow: false`**: Preserves existing session window
- Persists tokens to appropriate storage locations
- Schedules background timers for refresh and expiry

### `refresh()`
Performs background token refresh:
- Calls `/api/auth/token` using HttpOnly refresh cookie
- Updates access/refresh tokens while preserving session window
- Returns `boolean` indicating success/failure
- Automatically reschedules timers on success

### `logout()`
Cleans up session state:
- Clears all background timers
- Removes tokens from memory and persistent storage
- Calls `/api/auth/logout` with id_token for server cleanup

### `setShowExpiryWarning(boolean)`
Controls display of session expiry warning UI

## Internal Implementation

### Timer Management
The store uses `timers.ts` to schedule background operations:
- **Access refresh**: 45 seconds before `accessExpiresAt`
- **Session warning**: 2 minutes before `sessionEndsAt`
- **Hard logout**: At `sessionEndsAt`

Timers are automatically cleared and rescheduled after token operations.

### Persistent Storage
- **localStorage**: `auth.idToken` (browser-scoped)
- **localStorage**: `auth.sessionStartAt` (browser-scoped)
- **HttpOnly cookie**: `refresh_token` (server-managed)
