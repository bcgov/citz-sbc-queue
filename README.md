# citz-sbc-queue
Service BC Queue Management

## Development Team
- Scott
- Veenu
- Taylor
- Brady

## Tech Stack
- **Next.js** with TypeScript, App Router, and Turbopack bundler
- **Biome** for formatting and linting
- **Headless UI** + **TailwindCSS** for components and styling
- **Zod** for server action + form action validation
- **Zustand** for global state
- **Vitest** and **Playwright** for testing

## Development Environment

### DevContainer (Recommended)
This project includes a complete DevContainer configuration for consistent development environments:

- Pre-configured Node.js 20 LTS environment
- All necessary VS Code extensions
- Automatic dependency installation
- Port forwarding for development servers
- Biome formatting on save

**Quick Start with DevContainer:**
1. Install [Podman](https://podman.io/getting-started/installation) and [VS Code Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
2. Configure VS Code to use Podman (see setup instructions below)
3. Open project in VS Code
4. Click "Reopen in Container" when prompted
5. Start developing!

**Automated Setup:**
Run the setup script to configure Podman automatically:
```bash
bash .devcontainer/setup-podman.sh
```

See [.devcontainer/README.md](.devcontainer/README.md) for detailed setup instructions.

## Project Configuration
- `.gitattributes` - Line ending specifications (LF for all text files)
- `.editorconfig` - Cross-platform editor configuration
- `.vscode/settings.json` - Editor and linter configuration
- `.npmrc` - Strict npm install versions
- `biome.json` - Biome formatter/linter settings
- `tsconfig.json` - TypeScript configuration
- Copilot instructions for AI assistance

## License Compliance

**This project ONLY accepts dependencies with Apache 2.0 compatible licenses.** All dependencies must use licenses that are compatible with Apache 2.0 for government use.

### License Checking Script

Run the license compatibility check:
```bash
npm run check-licenses
```

This script will:
- ✅ Scan all dependencies (production + development)
- 📊 Identify Apache 2.0 compatible licenses
- ❌ **Block** incompatible licenses (GPL, LGPL, etc.)
- ❓ Flag unknown licenses for manual review

### Accepted Compatible Licenses

**Only these licenses are permitted** (✅ Apache 2.0 compatible):
- **Apache-2.0** - Same license
- **MIT** - Permissive, fully compatible
- **BSD-2-Clause, BSD-3-Clause** - Permissive, compatible
- **ISC** - Permissive, compatible
- **CC0-1.0, Unlicense, 0BSD** - Public domain equivalent

### Prohibited Licenses

**These licenses are NOT allowed** (❌ Incompatible):
- **GPL-2.0/3.0** - Copyleft, incompatible
- **LGPL-2.1/3.0** - Weak copyleft, problematic
- **AGPL-3.0** - Strong copyleft, incompatible
- **MPL-2.0** - Weak copyleft, requires review
- **EPL-1.0/2.0, CDDL-1.0/1.1** - Incompatible

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

### Mandatory License Checks

Run license checks:
- 📦 **Before adding any new dependency**
- 🔄 **Before every release**
- 📅 **Weekly during development**
- 🚫 **Dependencies with incompatible licenses will be rejected**

## Cross-Platform Development
This project is configured for seamless development across Mac and PC:
- **Line endings**: Normalized to LF (Unix-style) for all text files
- **Editor settings**: Consistent indentation and formatting via EditorConfig
- **Git normalization**: Automatic line ending conversion via `.gitattributes`
- **DevContainer**: Consistent environment regardless of host OS

## Development Considerations
- Biome linting enforced on pull requests
- SOLID and DRY principles
- Functional components with hooks
- Comprehensive testing with Vitest and Playwright
