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
