# AI Assisted Dependencies Report

> **Instructions for GitHub Copilot:** When asked to update this file, please:
> 1. Check the latest versions of all packages listed in package.json using npm registry data
>    - Use this command to check multiple packages efficiently:
>    ```bash
>    for pkg in next react react-dom typescript @headlessui/react zod zustand postcss; do echo "$pkg: $(npm show $pkg version)"; done
>    ```
> 2. Update the version comparison emojis: 🟢 (current), 🟡 (1-2 minor behind), 🔴 (major version behind)
> 3. Update the summary section with any major framework updates (Next.js, React, TypeScript, TailwindCSS)
> 4. For major framework updates, include key features and breaking changes
> 5. Keep the format concise and maintain the emoji legend

## Summary

🟡 **Minor updates available for some dependencies**

- **Next.js:** Minor update available (15.4.5 → 15.4.6)
- **Zod:** Minor update available (4.0.14 → 4.0.15)
- **PostCSS:** Minor update available (8.5.2 → 8.5.6)
- Several dev dependencies have minor updates available

All major frameworks are current or have only minor updates.

---

## Emoji Legend

- 🟢 **Current** - Latest version
- 🟡 **Minor Update Available** - 1-2 minor versions behind
- 🔴 **Major Update Required** - Major version behind or significant updates available

---

## Production Dependencies

| Package | Current | Latest | Status | Description |
|---------|---------|--------|--------|-------------|
| `next` | 15.4.5 | 15.4.6 | 🟡 | React framework with SSR and App Router |
| `react` | 19.1.1 | 19.1.1 | 🟢 | UI library with React 19 features |
| `react-dom` | 19.1.1 | 19.1.1 | 🟢 | React DOM rendering |
| `typescript` | 5.9.2 | 5.9.2 | 🟢 | Static type checking |
| `@headlessui/react` | 2.2.7 | 2.2.7 | 🟢 | Unstyled accessible UI components |
| `@bcgov/bc-sans` | 2.1.0 | 2.1.0 | 🟢 | BC Government font package |
| `@tailwindcss/postcss` | 4.1.11 | 4.1.11 | 🟢 | TailwindCSS PostCSS plugin |
| `postcss` | 8.5.2 | 8.5.6 | 🟡 | CSS post-processor |
| `zod` | 4.0.14 | 4.0.15 | 🟡 | Schema validation library |
| `zustand` | 5.0.7 | 5.0.7 | 🟢 | Lightweight state management |

## Development Dependencies

| Package | Current | Latest | Status | Description |
|---------|---------|--------|--------|-------------|
| `@biomejs/biome` | 2.1.3 | 2.1.3 | 🟢 | Fast linter and formatter |
| `@playwright/test` | 1.54.1 | 1.54.2 | 🟡 | E2E testing framework |
| `@testing-library/react` | 16.3.0 | 16.3.0 | 🟢 | React testing utilities |
| `@testing-library/jest-dom` | 6.6.4 | 6.6.4 | 🟢 | Jest DOM matchers |
| `@testing-library/user-event` | 14.5.2 | 14.6.1 | 🟡 | User interaction testing |
| `@vitejs/plugin-react` | 4.3.4 | 4.7.0 | 🟡 | Vite React plugin |
| `@vitest/coverage-v8` | 3.2.4 | 3.2.4 | 🟢 | Test coverage reporting |
| `@vitest/ui` | 3.2.4 | 3.2.4 | 🟢 | Vitest UI interface |
| `vitest` | 3.2.4 | 3.2.4 | 🟢 | Fast unit testing framework |
| `tailwindcss` | 4.1.11 | 4.1.11 | 🟢 | Utility-first CSS framework |
| `@tailwindcss/aspect-ratio` | 0.4.2 | 0.4.2 | 🟢 | TailwindCSS aspect ratio utilities |
| `@tailwindcss/forms` | 0.5.9 | 0.5.10 | 🟡 | TailwindCSS form styling |
| `@tailwindcss/typography` | 0.5.15 | 0.5.16 | 🟡 | TailwindCSS typography plugin |
| `@types/node` | 24.1.0 | 24.2.0 | 🟡 | Node.js type definitions |
| `@types/react` | 19.1.9 | 19.1.9 | 🟢 | React type definitions |
| `@types/react-dom` | 19.1.7 | 19.1.7 | 🟢 | React DOM type definitions |
| `jsdom` | 26.0.0 | 26.1.0 | 🟡 | DOM implementation for testing |
| `license-checker` | 25.0.1 | 25.0.1 | 🟢 | License compliance checking |

---

## Major Framework Status

### Next.js 15.x
- 🟡 **Minor Update Available:** Using Next.js 15.4.5 → 15.4.6 available
- **Key Features:** Turbopack, Server Components, improved performance

### React 19.x
- ✅ **Current:** Using React 19.1.1
- **Key Features:** React Compiler, Server Components, enhanced hooks

### TypeScript 5.x
- ✅ **Current:** Using TypeScript 5.9.2
- **Key Features:** Improved performance, better type inference

### TailwindCSS 4.x
- ✅ **Current:** Using TailwindCSS 4.1.11
- **Key Features:** Oxide engine, improved performance, new syntax

---

*Last updated: August 6, 2025 - Dependencies checked and updated with latest versions*
