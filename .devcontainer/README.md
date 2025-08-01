# DevContainer Configuration

This project is configured to work with Visual Studio Code DevContainers using Podman, providing a consistent development environment across different machines.

## Prerequisites

- [Podman](https://podman.io/getting-started/installation)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- Repository cloned locally

### Podman Configuration

1. [Install Podman](https://podman.io/getting-started/installation) Desktop or CLI
2. Start Podman machine:
   ```bash
   podman machine init
   podman machine start
   ```
3. Configure VS Code to use [Podman with DevContainers](https://code.visualstudio.com/remote/advancedcontainers/docker-options#_podman) by updating your VS Code `settings.json`:
   ```json
   {
     "dev.containers.dockerPath": "podman",
     "dev.containers.dockerComposePath": "podman-compose"
   }
   ```

#### Alternative: Using Docker Socket Compatibility

If you prefer, you can enable Docker socket compatibility:
```bash
# On Windows with Podman Desktop
podman system service --time=0 tcp://localhost:2375

# Or use the Docker-compatible socket
export DOCKER_HOST=unix:///tmp/podman.sock
```

## Getting Started

1. Install and follow all steps as listed in [Prerequisites](#prerequisites) listed above
2. Open the project in VS Code
3. If prompted, click "Reopen in Container"
   - If no prompt appears use the Command Palette (`<Ctrl|Cmd>+Shift+P`) and run "Dev Containers: Reopen in Container"
4. Wait for the container to build and start

## What's Included

The DevContainer includes:

- **Node.js 20 LTS** - Latest stable Node.js version
- **TypeScript** - For type-safe development
- **VS Code Extensions**:
  - VS Code built-in extensions:
    - JSON formatting: `ms-vscode.vscode-json`
    - ESLint extension: `ms-vscode.vscode-eslint`
  - Biome integration: [`biomejs.biome`](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)
- **Optional VS Code Extensions**:
  > **Note:** that the following are not required for the DevContainer to run but they may be seen as 'nice to have features'.
  > These have been left in `devcontainer.json:"customizations":"vscode":"extensions"` but can be commented out if they are not desired
  - Additional TypeScript support with [`ms-vscode.vscode-typescript-next`](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-next)
  - Additional features for Playwright in VS Code: [`ms-playwright.playwright`](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)
  - Auto rename paired HTML/XML tags: [`formulahendry.auto-rename-tag`](https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-rename-tag)
  - Autocomplete file names: [`christian-kohler.path-intellisense`](https://marketplace.visualstudio.com/items?itemName=christian-kohler.path-intellisense)
  - Intelligent Tailwind CSS tooling: [`bradlc.vscode-tailwindcss`](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
  - Vitest testing support: [`vitest.explorer`](https://marketplace.visualstudio.com/items?itemName=vitest.explorer)
  - GitHub Copilot (if available)
    - [`GitHub.copilot`](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot)
    - [`GitHub.copilot-chat`](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot-chat)

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

## Commands

Once the container is running, you can use commands as referenced in `/README.md`

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
     - See [Podman Configuration](#podman-configuration)
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
