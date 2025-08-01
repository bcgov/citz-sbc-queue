# Copilot Instructions for CITZ SBC Queue Management

## Project Overview
This is a Service BC Queue Management System built with modern web technologies focusing on accessibility, performance, and maintainability.

## Tech Stack Guidelines

### Core Technologies
- **Next.js 15** with App Router and Turbopack bundler
- **TypeScript** for type safety
- **React 19** with functional components and hooks
- **Biome** for formatting and linting (primary)
- **ESLint** for additional linting rules

### Styling & Components
- **TailwindCSS** for utility-first styling
- **Headless UI** for accessible, unstyled components
- **Heroicons** for consistent iconography
- Follow BC Government design patterns and accessibility guidelines

### State Management & Validation
- **Zustand** for global state management
- **Zod** for schema validation (server actions, forms, API responses)
- Use server actions for form submissions and data mutations

### Testing
- **Vitest** for unit and integration tests
- **Testing Library** for React component testing
- **Playwright** for end-to-end testing
- Aim for high test coverage on critical business logic

## Development Principles

### Code Quality
- Follow SOLID and DRY principles
- Use functional components with hooks exclusively
- Implement proper error boundaries and error handling
- Write self-documenting code with meaningful names

### TypeScript Guidelines
- Enable strict mode settings
- Use proper typing for all functions, components, and state
- Leverage union types, discriminated unions, and generics appropriately
- Avoid `any` type; use `unknown` or proper typing instead

### React Patterns
- Use custom hooks for reusable logic
- Implement proper component composition
- Follow React best practices for performance (useMemo, useCallback when needed)
- Use React 19 features like `use()` hook appropriately

### Accessibility
- Follow WCAG 2.1 AA standards
- Use semantic HTML elements
- Implement proper ARIA attributes
- Ensure keyboard navigation works correctly
- Test with screen readers

### Performance
- Implement code splitting and lazy loading
- Optimize images and assets
- Use React Server Components when appropriate
- Monitor and optimize Core Web Vitals

## File Structure
```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── stores/             # Zustand store definitions
├── types/              # TypeScript type definitions
├── utils/              # Helper functions
└── test/               # Test utilities and setup
```

## Naming Conventions
- Use PascalCase for components and types
- Use camelCase for functions, variables, and hooks
- Use kebab-case for file names
- Use SCREAMING_SNAKE_CASE for constants
- Prefix custom hooks with "use"
- Suffix store files with ".store.ts"

## Component Guidelines
- Keep components small and focused
- Use TypeScript interfaces for props
- Export components as default exports
- Include JSDoc comments for complex components
- Implement proper loading and error states

## State Management
- Use Zustand for global state that needs to be shared across components
- Keep local state with useState for component-specific data
- Use server state management for API data
- Implement proper error handling in stores

## API & Data Handling
- Use server actions for mutations
- Implement proper validation with Zod schemas
- Handle loading and error states consistently
- Use proper TypeScript types for API responses

## Testing Guidelines
- Write tests for all business logic
- Test user interactions and accessibility
- Mock external dependencies appropriately
- Use descriptive test names and organize with describe blocks
- Maintain test coverage above 80%

## Git & Development Workflow
- Use conventional commit messages
- Create feature branches for new work
- Write meaningful pull request descriptions
- Ensure all tests pass before merging
- Follow the established review process

## Browser Support
- Support modern browsers (Chrome, Firefox, Safari, Edge)
- Ensure mobile responsiveness
- Test across different screen sizes and devices
- Implement progressive enhancement where appropriate

Remember to always prioritize accessibility, performance, and maintainability in your code suggestions and implementations.
