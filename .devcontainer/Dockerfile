# Use Node.js LTS version
FROM mcr.microsoft.com/devcontainers/javascript-node:1-20-bullseye

# Set working directory
WORKDIR /workspace

# Install global packages
RUN npm install -g npm@latest \
    && npm install -g @biomejs/biome \
    && npm install -g typescript \
    && npm install -g @types/node \
    && npm install -g vitest \
    && npx playwright install-deps

# Install additional system dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        git \
        curl \
        wget \
        unzip \
        ca-certificates \
        gnupg \
        lsb-release \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Configure git to trust the workspace directory and set default user
RUN git config --global --add safe.directory /workspace \
    && git config --global user.name "STOEWS" \
    && git config --global user.email "scott.toews@gov.bc.ca"

# Set user permissions
RUN chown -R node:node /workspace
USER node

# Expose ports
EXPOSE 3000 3001 51204
