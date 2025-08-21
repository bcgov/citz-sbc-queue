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
| Styling        | TailwindCSS v4 + BC Gov Theme, Headless UI |
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

---

## BC Government Standards

### Design System & Branding
- Follow **BC Government Design System** guidelines and standards
- Use **BC Government color palette**: `#013366` (blue), `#fcba19` (gold), `#ffffff` (white)
- Implement **BC Government typography** using BC Sans font family
- Maintain **consistent branding** with BC Government visual identity
- Include **BC Government logos** and assets from `/public/bcgov/` directory

### Font Integration
- Use **`@bcgov/bc-sans`** package for official BC Government typography
- Font weights available: Regular, Italic, Bold, BoldItalic
- Fonts served from `/public/fonts/` directory as WOFF2 files
- Follow **BC Sans usage guidelines** for government applications

### Government Requirements
- Ensure **bilingual considerations** for future French language support
- Follow **accessibility standards** required for government services (WCAG 2.1 AA)
- Implement **government-standard navigation** patterns and information architecture
- Consider **privacy and security** requirements for government applications

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
- **Accessibility-first development**:
  - Use semantic HTML elements by default
  - Include proper ARIA attributes for complex interactions
  - Ensure all interactive elements are keyboard accessible
  - Provide meaningful labels and descriptions
- Export:
  - Components: default export
  - Types, hooks, utils: named exports

---

## Styling & Accessibility

- Use **TailwindCSS v4** with custom BC Government theme for utility-first styles.
- BC Government design system implemented via custom CSS theme in `src/app/styles/bcgov/`:
  - `colours.css` - BC Gov color palette using `@theme` directive
  - `spacing.css` - BC Gov spacing standards
  - Custom color classes: `bg-blue`, `text-gold`, `bg-typography-primary`, etc.
- Use **Headless UI** for accessible unstyled components.
- **BC Sans font** integrated via `@bcgov/bc-sans` package.
- Follow **WCAG 2.1 AA** standards for all components:
  - **Semantic HTML**: Use proper elements (`button`, `nav`, `main`, `section`, etc.)
  - **Keyboard navigation**: All interactive elements must be keyboard accessible
  - **ARIA roles and labels**: Add `aria-label`, `aria-labelledby`, `aria-describedby` when needed
  - **Form accessibility**: Use `htmlFor`/`id` relationships or `aria-label` for inputs
  - **Focus indicators**: Ensure visible focus states for keyboard users
  - **Alt text**: Provide meaningful `alt` attributes for images, `alt=""` for decorative
  - **Color contrast**: Use BC Gov design system colors (meet 4.5:1 minimum contrast ratio)
  - **Heading hierarchy**: Maintain logical structure (h1 → h2 → h3, no skipping levels)
  - **Link purpose**: Make link text descriptive or add `aria-label`
  - **Screen reader support**: Test with assistive technologies in mind

---

## Testing Strategy

- **Vitest** for business logic (hooks, utils, stores).
- **Playwright** for user flows and accessibility testing.
- Skip unit testing of UI markup; ensure components are type-safe and logic lives in hooks.
- Organize tests with `describe()` blocks and use clear naming.
- **Include accessibility tests**: Validate WCAG 2.1 AA compliance in component tests
  - Test keyboard navigation and focus management
  - Verify ARIA labels and semantic structure
  - Check form labels and input associations
  - Validate color contrast and visual indicators

---

## State Management

- Global state → Zustand
- Local/component state → `useState` or custom hooks
- Add error handling directly in stores

---

## Authentication & Permissions

### Permissions System (SBCQ-17)
- Use **`usePermissions`** hook for role-based access control (RBAC)
- Supports **attribute-based access control (ABAC)** with contextual conditions
- **Type-safe permission checking** with TypeScript inference
- **Multi-resource evaluation** for batch permission checks
- Located in `src/app/hooks/usePermissions/` with comprehensive documentation

### Usage Patterns
```tsx
import { usePermissions } from '@/app/hooks/usePermissions';

// Basic permission check
const { hasPermission } = usePermissions({
  userRole: currentUser.role,
  context: { userId: currentUser.id },
  checks: [
    {
      resource: "appointment",
      data: { appointmentId, ownerId },
      actions: ["view", "edit"]
    }
  ]
});

// Conditional rendering
{hasPermission("appointment", "edit") && <EditButton />}
```

### Authentication Middleware
- **Next.js middleware** in `src/middleware/` handles authentication flows
- **Route protection** and user context management
- **JWT token validation** and refresh handling

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
- **Pull Request Guidelines**:
  - Use the **supplied PR template** (don't create custom formats)
  - **PR titles** should start with ticket number in square brackets: `[SBCQ-17] Description`
  - Write descriptions **for code reviewers** (short and concise)
  - **Include**:
    - Package/library changes (added, removed, updated dependencies)
    - Testing instructions for new functionality
    - Configuration file changes (env, project config)
    - Potential risks (security, performance, breaking changes)
  - **Don't include**:
    - File change lists (reviewers see the diff)
    - Test status reports ("all tests passing")
    - Verbose implementation details
- **Before creating PRs**:
  - Ensure test suites are passing
  - Check for TypeScript errors (`npm run type-check`)
  - Resolve linting issues (`npm run lint`)
  - Focus on **reviewer efficiency** and **actionable information**
