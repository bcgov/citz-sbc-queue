# DevContainer Configuration

This project is configured to work with Visual Studio Code DevContainers using Podman, providing a consistent development environment across different machines.

## Prerequisites

- [Podman](https://podman.io/getting-started/installation)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

## Podman Setup for VS Code

### Windows Setup

1. Install Podman Desktop or Podman CLI
2. Start Podman machine:
   ```bash
   podman machine init
   podman machine start
   ```

3. Configure VS Code to use Podman by adding to your VS Code settings.json:
   ```json
   {
     "dev.containers.dockerPath": "podman",
     "dev.containers.dockerComposePath": "podman-compose"
   }
   ```

### Alternative: Using Docker Socket Compatibility

If you prefer, you can enable Docker socket compatibility:
```bash
# On Windows with Podman Desktop
podman system service --time=0 tcp://localhost:2375

# Or use the Docker-compatible socket
export DOCKER_HOST=unix:///tmp/podman.sock
```

## Getting Started

1. Clone the repository
2. Ensure Podman is running (`podman machine start` on Windows/macOS)
3. Open the project in VS Code
4. When prompted, click "Reopen in Container" or use the Command Palette (`Ctrl+Shift+P`) and run "Dev Containers: Reopen in Container"
5. Wait for the container to build and start
6. The development environment will be ready with all dependencies installed

## What's Included

The devcontainer includes:

- **Node.js 20 LTS** - Latest stable Node.js version
- **TypeScript** - For type-safe development
- **Biome** - Fast formatter and linter
- **Essential VS Code Extensions**:
  - TypeScript support
  - Biome integration
  - ESLint support
  - Vitest testing support
  - Playwright testing support
  - GitHub Copilot (if available)
  - And more development tools

## Development Features

- **Automatic dependency installation** via `postCreateCommand`
- **Port forwarding** for Next.js development server (3000, 3001, 51204)
- **Format on save** enabled with Biome
- **Git integration** with proper permissions and pre-configured user settings
- **Consistent settings** across all team members

## Ports

- **3000**: Next.js application
- **3001**: Additional development server (if needed)
- **51204**: Vitest UI for interactive testing

## Git Configuration

The DevContainer automatically configures Git with the following settings:
- **Username**: STOEWS
- **Email**: scott.toews@gov.bc.ca
- **Safe directory**: Workspace is added to Git's safe directory list

These settings are applied during container startup, ensuring consistent Git configuration across all development environments.

## Commands

Once the container is running, you can use standard npm commands:

```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run Vitest tests
npm run test:ui      # Run Vitest with UI
npm run test:e2e     # Run Playwright end-to-end tests
npm run lint         # Run linting
```

## Troubleshooting

If you encounter issues:

1. **Container won't start**:
   - Ensure Podman is running: `podman machine start`
   - Check Podman status: `podman info`
2. **Build failures**:
   - Rebuild the container: Command Palette → "Dev Containers: Rebuild Container"
   - Clear Podman cache: `podman system prune -a`
3. **VS Code can't find Podman**:
   - Verify Podman path in VS Code settings
   - Restart VS Code after installing Podman
4. **Permission issues**:
   - Ensure Podman machine has sufficient resources
   - Check rootless Podman configuration

### Common Podman Commands

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
