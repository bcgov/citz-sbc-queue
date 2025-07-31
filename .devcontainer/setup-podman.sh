#!/bin/bash

# DevContainer Setup Script for Podman
# This script helps configure your environment for DevContainer development with Podman

set -e

echo "🚀 Setting up DevContainer environment with Podman..."

# Check if Podman is installed
if ! command -v podman &> /dev/null; then
    echo "❌ Podman is not installed. Please install Podman first:"
    echo "   https://podman.io/getting-started/installation"
    exit 1
fi

echo "✅ Podman is installed"

# Check if Podman machine exists (for Windows/macOS)
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" || "$OSTYPE" == "darwin"* ]]; then
    echo "🔧 Checking Podman machine status..."

    if ! podman machine list | grep -q "Currently running"; then
        echo "🔄 Starting Podman machine..."
        if ! podman machine list | grep -q "podman-machine-default"; then
            echo "🆕 Initializing Podman machine..."
            podman machine init
        fi
        podman machine start
    else
        echo "✅ Podman machine is already running"
    fi
fi

# Check if VS Code is available and add settings
if command -v code &> /dev/null; then
    echo "🔧 Configuring VS Code settings for Podman..."

    # Create VS Code user settings directory if it doesn't exist
    VSCODE_SETTINGS_DIR=""
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        VSCODE_SETTINGS_DIR="$APPDATA/Code/User"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        VSCODE_SETTINGS_DIR="$HOME/Library/Application Support/Code/User"
    else
        VSCODE_SETTINGS_DIR="$HOME/.config/Code/User"
    fi

    mkdir -p "$VSCODE_SETTINGS_DIR"

    # Check if settings.json exists and add Podman configuration
    SETTINGS_FILE="$VSCODE_SETTINGS_DIR/settings.json"
    if [[ -f "$SETTINGS_FILE" ]]; then
        echo "📝 VS Code settings.json found. Please manually add these settings:"
        echo '   "dev.containers.dockerPath": "podman",'
        echo '   "dev.containers.dockerComposePath": "podman-compose"'
    else
        echo "📝 Creating VS Code settings.json with Podman configuration..."
        cat > "$SETTINGS_FILE" << EOF
{
  "dev.containers.dockerPath": "podman",
  "dev.containers.dockerComposePath": "podman-compose"
}
EOF
    fi
else
    echo "⚠️  VS Code not found in PATH. Please install VS Code and the Dev Containers extension."
fi

# Configure Git settings
echo "🔧 Configuring Git settings..."
git config --global user.name "STOEWS"
git config --global user.email "scott.toews@gov.bc.ca"
git config --global --add safe.directory /workspace
echo "✅ Git configured with username: STOEWS and email: scott.toews@gov.bc.ca"

echo ""
echo "🎉 Setup complete! You can now:"
echo "   1. Open this project in VS Code"
echo "   2. Install the Dev Containers extension if you haven't already"
echo "   3. Click 'Reopen in Container' when prompted"
echo ""
echo "🔍 Useful commands:"
echo "   podman info          - Check Podman status"
echo "   podman machine start - Start Podman machine (Windows/macOS)"
echo "   podman ps           - List running containers"
echo "   podman system prune - Clean up unused resources"
