# Development Container Setup

This project includes a development container configuration that provides a complete development environment with:
- Next.js development server
- PostgreSQL database
- RabbitMQ message broker

## Prerequisites

### For Docker Users
- Docker Desktop or Docker Engine
- VS Code with the Dev Containers extension

### For Podman Users (Recommended for Linux/macOS)
- Podman with podman-compose
- VS Code with the Dev Containers extension

### For Windows Users with Podman
- Podman Desktop or Podman CLI installed on Windows (not in WSL)
- VS Code with the Dev Containers extension
- **Important**: If using WSL, ensure Podman is installed on Windows host, not inside WSL
- You may need to disable WSL integration in VS Code if Podman is not available in your WSL distribution

## Podman Setup

### Windows-Specific Setup

For Windows users, Podman should be installed on the Windows host system, not inside WSL:

1. **Install Podman Desktop** or **Podman CLI** on Windows
2. **If using WSL**: Ensure VS Code is using the Windows installation of Podman, not a WSL distribution
3. **Disable WSL integration** in VS Code if Podman is not installed in your WSL environment:
   - Open VS Code settings (`Ctrl+,`)
   - Search for "dev.containers.executeInWSL"
   - Set `Dev Containers: Execute In WSL` to **false** (unchecked)
   - Search for "dev.containers.mountWaylandSocket"
   - Set `Dev Containers: Mount Wayland Socket` to **false** (unchecked)
   - Optionally, also change "terminal.integrated.defaultProfile" to use PowerShell or Command Prompt instead of WSL
   - Alternatively, install Podman in your WSL distribution

### Configure Podman for Dev Containers

1. **Start Podman machine** (macOS/Windows):
   ```bash
   podman machine init
   podman machine start
   ```

2. **Enable Podman socket** (Linux):
   ```bash
   systemctl --user enable --now podman.socket
   ```

3. **Configure VS Code to use Podman**:
   Add this to your VS Code settings.json:
   ```json
   {
     "dev.containers.dockerPath": "podman",
     "dev.containers.dockerComposePath": "podman-compose"
   }
   ```
   **Note**: This can only be set in user settings, not in project level scope.

## Getting Started

**Reopen in Container**:
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
   - Type "Dev Containers: Reopen in Container"
   - Select the command and wait for the container to build

## Services

The development environment includes:

### Next.js Application
- **Port**: 3000
- **URL**: http://localhost:3000
- Automatically starts in development mode with hot reload

### PostgreSQL Database
- **Port**: 5432
- **Database**: sbc_queue
- **Username**: postgres
- **Password**: postgres
- **Connection String**: `postgresql://postgres:postgres@localhost:5432/sbc_queue`

### RabbitMQ Message Broker
- **AMQP Port**: 5672
- **Management UI Port**: 15672
- **Management URL**: http://localhost:15672
- **Username**: guest
- **Password**: guest

## Development Commands

Once inside the container, you can run:

```bash
# Start the development server
npm run dev

# Run tests
npm test

# Run end-to-end tests
npm run test:e2e
```

## Environment Variables

The following environment variables are automatically configured:

- `NODE_ENV=development`
- `DATABASE_URL=postgresql://postgres:postgres@postgres:5432/sbc_queue`
- `RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672`

## Troubleshooting

### Podman Issues

1. **Permission errors**: Make sure Podman is running with proper permissions
2. **Port conflicts**: Ensure ports 3000, 5432, 5672, and 15672 are not in use
3. **Volume mounting issues**: On SELinux systems, you may need to configure volume mounting with `:Z` suffix

### Windows/WSL Issues

1. **Podman not found in WSL**: Install Podman on Windows host or install Podman in your WSL distribution
2. **Dev Containers trying to use WSL**: Disable `Dev Containers: Execute In WSL` setting in VS Code (`dev.containers.executeInWSL: false`)

### Container Build Issues

1. **Clear Podman cache**:
   ```bash
   podman system prune -a
   ```

2. **Rebuild containers**:
   ```bash
   podman-compose down -v
   podman-compose build --no-cache
   ```

### VS Code Issues

1. **Install Dev Containers extension**: Make sure you have the official Dev Containers extension installed
2. **Restart VS Code**: Sometimes a restart resolves connection issues
3. **Check logs**: Use `View > Output > Dev Containers` to see detailed logs

## Accessing Services

- **Next.js App**: http://localhost:3000
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)
- **PostgreSQL**: localhost:5432 (postgres/postgres)

## Data Persistence

- PostgreSQL data is persisted in a named volume `postgres_data`
- RabbitMQ data is persisted in a named volume `rabbitmq_data`
- Node modules are cached in a named volume `node_modules` for faster rebuilds

## Development Tips

1. **Code changes** are automatically reflected due to volume mounting
2. **Database schema changes** may require manual migration commands
3. **Package changes** require container rebuild or manual npm install
4. **Use the integrated terminal** in VS Code for the best experience
