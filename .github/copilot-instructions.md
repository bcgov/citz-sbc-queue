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
├── app/                # Next.js App Router pages & routes
├── components/         # Reusable UI components
├── hooks/              # App-specific React hooks
├── middleware/         # Next.js middleware functions
├── stores/             # Zustand store definitions
├── styles/             # Global styles & BC Gov design system
├── test/               # Test utilities and setup
└── utils/              # Utility functions
```



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
Follow **BC Government Design System** guidelines and standards
- Use **predefined BC Government color classes** from `src/styles/bcgov/colours.css`
  - Avoid hardcoding hex values - use the Tailwind-integrated color classes
- Use **predefined BC Government button classes** from `src/styles/bcgov/components.css`
  - Most commonly used button classes are `primary` and `secondary`


### Government Requirements
- Ensure **bilingual considerations** for future French language support
- Follow **accessibility standards** required for government services (WCAG 2.1 AA)
- Implement **government-standard navigation** patterns and information architecture
- Consider **privacy and security** requirements for government applications

---

## TypeScript Practices

- Use `type` (not `interface`) for consistency.
- Avoid `any`; use `unknown`, `Record<string, unknown>`, etc.
- Prefer `Partial`, `Pick`, `Omit`, and discriminated unions.
- Always type component props as `<component-name>Props`, such as `LoginButtonProps` for the `LoginButton` component.
- **Function parameters**:
  - 1-2 parameters: Use individual parameters
  - 3+ parameters: Use object parameter for the remaining parameters
  - Example:
    ```tsx
    // Good: 1-2 parameters
    function validateUser(userId: string, role: string): boolean { }

    // Good: 3+ parameters use object
    function createAppointment(userId: string, options: {
      date: Date
      duration: number
      location: string
      notes?: string
    }): Appointment { }
    ```

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
- **Component props structure**:
  - Props type should be defined and exported within the component file
  - Props should be destructured within the component parameter list.
- **Accessibility-first development**:
  - Use semantic HTML elements by default
  - Include proper ARIA attributes for complex interactions
  - Ensure all interactive elements are keyboard accessible
  - Provide meaningful labels and descriptions
- Export:
  - Components: named and default export
  - Types, hooks, utils: named exports

---

## Styling & Accessibility

- Use **TailwindCSS v4** as the primary styling framework with utility-first approach
- Use BC Government design guidelines as listed above.
- **Styling approach**:
  - Prefer Tailwind utility classes for layout, spacing, and styling
  - Reference BC Gov colors from the predefined CSS file rather than hardcoding hex values
  - Use responsive design patterns with Tailwind's responsive prefixes
- Use **Headless UI** for accessible unstyled components.
- Follow **WCAG 2.1 AA** standards for all components:
  - **Semantic HTML**: Use proper elements (`button`, `nav`, `main`, `section`, etc.)
  - **Keyboard navigation**: All interactive elements must be keyboard accessible
  - **ARIA roles and labels**: Add `aria-label`, `aria-labelledby`, `aria-describedby` when needed
  - **Form accessibility**: Use `htmlFor`/`id` relationships or `aria-label` for inputs
  - **Focus indicators**: Ensure visible focus states for keyboard users
  - **Alt text**: Provide meaningful `alt` attributes for images, `alt=""` for decorative
  - **Heading hierarchy**: Maintain logical structure (h1 → h2 → h3, no skipping levels)
  - **Link purpose**: Make link text descriptive or add `aria-label`
  - **Screen reader support**: Test with assistive technologies in mind

---

## Testing Strategy

### Test Organization
- **Unit tests** - Co-located in the same folder as the code being tested
- **Integration & E2E tests** - Place in dedicated `tests/` folder
- **HTML components** - Do not require unit testing

### Testing Tools & Approach
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
- Use **`usePermissions`** hook for attribute-based access control (ABAC)
- Supports **attribute-based access control (ABAC)** with contextual conditions
- **Type-safe permission checking** with TypeScript inference
- **Multi-resource evaluation** for batch permission checks
- Located in `src/hooks/usePermissions/` with comprehensive documentation

### Usage Patterns
```tsx
import { usePermissions } from '@/hooks/usePermissions';

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

## Documentation Standards

### Inline Comments
- Use **sparingly** - Only when a smart non-developer wouldn't understand the code's purpose
- **Comment obscure patterns** - Regex, complex algorithms, or non-obvious logic
- **Avoid over-commenting** - Don't explain obvious functionality

### JSDoc Requirements
- **Exported functions only** - Functions exported beyond their folder require JSDoc
- **Helper functions exempt** - Internal/helper functions don't need JSDoc
- **Complete JSDoc format**:
  ```tsx
  /**
   * Validates user permissions for queue management actions.
   * @param userRole - The role of the current user
   * @param resource - The resource being accessed
   * @returns True if user has permission, false otherwise
   * @example
   * const canEdit = validatePermission('admin', 'appointment');
   */
  export function validatePermission(userRole: string, resource: string): boolean {
    // Implementation
  }
  ```

### Documentation Philosophy
- **Self-documenting code** - Write readable code that explains itself
- **Strategic documentation** - Focus on exported APIs and complex logic
- **Developer efficiency** - Avoid unnecessary documentation overhead

### README File Guidelines
- **Root level** - Project must have a README.md file
- **Optional for utilities/hooks** - Complex folders may have README if:
  - JSDoc examples are insufficient
  - Many or complex parameters/return values
  - Complex functionality requiring explanation
- **No README needed** - Page directories, tests, and component folders should not have README files

---

## Naming Conventions

| Element         | Convention            |
|----------------|------------------------|
| Components      | `PascalCase`          |
| Types           | `PascalCase`          |
| Functions/hooks | `camelCase`, `useXyz` |
| Variables       | `camelCase`           |
| Event handlers  | `handleClick`, `onSubmit` (internal vs props) |
| Boolean vars    | `isLoading`, `hasData`, `canEdit` (semantic prefixes) |
| Collections     | `users`, `appointments` (simple plural) |
| Files           | `camelCase`           |
| Folders         | `camelCase`           |
| Test files      | `*.test.ts`           |
| Constants       | `SCREAMING_SNAKE_CASE`|
| Environment vars| `SCREAMING_SNAKE_CASE`|
| Store files     | `*.store.ts`          |

---

## Git & Dev Workflow

- Use **conventional commits**
- Create feature branches for new work
- **Pull Request Guidelines**:
  - Use the **supplied PR template** (`.github/PULL_REQUEST_TEMPLATE.md`)
  - **PR titles** should start with ticket number in square brackets: `[SBCQ-17] Description`
  - **Summary section** should be **for code reviewers** (short and concise):
    - Explain **what** changed and **why**
    - Include JIRA link with correct ticket number
    - Focus on **reviewer efficiency** and **actionable information**
  - **Testing section** should include:
    - Manual testing instructions for new functionality
    - Any setup or configuration required
    - Specific test scenarios to validate
  - **Include in summary**:
    - Package/library changes (added, removed, updated dependencies)
    - Configuration file changes (env, project config)
    - Potential risks (security, performance, breaking changes)
  - **Don't include in summary**:
    - File change lists (reviewers see the diff)
    - Test status reports ("all tests passing")
    - Mentions of test coverage
    - Verbose implementation details
- **Before creating PRs**:
  - Ensure test suites are passing
  - Check for TypeScript errors (`npm run type-check`)
  - Resolve linting issues (`npm run lint`)
  - Focus on **reviewer efficiency** and **actionable information**
