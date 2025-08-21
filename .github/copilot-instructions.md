# Copilot Instructions for CITZ SBC Queue Management

## Project Overview

This is a modern Service BC Queue Management System using Next.js App Router and React 19+. Focus areas:
- Accessibility (WCAG 2.1 AA)
- Performance (lazy loading, optimized images)
- Maintainability (modular, typed code)

---

## Tech Stack Summary

| Area           | Stack                                     |
|----------------|-------------------------------------------|
| Framework      | Next.js (App Router, Server Components)   |
| Styling        | TailwindCSS, BC Design Tokens, Headless UI |
| State          | Zustand (global), useState/hooks (local)  |
| Validation     | Zod (schemas for forms, server actions)   |
| Language       | TypeScript (strict mode, no `any`)        |
| Testing        | Vitest (unit/integration), Playwright (E2E) |
| Linting        | Biome (linting, formatting, import organization) |

---

## Architecture & Code Structure

### Folder Structure

```
src/
├── app/                 # Next.js App Router pages & routes
│   ├── administration/  # Admin pages
│   ├── api/            # API routes
│   ├── appointments/   # Appointment pages
│   ├── exam-inventory/ # Exam inventory pages
│   ├── hooks/          # App-specific React hooks
│   ├── queue/          # Queue management pages
│   ├── room-bookings/  # Room booking pages
│   └── styles/         # Global styles & BC Gov design system
├── components/         # Reusable UI components
├── middleware/         # Next.js middleware functions
├── stores/             # Zustand store definitions
├── test/               # Test utilities and setup
└── utils/              # Utility functions
```

> `middleware/` contains Next.js middleware for authentication, routing, etc.
> `src/app/styles/` contains BC Government design system CSS files.
> `src/app/hooks/` contains app-specific hooks like usePermissions.

---

## React + Next.js

- Use **React Server Components** and `use()` in client components for async data.
- Use **Server Actions** for all mutations and form submissions.
- Keep UI components purely presentational; move logic to `hooks/` and `utils/`.
- Await route parameters in server components:
  ```ts
  const { id } = await params;
  ```
- Use Image and Link from Next.js instead of native tags.

## TypeScript Practices

- Use `type` (not `interface`) for consistency.
- Avoid `any`; use `unknown`, `Record<string, unknown>`, etc.
- Prefer `Partial`, `Pick`, `Omit`, and discriminated unions.
- Always type props as `Props`, and all functions and stores explicitly.

---

## Code Quality & Formatting

### Biome Configuration
- Use **Biome** for linting, formatting, and import organization (not ESLint/Prettier)
- Follow the project's Biome configuration in `biome.json`
- Key formatting rules:
  - 2-space indentation
  - 100 character line width
  - Double quotes for JSX attributes
  - Trailing commas (ES5 style)
  - Node.js import protocol (`node:` prefix for builtins)
- Run `npm run lint` and `npm run format` before committing
- Biome will auto-fix many issues with `npm run lint:fix` and `npm run format`

### Code Style Guidelines
- Use `const` instead of `let` when possible
- Use template literals instead of string concatenation
- Use fragment syntax (`<>`) instead of `React.Fragment`
- Import types with `import type` syntax
- Use self-closing elements when appropriate
- Prefer explicit over implicit (avoid `any`, use proper typing)

---

## Component Guidelines

- Small, focused components.
- Separate all logic from JSX.
- Include proper loading and error states.
- Export:
  - Components: default export
  - Types, hooks, utils: named exports

---

## Styling & Accessibility

- Use **TailwindCSS** for utility-first styles.
- Use **Headless UI** for accessible unstyled components.
- Follow **WCAG 2.1 AA**:
  - Semantic HTML
  - Keyboard navigation
  - ARIA roles and screen reader support

---

## Testing Strategy

- **Vitest** for business logic (hooks, utils, stores).
- **Playwright** for user flows and accessibility testing.
- Skip unit testing of UI markup; ensure components are type-safe and logic lives in hooks.
- Organize tests with `describe()` blocks and use clear naming.

### Testing Issues & Troubleshooting

⚠️ **Important**: If you encounter issues writing tests (especially for API routes with environment variables), refer to `.github/copilot/TESTING.md` for detailed guidance on:
- Environment variable mocking with Vitest
- Dynamic import patterns for Next.js API routes
- Common testing pitfalls and their solutions
- Best practices for test isolation and cleanup

---

## State Management

- Global state → Zustand
- Local/component state → `useState` or custom hooks
- Add error handling directly in stores

---

## Naming Conventions

| Element         | Convention            |
|----------------|------------------------|
| Components      | `PascalCase`          |
| Functions/hooks | `camelCase`, `useXyz` |
| Props types     | `Props`               |
| Constants       | `SCREAMING_SNAKE_CASE`|
| Files           | `kebab-case`          |
| Store files     | `*.store.ts`          |

---

## Git & Dev Workflow

- Use **conventional commits**
- Create feature branches for new work
- PRs should:
  - Have meaningful descriptions
  - Include tests for new logic
  - Pass CI and follow the review process
