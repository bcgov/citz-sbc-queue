# Authentication Utilities

This folder contains modular utilities for handling authentication logic across the application.

## File Structure

```
src/utils/auth/
├── constants.ts                    # Static auth values (token keys, timeouts)
├── getAuthContext.ts               # Auth context retrieval (for api routes)
├── types.ts                        # Types for auth objects
├── jwt/
│   ├── decodeJWT.ts               # JWT token payload decoding
│   └── isJWTValid.ts              # JWT validation logic
├── popup/
│   ├── openPopup.ts               # Login popup window handling
│   └── pollPopupLogin.ts          # Popup login completion polling
├── token/
│   ├── getNewTokens.ts            # Token refresh and retrieval
│   └── getTokens.ts               # Token storage/context access
└── url/
    ├── getLoginURL.ts             # Auth provider login URL construction
    └── getLogoutURL.ts            # Auth provider logout URL construction
```

## Sub-directories

- **jwt/** - JWT token decoding and validation utilities
- **popup/** - Interactive OAuth login flow management
- **token/** - Secure token storage, retrieval, and refresh operations
- **url/** - Authentication provider endpoint URL generation

## Usage

These utilities are imported by authentication stores, middleware, and UI components to:
- Initiate login/logout flows
- Validate and decode tokens
- Manage authentication state
- Interact with SSO providers
