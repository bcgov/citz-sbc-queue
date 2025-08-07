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
| **Vitest** & **Playwright** | Testing |

## Development Environment

## DevContainers

See [.devcontainer/README.md](.devcontainer/README.md) for detailed setup instructions.

## Alternative

To run the applicaiton without DevContainers please follow these steps:

TODO: Add steps to run locally without DevContainers

## Directory Information

| Type | File Path | Description |
| ---- | --------- | ----------- |
| Directory | `.devcontainer` | Settings, information, and configuration of DevContainer. See `.devcontainer/README.md` for detailed information |
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
| Configuration | `playwright.config.ts` | Configuration for Playwright |
| Configuration | `postcss.config.mjs` | Used to add Tailwind to project |
| Configuration | `README.md` | This document |
| Configuration | `tailwind.config.ts` | Defines styling configuration and theme for Tailwind |
| Configuration | `tsconfig.json` | TypeScript configuration |
| Configuration | `vitest.config.ts` | Configuration for ViTest |


## Common Podman Commands

```bash
# Check Podman status
podman info

# Start/stop Podman machine (Windows/macOS)
podman machine start
podman machine stop

# List running containers
podman ps

# Clean up resources
podman system prune -a
```

## License Compliance

**This project ONLY accepts dependencies with Apache 2.0 compatible licenses.** All dependencies must use licenses that are compatible with Apache 2.0 for government use.

### License Checking Script `scripts/check-licenses.js`

This script will be run:
- 📦 **Before adding any new dependency**
- 🔄 **Before every release**
- 📅 **Weekly during development**
- 🚫 **Dependencies with incompatible licenses will be rejected**

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
