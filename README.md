# Service B.C. Queue Management citz-sbc-queue

## Overview

> **Note:** This is a complete rebuild of the Service B.C. [Queue Management System](https://github.com/bcgov/queue-management), designed for modern accessibility, performance, and maintainability.

The Queue Managment System is used to manage citizen flow and provide analtyics for our Service BC locations. This system is designed to be used for government offices with a large number of services.

## Tech Stack
| Item | Description |
|------|-------------|
| **Next.js** | TypeScript, App Router, and Webpack bundler |
| **Biome** | Formatting and linting |
| **Headless UI** | Components |
| **TailwindCSS** | Styling |
| **Zod** | Server and form action validation |
| **Zustand** | Global state management |
| **Vitest** & **Jest** | Testing |

## BC Gov Design System

The application follows the [BC Government Digital Design System](https://www2.gov.bc.ca/gov/content/digital) for a consistent government look and feel.

### Styles (`src/styles/`)

`globals.css` is the root stylesheet. It imports the **BC Sans** font (`@bcgov/bc-sans`), then layers three custom CSS files before TailwindCSS:

- **`colours.css`** — Defines the full BC Gov colour palette as TailwindCSS theme tokens (blue, gold, grays, status colours, typography, borders, buttons, icons), replacing Tailwind defaults.
- **`spacing.css`** — Adjusts font sizes, line heights, spacing scale, border widths, and breakpoints to match BC Gov typography and layout standards.
- **`components.css`** — Base `<button>` styles at the CSS `components` layer with primary/secondary/tertiary variants, danger modifiers, and disabled states.

Together, these make BC Gov tokens available as Tailwind utility classes throughout the app (e.g., `bg-button-primary`, `text-typography-primary`, `border-border-dark`, `px-sm`).

### Common Components (`src/components/common/`)

Reusable UI components exported from `src/components/common/index.ts` (re-exported via `@/components`). They consume the BC Gov tokens for consistent styling.

- **Header/Footer** — Application shell with the official BC Gov SVG logo, responsive navigation, land acknowledgement, and standard government footer links.
- **Dialog/Modal** — Composable system (`Dialog`, `Modal`, `DialogHeader`, `DialogBody`, `DialogActions`, `CloseButton`) with size/position variants and Headless UI transitions.
- **Form inputs** — `TextField`, `TextArea`, `SelectInput`, `MultiSelect`, `CheckboxInput`, and `Switch`, all sharing consistent label, border, and disabled styling.
- **Notice** — Alert banner with colour-coded left border (success, error, warn, info).
- **Loginout** — Conditionally renders `LoginButton` or `LogoutButton` based on auth state.

## SSO Authentication

The application uses **BC Gov SSO (Keycloak)** with the **OpenID Connect Authorization Code** flow. The identity provider is **Azure AD IDIR** (`azureidir`), for multi-factor auth.

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SSO_ENVIRONMENT` | Keycloak environment | `dev`, `test`, `prod` |
| `SSO_REALM` | Keycloak realm | `standard` |
| `SSO_PROTOCOL` | Protocol | `openid-connect` |
| `SSO_CLIENT_ID` | OAuth2 client ID | `citz-sbc-queue-6089` |
| `SSO_CLIENT_SECRET` | OAuth2 client secret | — |
| `SSO_INTEGRATION_ID` | CSS API integration ID for role management | `6089` |
| `CSS_API_CLIENT_ID` | CSS API service account client ID | — |
| `CSS_API_CLIENT_SECRET` | CSS API service account secret | — |
| `APP_URL` | Application base URL for redirects | `http://localhost:3000` |

### Login Flow

1. **Login Button** — The `LoginButton` component (`src/components/auth/LoginButton.tsx`) opens a popup window pointing to `/api/auth/login`.

2. **Redirect to Keycloak** — The `/api/auth/login` route (`src/app/api/auth/login/route.ts`) constructs the Keycloak authorization URL and redirects the popup to BC Gov SSO with parameters: `client_id`, `response_type=code`, `scope=email+openid`, `kc_idp_hint=azureidir`, and `redirect_uri` pointing to the callback route.

3. **User Authenticates** — The user enters their credentials at the Keycloak login page.

4. **Callback and Token Exchange** — Keycloak redirects back to `/api/auth/login/callback` (`src/app/api/auth/login/callback/route.ts`) with an authorization `code`. The callback route:
   - Exchanges the code for tokens via `getTokens()` (`src/utils/auth/token/getTokens.ts`), which POSTs to Keycloak's `/token` endpoint.
   - Upserts the user in the database via `updateUserOnLogin()` (`src/utils/user/updateUserOnLogin.ts`). New users are assigned a role based on legacy CSR records if they exist.
   - Sets five cookies on the response:

     | Cookie | HttpOnly | Purpose |
     |--------|----------|---------|
     | `access_token` | No | JWT access token (readable by JS) |
     | `refresh_token` | **Yes** | Refresh token (server-only, sent automatically) |
     | `id_token` | No | ID token (needed for logout) |
     | `expires_in` | No | Access token expiry duration metadata |
     | `refresh_expires_in` | No | Refresh token expiry duration metadata |

   - Returns an HTML page displaying "Login Successful".

5. **Popup Polling** — The `LoginButton` polls the popup via `pollPopupLogin()` (`src/utils/auth/popup/pollPopupLogin.ts`) every 300ms. It checks if the popup URL matches the callback path, waits for the document to finish loading, then reads the non-HttpOnly tokens from `document.cookie` and resolves with the token payload.

6. **Session Created** — `loginFromTokens()` (`src/stores/auth/store.ts`) stores the access token in the Zustand in-memory store and records a 10-hour session window in `localStorage`.

### Token Refresh

- A background timer (`src/stores/auth/timers.ts`) fires 45 seconds before the access token expires.
- It calls `POST /api/auth/token` (`src/app/api/auth/token/route.ts`), which reads the HttpOnly `refresh_token` cookie and exchanges it for new tokens at Keycloak.
- The 10-hour session window is **not** reset on refresh — it is a hard limit set at initial login.

### Session Expiry

- Two minutes before the 10-hour window closes, an `AuthExpiryModal` (`src/components/auth/AuthExpiryModal/AuthExpiryModal.tsx`) displays a countdown with options to extend the session or log out.
- At the 10-hour mark, the user is logged out automatically.

### Page Reload Recovery

`AuthInitializer` (`src/components/auth/AuthInitializer.tsx`) calls `bootstrap()` on mount, which checks `localStorage` for an active session window and attempts to refresh tokens using the HttpOnly cookie. This allows sessions to survive full page reloads within the 10-hour window.

### Logout

1. **Logout Button** — `LogoutButton` (`src/components/auth/LogoutButton.tsx`) calls `updateUserOnLogout()` to mark the user inactive in the database, then navigates to `/api/auth/logout`.

2. **Server-Side Cleanup** — `/api/auth/logout` (`src/app/api/auth/logout/route.ts`) clears all auth cookies (`maxAge: 0`) and redirects through **BC Gov SiteMinder** (`logontest7.gov.bc.ca/clp-cgi/logoff.cgi`), which clears the SSO session before redirecting to Keycloak's logout endpoint and back to the application.

3. **Client-Side Cleanup** — `LogoutHandler` (`src/components/auth/LogoutHandler.tsx`) detects the `?post_logout=true` query parameter, clears the Zustand store and timers, and removes the query parameter from the URL.

### Protected Routes

Route protection is handled by Next.js middleware (`src/middleware/auth.ts`), invoked via `src/proxy.ts`. A route is protected if its pathname contains `/protected`.

- **API routes**: The middleware extracts the `Authorization: Bearer <token>` header, validates it against Keycloak's token introspection endpoint (`POST /token/introspect`), and on success adds `x-user-token`, `x-user-info`, and `x-user-roles` headers for downstream handlers.
- **Frontend routes**: The middleware reads the `access_token` cookie, validates it the same way, and redirects to `/` on failure. On success it adds the same `x-user-*` headers.

Protected routes access auth context via `getAuthContext()` (`src/utils/auth/getAuthContext.ts`), which reads the headers set by middleware.

### Role-Based Access Control

Roles are managed in Keycloak via the **CSS API** (`src/utils/sso/`):

| Role | Description |
|------|-------------|
| `Authenticated` | Base role for all logged-in users |
| `CSR` | Customer service representative |
| `SCSR` | Senior customer service representative |
| `SDM` | Service delivery manager |
| `Administrator` | Full access |

Roles are assigned via `assignRole()` (`src/utils/sso/assignRole.ts`) and removed via `unassignRole()` (`src/utils/sso/unassignRole.ts`), both calling the CSS API at `api.loginproxy.gov.bc.ca`.

Resource-level policies (`src/utils/policies/`) enforce attribute-based access control (ABAC) on top of roles. For example, Administrators can archive any staff user except themselves, while SDM users can only edit users in their own location.

### Auth UI Components

| Component | Purpose |
|-----------|---------|
| `LoginButton` | Opens SSO popup flow |
| `LogoutButton` | Triggers server-side logout |
| `AuthProvider` | Mounts `AuthInitializer`, `AuthExpiryModal`, and `LogoutHandler` |
| `Loginout` | Conditionally renders `LoginButton` or `LogoutButton` based on auth state |
| `IsAuthenticated` | Guard component for role-based conditional rendering |
| `useAuth()` | Client-side hook returning `isAuthenticated`, `role`, `hasRole()`, `authorizationHeader`, and user profile fields |

### Security Configuration

- **Cookie security**: `secure: true` and `sameSite: "none"` in production; `secure: false` and `sameSite: "lax"` in development.
- **HTTP headers** (`next.config.ts`): `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
- **Login redirect caching**: The `/api/auth/login` route sets `Cache-Control: no-store` to prevent stale authorization redirects.

## Application Features

All features use **Next.js Server Actions** (not REST API routes) for data operations. Access control is enforced via a policy system (`src/utils/policies/`) that evaluates role hierarchy and location scoping.

### Location & Counter Changer (Header)

The header displays the logged-in user's current **location** and **counter**. Users with the `CSR` role or above see a switch icon that opens a "Change Location or Counter" modal with two dropdowns:

- **Location** — populated from all locations in the database.
- **Counter** — filtered to counters associated with the selected location. Changing location auto-resets the counter to the default "Counter".

On confirm, the user's `locationCode` and `counterId` are updated via the `updateStaffUser` server action. Cancel reverts to the previous values.

### Availability Toggle (Header)

A switch in the header lets users toggle their availability status (`StaffUser.isActive`). When toggled off, the user is temporarily removed from the queue and a modal explains they are unavailable. A "Return to Availability" button restores their status.

### Settings Pages (`/protected/settings`)

A navigation index page links to the following sub-pages. Each page provides a `DataTable` with create/edit/archive (or delete) functionality. Visibility and actions are policy-gated — SDMs manage their own location, Administrators manage all.

| Page | Description |
|------|-------------|
| **Users** | View/edit staff users. Edit modal includes read-only user info, role assignment (synced to SSO), location/counter assignment, and permission flags (receptionist, office manager, etc.). Archived users are hidden by default with a toggle to show them. |
| **Locations** | Create/edit locations with code, name, address (geocoded via API), timezone, phone, and M:N relationships to services, counters, and staff users. Changing a location's staff or counter assignments automatically resets displaced users to the default counter. |
| **Counters** | Create/edit/delete counters with a name and M:N location/user assignments. The default "Counter" cannot be edited or deleted. Deleting a counter reassigns its staff users to the default counter. |
| **Services** | Create/edit services with code, ticket prefix, name, public name, description, back-office flag, and M:N relationships to locations and categories. |
| **Service Categories** | Create/edit categories and assign services to them. |
| **Developer** | _(Developer role only)_ Switch your own role between any of the five roles for testing purposes. |

## Queue Implementation Plan

The live queue is tracked entirely within PostgreSQL — no separate message broker (e.g., RabbitMQ) is used. The approach relies on **database triggers** and **PostgreSQL LISTEN/NOTIFY** to push real-time queue state changes to connected clients.

### How It Works

1. **Queue operations** (add citizen, call next, serve, transfer, complete) are performed via server actions that mutate queue tables in the `app` schema.
2. **Database triggers** on those tables fire after each write and call `pg_notify()` with a channel name (e.g., `queue_update`) and a JSON payload describing the change (action type, location, affected rows).
3. A **listener service** in the application holds a persistent `pg` client connection (separate from the Prisma connection pool) subscribed to those channels. On receiving a notification, it fans out the payload to connected clients.
4. **Clients** (CSR dashboards, digital signage, self-service kiosks) receive updates via **Server-Sent Events** (SSE) or **WebSocket** from the listener, keeping their queue displays in sync without polling.

### Why Not a Separate Broker

- The queue state is relational data that already lives in PostgreSQL — triggers avoid duplicating it into an external system.
- LISTEN/NOTIFY is lightweight and sufficient for the scale of a single-location queue (dozens of concurrent clients, not thousands).
- Fewer moving parts: no broker to deploy, monitor, or synchronize with the database.

### Planned Data Model

New models will be added to the `app` schema, informed by the legacy `public` schema (`CitizenLegacy`, `ServiceReq`, `Period`, `CitizenState`, `SRState`):

| Model | Purpose |
|-------|---------|
| **Ticket** | A citizen entry in the queue — ticket number (generated from `Service.ticketPrefix`), state (waiting, serving, etc.), priority, linked service requests, assigned counter/CSR. |
| **TicketState** | Enum or table of queue states (e.g., `Waiting`, `Called`, `Serving`, `Paused`, `Completed`, `NoShow`). |
| **ServiceRequest** | Links a ticket to one or more services requested, with its own state tracking. |
| **Period** | Time-bounded record of a CSR interacting with a ticket (start/end timestamps, period state). Used for wait-time and service-time metrics. |

### Planned Trigger Design

```sql
-- Example: fires after a ticket state change
CREATE OR REPLACE FUNCTION notify_queue_update()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('queue_update', json_build_object(
    'action', TG_OP,
    'table', TG_TABLE_NAME,
    'location_code', NEW.location_code,
    'ticket_id', NEW.ticket_id,
    'state', NEW.state
  )::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Triggers will be attached to the `ticket` and `service_request` tables, notifying on INSERT, UPDATE, and DELETE.

### Listener Service

A long-running service (started in `lib/queues/`) will:

- Open a raw `pg` client connection (not via Prisma, since Prisma does not support LISTEN/NOTIFY).
- Subscribe to `queue_update` (and potentially per-location channels like `queue_update_<location_code>`).
- On notification, broadcast the payload to connected SSE/WebSocket clients filtered by location.

### Key Files (Planned)

```
lib/prisma/queues/
├── getQueueStatus.ts       # Get real-time queue info
├── updateQueueMetrics.ts   # Update queue statistics
└── listener.ts             # LISTEN/NOTIFY listener service

app/queue/
├── page.tsx                # CSR queue dashboard
└── api/stream/route.ts     # SSE endpoint for live queue updates
```

## Development Environment

## Running locally

Use the provided npm scripts to control the compose environment. The runner reads `CONTAINER_CLIENT` and `WSL` env vars, so set those there before running.

This allows for use of docker or podman, with optional wsl support for Windows.

- **npm run up** — start services.
- **npm run down** — stop and remove containers, images, and orphans.
- **npm run rebuild** — rebuild images (no-cache) then bring services up.

Example `.env` values (project root):

```
CONTAINER_CLIENT=docker   # or podman
WSL=true                  # set to "true" on Windows when using WSL to run the container CLI
```

## Directory Information

| Type | File Path | Description |
| ---- | --------- | ----------- |
| Directory | `.github` | Holds Github related files. See .github/README.md for more information |
| Configuration | `.vscode/settings.json` | Editor and linter configuration |
| Directory | `public` | Globally accessable static files |
| Directory | `scripts` | Holds useful scripts to run on the project |
| Directory | `src` | Application code. |
| Configuration | `.editorconfig` | Cross-platform editor configuration |
| Configuration | `.gitattributes` | Line ending specifications (LF for all text files) |
| Configuration | `.gitignore` | List of file types to not be tracked by Github  |
| Configuration | `.npmrc` | Strict npm install versions |
| Configuration | `biome.json` | Biome formatter/linter settings |
| Legal | `LICENSE` | The Apache 2.0 license documentation |
| Configuration | `next.config.ts` | Allows for Next.js configuration. See documentation [here](https://nextjs.org/docs/app/api-reference/config/next-config-js#typescript) |
| Configuration | `package.json` | Contains run commands, dependencies, and project informaiton |
| Configuration | `postcss.config.mjs` | Used to add Tailwind to project |
| Configuration | `tailwind.config.ts` | Defines styling configuration and theme for Tailwind |
| Configuration | `tsconfig.json` | TypeScript configuration |
| Configuration | `vitest.config.ts` | Configuration for ViTest |

## License Compliance

**This project ONLY accepts dependencies with Apache 2.0 compatible licenses.** All dependencies must use licenses that are compatible with Apache 2.0 for government use.

### License Checking Script `scripts/check-licenses.js`

This script should be run:
- 📦 **After adding any new dependency**
- 🔄 **Before every release**

### Known Exceptions

**Approved transitive dependencies with legal review:**
- **`lightningcss` (MPL-2.0)** - Transitive dependency from Next.js/Turbopack
  - Cannot be removed without breaking core framework functionality
  - Overridden by TailwindCSS/PostCSS in our build pipeline
  - Not used in final application output

To run the license compatibility check:
```bash
npm run check-licenses
```

This script scans all dependencies (production + development) and:
- 📊 Identify Apache 2.0 compatible licenses
  - **Apache-2.0** - Same license
  - **MIT** - Permissive, fully compatible
  - **BSD-2-Clause, BSD-3-Clause** - Permissive, compatible
  - **ISC** - Permissive, compatible
  - **CC0-1.0, Unlicense, 0BSD** - Public domain equivalent
- ❌ **Block** incompatible licenses:
  - **GPL-2.0/3.0** - Copyleft, incompatible
  - **LGPL-2.1/3.0** - Weak copyleft, problematic
  - **AGPL-3.0** - Strong copyleft, incompatible
  - **MPL-2.0** - Weak copyleft, requires review
  - **EPL-1.0/2.0, CDDL-1.0/1.1** - Incompatible
- ❓ Flag unknown licenses for manual review

### Required Actions for License Issues

**If incompatible licenses are detected:**
1. **STOP** - Do not merge or deploy
2. **Replace** the dependency with an Apache 2.0 compatible alternative
3. **Remove** the dependency if not essential
4. **Contact legal team** only for critical dependencies with no alternatives

**For unknown/custom licenses:**
1. **Research** the license terms manually
2. **Replace** if terms are unclear or potentially incompatible
3. **Document** any legal team approvals
